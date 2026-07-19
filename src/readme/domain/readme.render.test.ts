import { describe, expect, it } from "vitest";
import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import { renderReadme } from "./readme.render.js";

const project: ProjectInfo = {
  name: "demo",
  description: "A demo project",
  version: "1.0.0",
  scripts: {},
  engines: {},
  dependencies: [],
  devDependencies: [],
  packageManager: "npm",
  packageDirectories: [],
  hasDocker: false,
  files: [],
  environment: [],
  endpoints: [],
  imports: {},
  keySources: [],
  root: "/project",
  stack: [],
  features: [],
};

describe("renderReadme architecture", () => {
  it("omits architecture without AI enrichment", () => {
    expect(renderReadme(project, "en")).not.toContain("## 🏗️ Architecture");
  });

  it("renders architecture only when AI provides it", () => {
    const markdown = renderReadme(
      {
        ...project,
        architecture: {
          mermaid: "flowchart LR\n  user --> api",
          components: [{ name: "api", tech: "NestJS", detail: "HTTP API" }],
        },
      },
      "en",
    );

    expect(markdown).toContain("## 🏗️ Architecture");
    expect(markdown).toContain("flowchart LR");
  });

  it("renders Spanish labels without untranslated English section names", () => {
    const markdown = renderReadme(
      {
        ...project,
        scripts: { test: "vitest run" },
        endpoints: [{ method: "GET", path: "/health" }],
        stack: [
          { name: "Vitest", category: "testing" },
          { name: "tsup", category: "tooling" },
          { name: "React", category: "frontend" },
          { name: "Express", category: "backend" },
        ],
      },
      "es",
    );

    expect(markdown).toContain("## 📡 Puntos de acceso");
    expect(markdown).toContain("## 🧪 Pruebas");
    expect(markdown).toContain("**Herramientas**: tsup");
    expect(markdown).toContain("**Interfaz**: React");
    expect(markdown).toContain("**Servidor**: Express");
    expect(markdown).not.toContain("## 🛠️ Comandos");
  });
});
