import type { Architecture, ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";

// Lo que la IA puede aportar al README. Todo opcional a propósito:
// si un campo falta, la sección usa su versión sin IA (o no aparece).
export interface AiEnrichment {
  description?: string;
  features?: string[];
  blockquote?: string;
  treeComments?: Record<string, string>;
  // Arquitectura como FLUJO de runtime (rica); si la IA no la da, hay fallback determinista
  architecture?: Architecture;
}

export interface AiGeneratorPort {
  enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment>;
}
