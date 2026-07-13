import { describe, expect, it } from "vitest";
import { loadConfig } from "./ai.config.js";

describe("loadConfig", () => {
  it("uses the installed code model and no image model by default", () => {
    expect(loadConfig({})).toMatchObject({
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "qwen3-coder:30b",
      ollamaImageModel: "",
    });
  });

  it("accepts an explicitly configured image model", () => {
    expect(loadConfig({ OLLAMA_IMAGE_MODEL: "custom-image-model" }).ollamaImageModel).toBe(
      "custom-image-model",
    );
  });
});
