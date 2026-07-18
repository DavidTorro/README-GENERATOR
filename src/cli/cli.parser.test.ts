import { describe, expect, it } from "vitest";
import { parseCliArgs } from "./cli.parser.js";

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
    expect(parseCliArgs(["banner", "es", "--dry-run", "--force"])).toMatchObject({
      command: "banner",
      lang: "es",
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
});
