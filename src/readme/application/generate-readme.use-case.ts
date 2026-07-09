import type { ProjectScannerPort } from "../../project/domain/project-scanner.port.js";
import { buildProjectInfo } from "../../project/domain/project.builder.js";
import type { AiGeneratorPort } from "../../ai/domain/ai-generator.port.js";
import type { Lang } from "../domain/i18n/index.js";
import { renderReadme } from "../domain/readme.render.js";

// Flujo completo: escanear → construir el modelo → enriquecer (opcional) → renderizar
export class GenerateReadmeUseCase {
  constructor(
    private readonly scanner: ProjectScannerPort,
    private readonly ai?: AiGeneratorPort,
  ) {}

  async execute(root: string, lang: Lang): Promise<string> {
    const raw = this.scanner.scan(root);
    let info = buildProjectInfo(raw, root);

    if (this.ai) {
      const extra = await this.ai.enrich(info, lang);
      // Copia con los aportes de la IA; ?? = si la IA no aportó, se queda lo que había
      info = {
        ...info,
        description: extra.description ?? info.description,
        features: extra.features ?? info.features,
        blockquote: extra.blockquote ?? info.blockquote,
      };
    }

    return renderReadme(info, lang);
  }
}