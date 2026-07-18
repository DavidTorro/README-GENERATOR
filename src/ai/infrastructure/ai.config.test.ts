import { describe, expect, it } from "vitest";
import { loadConfig } from "./ai.config.js";

describe("loadConfig", () => {
  it("uses the installed code model by default", () => {
    expect(loadConfig({})).toMatchObject({
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "qwen3-coder:30b",
    });
  });
});
