import type { AiEnrichment, AiGeneratorPort } from "../domain/ai-generator.port.js";
import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";
import type { Config } from "./ai.config.js";
import { buildMermaid } from "../../readme/domain/readme.mermaid.js";

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
    const architecture = await this.tryTask("architecture", async () =>
      this.parseArchitectureEnrichment(await this.generate(this.buildArchitecturePrompt(info, lang))),
    );
    return { ...text, ...tree, ...architecture };
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
    
  // ---- Tarea 3: diagrama de arquitectura + tabla de componentes ----

  private buildArchitecturePrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    return [
      `You are documenting the architecture of the project "${info.name}" (${info.description || "a software project"}) for its README.md, in ${language}.`,
      `Tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      `Project files: ${info.files.slice(0, 60).join(", ")}`,
      "",
      "Describe the architecture as a graph plus a table of components:",
      '- "subgraphs": 2 to 4 groups (layers or modules), each with 1 to 4 nodes. Each node has an "id" (short, lowercase letters only) and a "label" (short name, an emoji is welcome).',
      '- "edges": connections between node ids, with an optional short "label".',
      '- "components": 2 to 6 rows describing the main components: name, technology, one-line detail.',
      "- Base everything STRICTLY on the facts above. Do not invent components.",
      "",
      "Reply ONLY with a JSON object with this exact shape:",
      '{"subgraphs": [{"title": "🧠 Core", "nodes": [{"id": "cli", "label": "🖥️ CLI parser"}]}], "edges": [{"from": "cli", "to": "usecase", "label": "options"}], "components": [{"name": "cli", "tech": "TypeScript", "detail": "Parses arguments"}]}',
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

    const edges = (Array.isArray(parsed.edges) ? parsed.edges : [])
      .filter(isRecord)
      .flatMap((e) =>
        typeof e.from === "string" && typeof e.to === "string"
          ? [{ from: e.from, to: e.to, ...(typeof e.label === "string" ? { label: e.label } : {}) }]
          : [],
      );

    // Sin grafo con chicha no hay sección: mejor omitir que enseñar un diagrama vacío
    if (subgraphs.length === 0 || edges.length === 0) return {};

    const components = (Array.isArray(parsed.components) ? parsed.components : [])
      .filter(isRecord)
      .flatMap((c) =>
        typeof c.name === "string" && typeof c.tech === "string" && typeof c.detail === "string"
          ? [{ name: c.name.trim(), tech: c.tech.trim(), detail: c.detail.trim() }]
          : [],
      );

    return { architecture: { mermaid: buildMermaid({ subgraphs, edges }), components } };
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