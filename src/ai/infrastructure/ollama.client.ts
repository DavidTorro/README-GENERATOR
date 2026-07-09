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

  // Contrato: NUNCA revienta. Si la IA falla, avisa por stderr y devuelve {}
  async enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment> {
    try {
      const raw = await this.generate(this.buildPrompt(info, lang));
      return this.parseEnrichment(raw);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(`⚠️  AI unavailable (${reason}). Generating without it.`);
      return {};
    }
  }

    private buildPrompt(info: ProjectInfo, lang: Lang): string {
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

  // JSON válido ≠ JSON con la forma esperada: valida campo a campo desde unknown
  private parseEnrichment(raw: string): AiEnrichment {
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
}