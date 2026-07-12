import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";
import type { BannerDesign } from "../../readme/domain/readme.banner.js";

// Lo que la IA puede aportar al README. Todo opcional a propósito:
// si un campo falta, la sección usa su versión sin IA (o no aparece).
// La arquitectura ya NO la da la IA: se deriva de los imports reales (readme.architecture.ts).
export interface AiEnrichment {
  description?: string;
  features?: string[];
  blockquote?: string;
  treeComments?: Record<string, string>;
}

export interface AiGeneratorPort {
  enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment>;
  // Decisiones de diseño del banner (tagline en el idioma pedido); undefined si degrada
  bannerDesign(info: ProjectInfo, lang: Lang): Promise<BannerDesign | undefined>;
}