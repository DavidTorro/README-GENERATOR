import { describe, expect, it } from "vitest";
import { getHelp, parseCliArgs } from "./cli.parser.js";

describe("parseCliArgs", () => {
  it("uses the README command and English defaults", () => {
    expect(parseCliArgs([])).toMatchObject({
      command: "readme",
      lang: "en",
      output: "README.md",
      ai: false,
      dryRun: false,
      force: false,
      all: false,
    });
  });

  it("parses the banner command with its flags", () => {
    expect(parseCliArgs(["banner", "es", "--dry-run", "--force"])).toMatchObject({
      command: "banner",
      lang: "es",
      ai: false,
      dryRun: true,
      force: true,
    });
  });

  it("parses the mermaid command with its language", () => {
    expect(parseCliArgs(["mermaid", "es", "--dry-run"])).toMatchObject({
      command: "mermaid",
      lang: "es",
      dryRun: true,
    });
  });

  it("parses --all only for complete README generation", () => {
    expect(parseCliArgs(["es", "--force", "--all"])).toMatchObject({ command: "readme", force: true, all: true });
    expect(() => parseCliArgs(["mermaid", "--all"])).toThrow(
      "--all is only supported when generating a complete README.",
    );
  });

  it("gives --lang priority over the positional language", () => {
    expect(parseCliArgs(["es", "--lang", "en"]).lang).toBe("en");
  });

  it("rejects unsupported languages", () => {
    expect(() => parseCliArgs(["fr"])).toThrow('Unsupported language: "fr"');
  });

  it("rejects options that have no effect on banner generation", () => {
    expect(() => parseCliArgs(["banner", "--ai"])).toThrow(
      "--ai enriches README content only; use 'banner es' for a Spanish tagline.",
    );
    expect(() => parseCliArgs(["banner", "--output", "custom.svg"])).toThrow(
      "banner always writes to assets/banner.svg; --output is not supported.",
    );
    expect(() => parseCliArgs(["mermaid", "--ai"])).toThrow(
      "mermaid always uses local Ollama; --ai is not needed.",
    );
  });

  it("rejects unexpected positional arguments", () => {
    expect(() => parseCliArgs(["en", "extra"])).toThrow('Unexpected argument: "extra".');
  });

  it("documents command-specific options and explained examples in both languages", () => {
    expect(getHelp("en")).toContain("README options:");
    expect(getHelp("en")).toContain("Banner and mermaid accept a language, --dry-run and --force.");
    expect(getHelp("en")).toContain("preview the README in English");
    expect(getHelp("en")).toContain("--all");
    expect(getHelp("es")).toContain("Opciones de README:");
    expect(getHelp("es")).toContain("Los comandos banner y mermaid aceptan idioma, --dry-run y --force.");
    expect(getHelp("es")).toContain("previsualiza el README en inglés");
    expect(getHelp("es")).toContain("confirma el reemplazo");
  });
});
