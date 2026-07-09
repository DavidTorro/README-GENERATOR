import type { AiEnrichment, AiGeneratorPort } from "../domain/ai-generator.port.js";
import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";
import type { Config } from "./ai.config.js";

// Modelos locales tardan en generar; para un Ollama apagado falla en ms igualmente
const TIMEOUT_MS = 60_000;

// Forma de la respuesta de POST /api/generate con stream: false
interface OllamaResponse {
  response: string;
}

export class OllamaClient implements AiGeneratorPort {
  constructor(private readonly config: Config) {}

  // Contrato: NUNCA revienta. Cada tarea degrada por separado:
  // si el árbol falla, la descripción y las features sobreviven
  async enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment> {
    const text = await this.tryTask("text", async () =>
      this.parseTextEnrichment(await this.generate(this.buildTextPrompt(info, lang))),
    );
    const tree = await this.tryTask("tree comments", async () =>
      this.parseTreeEnrichment(await this.generate(this.buildTreePrompt(info, lang))),
    );
    return { ...text, ...tree };
  }

  // Ejecuta una tarea de IA; si falla, avisa por stderr y aporta {}
  private async tryTask(
    name: string,
    task: () => Promise<AiEnrichment>,
  ): Promise<AiEnrichment> {
    try {
      return await task();
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(`⚠️  AI ${name} failed (${reason}). Continuing without it.`);
      return {};
    }
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
    return Object.keys(comments).length > 0 ? { treeComments: comments } : {};
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
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Ollama replied ${res.status} ${res.statusText}`);
    const data = (await res.json()) as OllamaResponse;
    return data.response;
  }
}