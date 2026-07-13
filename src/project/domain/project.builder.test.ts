import { describe, expect, it } from "vitest";
import { renderReadme } from "../../readme/domain/readme.render.js";
import { buildProjectInfo } from "./project.builder.js";
import type { RawProject } from "./project-scanner.port.js";

const rawProject: RawProject = {
  pkg: {
    name: "@acme/demo",
    description: "A demo project",
    author: "Ada Lovelace <ada@example.com> (https://example.com)",
    repository: "github:acme/demo",
    homepage: "https://acme.example.com",
    scripts: { test: "vitest run" },
  },
  files: ["src/main.js", "src/lib/util.js", "src/components/index.jsx"],
  imports: {
    "src/main.js": ["./lib/util.js", "./components", "fast-glob"],
  },
  sources: {
    "src/main.js": 'import { util } from "./lib/util.js";',
    "src/lib/util.js": "export const util = true;",
    "src/components/index.jsx": "export const Component = () => null;",
  },
  envExamples: {
    ".env.example": "# Database connection\nDATABASE_URL=postgres://example\n\n# Enable detailed logs\nDEBUG=true",
    "backend/.env.example": "# API access token\nAPI_TOKEN=example-token",
  },
};

describe("buildProjectInfo", () => {
  it("preserves package metadata and resolves internal JavaScript imports", () => {
    const info = buildProjectInfo(rawProject, "/project");

    expect(info.author).toBe("Ada Lovelace");
    expect(info.repositoryUrl).toBe("https://github.com/acme/demo");
    expect(info.homepage).toBe("https://acme.example.com");
    expect(info.imports).toEqual({
      "src/main.js": ["src/lib/util.js", "src/components/index.jsx"],
    });
    expect(info.environment).toEqual([
      { source: ".env.example", name: "DATABASE_URL", description: "Database connection" },
      { source: ".env.example", name: "DEBUG", description: "Enable detailed logs" },
      { source: "backend/.env.example", name: "API_TOKEN", description: "API access token" },
    ]);
  });

  it("renders the detected author and links", () => {
    const markdown = renderReadme(buildProjectInfo(rawProject, "/project"), "en");

    expect(markdown).toContain("**Ada Lovelace**");
    expect(markdown).toContain("https://github.com/acme/demo");
    expect(markdown).toContain("https://acme.example.com");
    expect(markdown).toContain("DATABASE_URL");
    expect(markdown).toContain("backend/.env.example");
    expect(markdown).not.toContain("postgres://example");
  });
});
