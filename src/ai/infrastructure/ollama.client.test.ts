import { afterEach, describe, expect, it, vi } from "vitest";
import { buildProjectInfo } from "../../project/domain/project.builder.js";
import { OllamaClient } from "./ollama.client.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("OllamaClient", () => {
  it("retries invalid responses and degrades without throwing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ response: "not valid JSON" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const client = new OllamaClient({
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "test-model",
      ollamaImageModel: "test-image-model",
    });
    const info = buildProjectInfo(
      { pkg: { name: "demo" }, files: [], imports: {}, sources: {}, envExamples: {}, packages: [] },
      "/project",
    );

    await expect(client.enrich(info, "en")).resolves.toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("normalizes common English labels in Spanish AI output", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        response:
          '{"motif":"aurora","density":"calm","tagline":"AI Services usa tools locales para el proyecto"}',
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = new OllamaClient({
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "test-model",
      ollamaImageModel: "",
    });
    const info = buildProjectInfo(
      { pkg: { name: "demo" }, files: [], imports: {}, sources: {}, envExamples: {}, packages: [] },
      "/project",
    );

    const design = await client.bannerDesign(info, "es");

    expect(design?.tagline).toBe("Servicios de IA usa herramientas locales para el proyecto");
  });
});
