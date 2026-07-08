import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";

// Lo que la IA puede aportar al README. Todo opcional a propósito:
// si un campo falta, la sección usa su versión sin IA (o no aparece)
export interface AiEnrichment {
  description?: string;
  features?: string[];
}

// Contrato del generador con IA. Nadie fuera de este módulo sabrá que hay Ollama
export interface AiGeneratorPort {
  enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment>;
}