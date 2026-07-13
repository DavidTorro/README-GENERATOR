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
      { pkg: { name: "demo" }, files: [], imports: {}, sources: {} },
      "/project",
    );

    await expect(client.enrich(info, "en")).resolves.toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });
});
