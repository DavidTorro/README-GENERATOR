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

const noBannerDesign = async () => undefined;

describe("GenerateReadmeUseCase", () => {
  it("adds validated AI enrichment to the deterministic README", async () => {
    const ai: AiGeneratorPort = {
      enrich: async () => ({
        description: "AI description",
        features: ["Evidence-based feature"],
        blockquote: "Generated from project evidence.",
      }),
      bannerDesign: noBannerDesign,
    };

    const markdown = await new GenerateReadmeUseCase(scanner, ai).execute("/project", "en");

    expect(markdown).toContain("AI description");
    expect(markdown).toContain("Evidence-based feature");
    expect(markdown).toContain("> Generated from project evidence.");
  });

  it("keeps the deterministic README when AI returns no enrichment", async () => {
    const ai: AiGeneratorPort = {
      enrich: async () => ({}),
      bannerDesign: noBannerDesign,
    };

    const markdown = await new GenerateReadmeUseCase(scanner, ai).execute("/project", "en");

    expect(markdown).toContain("Base description");
    expect(markdown).not.toContain("## ✨ Features");
  });
});
