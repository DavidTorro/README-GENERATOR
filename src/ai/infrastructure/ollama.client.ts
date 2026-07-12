import type { AiEnrichment, AiGeneratorPort } from "../domain/ai-generator.port.js";
import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";
import { BANNER_MOTIFS } from "../../readme/domain/readme.banner.js";
import type { BannerDesign, BannerMotif } from "../../readme/domain/readme.banner.js";
import type { Config } from "./ai.config.js";

// Modelos locales tardan en generar; para un Ollama apagado falla en ms igualmente
const TIMEOUT_MS = 120_000;

// Forma de la respuesta de POST /api/generate con stream: false
interface OllamaResponse {
  response: string;
}

export class OllamaClient implements AiGeneratorPort {
  constructor(private readonly config: Config) {}

  // Contrato: NUNCA revienta. Cada tarea degrada por separado:
  // si el árbol falla, la descripción y las features sobreviven
  async enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment> {
    const text =
      (await this.tryTask("text", async () =>
        this.parseTextEnrichment(await this.generate(this.buildTextPrompt(info, lang))),
      )) ?? {};
    const tree =
      (await this.tryTask("tree comments", async () =>
        this.parseTreeEnrichment(
          // la respuesta más larga de todas: un comentario por cada ruta
          await this.generate(this.buildTreePrompt(info, lang), 3000),
          info,
        ),
      )) ?? {};
    return { ...text, ...tree };
  }

