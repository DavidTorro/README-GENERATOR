import type { AiEnrichment, AiGeneratorPort } from "../domain/ai-generator.port.js";
import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";
import { buildMermaid } from "../../readme/domain/readme.mermaid.js";
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
        this.parseTreeEnrichment(await this.generate(this.buildTreePrompt(info, lang))),
      )) ?? {};
    const architecture =
      (await this.tryTask("architecture", async () =>
        this.parseArchitectureEnrichment(
          await this.generate(this.buildArchitecturePrompt(info, lang)),
        ),
      )) ?? {};
    return { ...text, ...tree, ...architecture };
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

  private parseTreeEnrichment(raw: string): AiEnrichment {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    const comments: Record<string, string> = {};
    for (const [path, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.trim() !== "") {
        // El modelo a veces devuelve "src/cli/": normalizamos sin slash final
        comments[path.replace(/\/+$/, "")] = value.trim().replace(/\s+/g, " ");
      }
    }

    // Listón de calidad: sin comentarios la tarea no vale (dispara el reintento)
    if (Object.keys(comments).length === 0) throw new Error("reply had no usable comments");
    return { treeComments: comments };
  }

  // ---- Tarea 3: diagrama de arquitectura + tabla de componentes ----

  private buildArchitecturePrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    return [
      `You are documenting the architecture of the project "${info.name}" (${info.description || "a software project"}) for its README.md, in ${language}.`,
      `Tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      `Project files: ${info.files.slice(0, 60).join(", ")}`,
      "",
      "Describe the architecture as a graph plus a table of components:",
      '- "subgraphs": 2 to 4 groups (layers or modules), each with 1 to 4 nodes. Cover ALL the main modules you can see in the project files. Each node has an "id" (short, lowercase letters only) and a "label" (short name, an emoji is welcome).',
      '- "nodes": 0 to 2 standalone actor nodes outside any group (e.g. the user, an external service).',
      '- "edges": at least 3 connections between declared node ids, with an optional short "label". Every edge must reference ids you declared.',
      '- "components": one row per main component (aim for 4 to 7): name, technology, one-line detail.',
      "- Base everything STRICTLY on the facts above. Do not invent components.",
      "",
      "Reply ONLY with a JSON object with this exact shape:",
      '{"subgraphs": [{"title": "🖥️ CLI", "nodes": [{"id": "parser", "label": "🖥️ Arg parser"}, {"id": "usecase", "label": "⚙️ Use case"}]}, {"title": "🧠 Services", "nodes": [{"id": "scanner", "label": "📂 File scanner"}, {"id": "renderer", "label": "📝 Renderer"}]}], "nodes": [{"id": "user", "label": "👤 User"}], "edges": [{"from": "user", "to": "parser"}, {"from": "parser", "to": "usecase", "label": "options"}, {"from": "usecase", "to": "scanner"}, {"from": "usecase", "to": "renderer"}], "components": [{"name": "cli", "tech": "TypeScript", "detail": "Parses arguments"}, {"name": "scanner", "tech": "Node.js", "detail": "Reads project files"}]}',
    ].join("\n");
  }

  // La IA aporta DATOS del grafo; el mermaid lo dibuja buildMermaid (sintaxis garantizada)
  private parseArchitectureEnrichment(raw: string): AiEnrichment {
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};

    const subgraphs = (Array.isArray(parsed.subgraphs) ? parsed.subgraphs : [])
      .filter(isRecord)
      .flatMap((sg) => {
        if (typeof sg.title !== "string") return [];
        const nodes = (Array.isArray(sg.nodes) ? sg.nodes : [])
          .filter(isRecord)
          .flatMap((n) =>
            typeof n.id === "string" && typeof n.label === "string"
              ? [{ id: n.id, label: n.label }]
              : [],
          );
        return nodes.length > 0 ? [{ title: sg.title, nodes }] : [];
      });

    const nodes = (Array.isArray(parsed.nodes) ? parsed.nodes : [])
      .filter(isRecord)
      .flatMap((n) =>
        typeof n.id === "string" && typeof n.label === "string"
          ? [{ id: n.id, label: n.label }]
          : [],
      );

    // Solo aceptamos flechas entre nodos DECLARADOS: un id fantasma
    // saldría como caja pelada en el diagrama
    const declared = new Set(
      [...subgraphs.flatMap((sg) => sg.nodes), ...nodes].map((n) => n.id),
    );
    const edges = (Array.isArray(parsed.edges) ? parsed.edges : [])
      .filter(isRecord)
      .flatMap((e) =>
        typeof e.from === "string" &&
        typeof e.to === "string" &&
        declared.has(e.from) &&
        declared.has(e.to)
          ? [{ from: e.from, to: e.to, ...(typeof e.label === "string" ? { label: e.label } : {}) }]
          : [],
      );

    // Listón de calidad: menos que esto no es un diagrama de arquitectura
    const totalNodes = subgraphs.reduce((sum, sg) => sum + sg.nodes.length, 0) + nodes.length;
    if (subgraphs.length < 2 || totalNodes < 4 || edges.length < 2) {
      throw new Error(
        `graph too thin (${subgraphs.length} groups, ${totalNodes} nodes, ${edges.length} edges)`,
      );
    }

    const components = (Array.isArray(parsed.components) ? parsed.components : [])
      .filter(isRecord)
      .flatMap((c) =>
        typeof c.name === "string" && typeof c.tech === "string" && typeof c.detail === "string"
          ? [{ name: c.name.trim(), tech: c.tech.trim(), detail: c.detail.trim() }]
          : [],
      );

    return { architecture: { mermaid: buildMermaid({ subgraphs, nodes, edges }), components } };
  }

  // ---- Tarea 4: diseño del banner ----
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

  private async generate(prompt: string): Promise<string> {
    const res = await fetch(`${this.config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.ollamaModel,
        prompt,
        stream: false,
        format: "json", // Ollama fuerza al modelo a emitir JSON válido
        options: { 
          temperature: 0.4,
          num_ctx: 8192, // holgura para prompts largos (60 ficheros + instrucciones)
          num_predict: 1500, // ninguna tarea necesita más; corta los bucles de whitespace
        }, // tareas estructuradas: obediencia > creatividad
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Ollama replied ${res.status} ${res.statusText}`);
    const data = (await res.json()) as OllamaResponse;
    return data.response;
  }
}