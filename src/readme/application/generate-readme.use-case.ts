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

    if (lang === "es" && !this.ai) {
      throw new Error("La generación en español requiere Ollama local para traducir el contenido del proyecto.");
    }

    if (this.ai) {
      const extra = await this.ai.enrich(info, lang);
      if (lang === "es" && !extra.description) {
        throw new Error("Ollama no pudo traducir la descripción del proyecto al español.");
      }
      // Copia con los aportes de la IA; ?? = si la IA no aportó, se queda lo que había
      info = {
        ...info,
        description: extra.description ?? info.description,
        features: extra.features ?? info.features,
        blockquote: extra.blockquote ?? info.blockquote,
        treeComments: extra.treeComments ?? info.treeComments,
        architecture: extra.architecture ?? info.architecture,
      };
    }

    return renderReadme(info, lang);
  }
}
