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
    });
  });

  it("parses the banner command with its flags", () => {
    expect(parseCliArgs(["banner", "--dry-run", "--force"])).toMatchObject({
      command: "banner",
      ai: false,
      dryRun: true,
      force: true,
    });
  });

  it("gives --lang priority over the positional language", () => {
    expect(parseCliArgs(["es", "--lang", "en"]).lang).toBe("en");
  });

  it("rejects unsupported languages", () => {
    expect(() => parseCliArgs(["fr"])).toThrow('Unsupported language: "fr"');
  });

  it("rejects options that have no effect on banner generation", () => {
    expect(() => parseCliArgs(["banner", "es"])).toThrow("banner does not support language selection.");
    expect(() => parseCliArgs(["banner", "--lang", "es"])).toThrow("banner does not support language selection.");
    expect(() => parseCliArgs(["banner", "--output", "custom.svg"])).toThrow(
      "banner always writes to assets/banner.svg; --output is not supported.",
    );
  });

  it("rejects unexpected positional arguments", () => {
    expect(() => parseCliArgs(["en", "extra"])).toThrow('Unexpected argument: "extra".');
  });

  it("documents command-specific options and explained examples in both languages", () => {
    expect(getHelp("en")).toContain("README options:");
    expect(getHelp("en")).toContain("Banner accepts only --dry-run and --force.");
    expect(getHelp("en")).toContain("preview the README in English");
    expect(getHelp("es")).toContain("Opciones de README:");
    expect(getHelp("es")).toContain("Banner solo acepta --dry-run y --force.");
    expect(getHelp("es")).toContain("previsualiza el README en inglés");
    expect(getHelp("es")).toContain("genera README.md con Ollama y lo sobrescribe si ya existe");
  });
});