  // Ejecuta una tarea de IA con un reintento; si falla dos veces, undefined.
  // Genérica: cada llamador decide qué tipo devuelve y cuál es su fallback
  private async tryTask<T>(name: string, task: () => Promise<T>): Promise<T | undefined> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await task();
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.error(
          `⚠️  AI ${name} attempt ${attempt} failed (${reason}).` +
            (attempt === 1 ? " Retrying..." : " Continuing without it."),
        );
      }
    }
    return undefined;
  }

  // ---- Tarea 1: descripción + features + blockquote ----

  private buildTextPrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    const scripts =
      Object.entries(info.scripts)
        .map(([name, cmd]) => `"${name}" runs \`${cmd}\``)
        .join("; ") || "(none)";
    return [
      `You are writing content for the README.md of a software project, in ${language}.`,
      "",
      "FACTS about the project (your ONLY source of truth):",
      `- Name: ${info.name}`,
      `- Current description: ${info.description || "(none)"}`,
      `- License: ${info.license ?? "(none)"}`,
      `- Package manager: ${info.packageManager}`,
      `- Detected tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      `- Dependencies: ${info.dependencies.join(", ") || "(none)"}`,
      `- Dev dependencies: ${info.devDependencies.join(", ") || "(none)"}`,
      `- npm scripts: ${scripts}`,
      `- Uses Docker: ${info.hasDocker ? "yes" : "no"}`,
      `- Project files: ${info.files.slice(0, 60).join(", ")}`,
      "",
      "RULES:",
      "- Base everything STRICTLY on the facts above. Do NOT invent features, integrations or capabilities they do not support.",
      "- Prefer fewer accurate features over many generic ones.",
      "- No marketing fluff: every sentence must say something concrete about THIS project.",
      "",
      "Reply ONLY with a JSON object with this exact shape:",
      '{"description": "2-3 engaging sentences describing the project", "features": ["3 to 6 bullet points, each starting with a fitting emoji"], "blockquote": "one punchy sentence highlighting the key selling point of the project (privacy, speed, simplicity...), starting with a fitting emoji"}',
    ].join("\n");
  }

  // JSON válido ≠ JSON con la forma esperada: valida campo a campo desde unknown
  private parseTextEnrichment(raw: string): AiEnrichment {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const obj = parsed as Record<string, unknown>;

    const enrichment: AiEnrichment = {};
    if (typeof obj.description === "string" && obj.description.trim() !== "") {
      enrichment.description = obj.description.trim();
    }
    if (Array.isArray(obj.features)) {
      const features = obj.features.filter(
        (f): f is string => typeof f === "string" && f.trim() !== "",
      );
      if (features.length > 0) enrichment.features = features;
    }
    if (typeof obj.blockquote === "string" && obj.blockquote.trim() !== "") {
      enrichment.blockquote = obj.blockquote.trim();
    }

    // Listón de calidad: sin descripción la tarea no vale (dispara el reintento)
    if (!enrichment.description) throw new Error("reply had no usable description");
    return enrichment;
  }

  // ---- Tarea 2: comentarios del árbol de estructura ----

  // Carpetas intermedias derivadas de los ficheros ("src/cli/x.ts" → "src", "src/cli")
  private treePaths(info: ProjectInfo): string[] {
    const dirs = new Set<string>();
    for (const file of info.files) {
      const parts = file.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    }
    return [...[...dirs].sort(), ...info.files].slice(0, 80);
  }

  private buildTreePrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    return [
      `You are documenting the file tree of the project "${info.name}" (${info.description || "a software project"}) for its README.md, in ${language}.`,
      `Tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      "",
      "PATHS:",
      ...this.treePaths(info).map((p) => `- ${p}`),
      "",
      "RULES:",
      "- Write a short comment (max 8 words) explaining the purpose of each path.",
      "- Base comments ONLY on the path names and the tech stack. If a path is not self-explanatory, write an honest generic comment instead of inventing details.",
      "",
      "Reply ONLY with a JSON object mapping each path to its comment, like:",
      '{"src": "Source code", "src/main.ts": "CLI entry point"}',
    ].join("\n");
  }

  private parseTreeEnrichment(raw: string, info: ProjectInfo): AiEnrichment {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    // Solo aceptamos claves que sean rutas reales del proyecto: qwen3 a veces
    // devuelve {"user": "<eco del prompt>"} o rutas inventadas
    const known = new Set(this.treePaths(info));
    const comments: Record<string, string> = {};
    for (const [path, value] of Object.entries(parsed)) {
      const clean = path.replace(/\/+$/, "");
      if (known.has(clean) && typeof value === "string" && value.trim() !== "") {
        comments[clean] = value.trim().replace(/\s+/g, " ");
      }
    }

    // Listón de calidad: si casi nada casa con rutas reales, la tarea no vale.
    // min() para no exigir 5 a un proyecto diminuto de 3 ficheros
    const minimum = Math.min(5, known.size);
    if (Object.keys(comments).length < minimum) {
      throw new Error(`only ${Object.keys(comments).length} comments matched real paths`);
    }
    return { treeComments: comments };
  }

  // ---- Tarea 3: diseño del banner ----
  // La IA solo TOMA DECISIONES (tono, motivo, densidad, tagline);
  // el SVG lo dibuja readme.banner.ts con sintaxis garantizada

  async bannerDesign(info: ProjectInfo, lang: Lang): Promise<BannerDesign | undefined> {
    return this.tryTask("banner design", async () =>
      this.parseBannerDesign(await this.generate(this.buildBannerDesignPrompt(info, lang))),
    );
  }

  private buildBannerDesignPrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    return [
      `You are the art director designing the README banner of the project "${info.name}".`,
      "",
      "FACTS about the project (your ONLY source of truth):",
      `- Current description: ${info.description || "(none)"}`,
      `- Tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      `- It is a CLI tool: ${info.binName ? "yes" : "no"}`,
      "",
      "Take exactly 3 design decisions:",
      '- "motif": background theme, one of "aurora" (soft drifting color blobs), "orbits" (rings with orbiting satellites), "waves" (flowing waves).',
      '- "density": "calm" or "lively" (amount of decoration).',
      `- "tagline": ONE sentence in ${language}, 60 to 130 characters, saying concretely what the project does. No emojis. Do NOT invent capabilities.`,
      "",
      "RULES:",
      "- Commit to a design with personality: different projects must get different designs. Do NOT default to safe choices.",
      "",
      'Reply ONLY with a JSON object with exactly these keys: "motif" (string), "density" (string), "tagline" (string).',
    ].join("\n");
  }

  private parseBannerDesign(raw: string): BannerDesign {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error("reply was not an object");
    const obj = parsed as Record<string, unknown>;

    const isMotif = (v: unknown): v is BannerMotif => BANNER_MOTIFS.includes(v as BannerMotif);
    const tagline = typeof obj.tagline === "string" ? obj.tagline.trim() : "";

    // Listones de calidad: decisión inválida = no hay diseño (dispara el reintento)
    if (!isMotif(obj.motif)) throw new Error("invalid motif");
    if (tagline.length < 20) throw new Error("reply had no usable tagline");

    return {
      motif: obj.motif,
      density: obj.density === "lively" ? "lively" : "calm",
      tagline,
    };
  }

  // ---- Transporte común ----

  private async generate(prompt: string, numPredict = 1500): Promise<string> {
    const res = await fetch(`${this.config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.ollamaModel,
        prompt,
        stream: false,
        format: "json", // Ollama fuerza al modelo a emitir JSON válido
        think: false, // sin esto, qwen3 "quiere pensar", format json no le deja, y a veces vomita el prompt como eco {"user": ...}
        options: {
          temperature: 0.4,
          num_ctx: 8192, // holgura para prompts largos (60 ficheros + instrucciones)
          num_predict: numPredict, // 1500 corta bucles de whitespace; tareas largas piden más
          seed: Math.trunc(Math.random() * 2_147_483_647), // sin seed, Ollama casi repite la respuesta: el reintento repetía el MISMO error
        }, // tareas estructuradas: obediencia > creatividad
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Ollama replied ${res.status} ${res.statusText}`);
    const data = (await res.json()) as OllamaResponse;
    return data.response;
  }
}