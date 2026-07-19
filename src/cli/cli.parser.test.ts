import { describe, expect, it } from "vitest";
import { HELP, parseCliArgs } from "./cli.parser.js";

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

  it("documents that AI is limited to README generation", () => {
    expect(HELP).toContain("not available for banner");
    expect(HELP).toContain("readme-gen banner --force");
  });
});
