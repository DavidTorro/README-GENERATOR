import type { ProjectScannerPort } from "../../project/domain/project-scanner.port.js";
import { buildProjectInfo } from "../../project/domain/project.builder.js";
import type { Lang } from "../domain/i18n/index.js";
import { renderReadme } from "../domain/readme.render.js";

// Flujo completo: escanear → construir el modelo → renderizar
export class GenerateReadmeUseCase {
  constructor(private readonly scanner: ProjectScannerPort) {}

  execute(root: string, lang: Lang): string {
    const raw = this.scanner.scan(root);
    const info = buildProjectInfo(raw, root);
    return renderReadme(info, lang);
  }
}