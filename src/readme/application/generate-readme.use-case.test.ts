import { describe, expect, it } from "vitest";
import type { AiGeneratorPort } from "../../ai/domain/ai-generator.port.js";
import type { RawProject, ProjectScannerPort } from "../../project/domain/project-scanner.port.js";
import { GenerateReadmeUseCase } from "./generate-readme.use-case.js";

const rawProject: RawProject = {
  pkg: { name: "demo", description: "Base description" },
  files: [],
  imports: {},
  sources: {},
  envExamples: {},
  packages: [],
};

const scanner: ProjectScannerPort = {
  scan: () => rawProject,
};

describe("GenerateReadmeUseCase", () => {
  it("adds validated AI enrichment to the deterministic README", async () => {
    const ai: AiGeneratorPort = {
      enrich: async () => ({
        description: "AI description",
        features: ["Evidence-based feature"],
        blockquote: "Generated from project evidence.",
      }),
    };

    const markdown = await new GenerateReadmeUseCase(scanner, ai).execute("/project", "en");

    expect(markdown).toContain("AI description");
    expect(markdown).toContain("Evidence-based feature");
    expect(markdown).toContain("> Generated from project evidence.");
  });

  it("keeps the deterministic README when AI returns no enrichment", async () => {
    const ai: AiGeneratorPort = {
      enrich: async () => ({}),
    };

    const markdown = await new GenerateReadmeUseCase(scanner, ai).execute("/project", "en");

    expect(markdown).toContain("Base description");
    expect(markdown).not.toContain("## ✨ Features");
  });

  it("uses Spanish AI prose when Spanish output is requested", async () => {
    const ai: AiGeneratorPort = {
      enrich: async (_info, lang) => {
        expect(lang).toBe("es");
        return { description: "Descripción traducida por la IA." };
      },
    };

    const markdown = await new GenerateReadmeUseCase(scanner, ai).execute("/project", "es");

    expect(markdown).toContain("Descripción traducida por la IA.");
    expect(markdown).not.toContain("Base description");
  });

  it("rejects Spanish output when Ollama cannot provide a translated description", async () => {
    const ai: AiGeneratorPort = {
      enrich: async () => ({}),
    };

    await expect(new GenerateReadmeUseCase(scanner, ai).execute("/project", "es")).rejects.toThrow(
      "Ollama no pudo traducir la descripción del proyecto al español.",
    );
  });
});
