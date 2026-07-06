import type { ProjectScannerPort } from "../../domain/ports/project-scanner.port.js";
import { buildProjectInfo } from "../../domain/project/project.builder.js";
import type { Lang } from "../../domain/readme/i18n/index.js";
import { renderReadme } from "../../domain/readme/readme.render.js";

// Flujo completo: escanear → construir el modelo → renderizar
export class GenerateReadmeUseCase {
  constructor(private readonly scanner: ProjectScannerPort) {}

  execute(root: string, lang: Lang): string {
    const raw = this.scanner.scan(root);
    const info = buildProjectInfo(raw, root);
    return renderReadme(info, lang);
  }
}