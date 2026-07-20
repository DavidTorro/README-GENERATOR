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
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const client = new OllamaClient({
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "test-model",
    });
    const info = buildProjectInfo(
      { pkg: { name: "demo" }, files: [], imports: {}, sources: {}, envExamples: {}, packages: [] },
      "/project",
    );

    await expect(client.enrich(info, "es")).resolves.toEqual(
      expect.objectContaining({ architecture: expect.objectContaining({ mermaid: expect.stringContaining("flowchart LR") }) }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("La tarea de IA «texto» falló en el intento 1"));
  });

  it("uses a deterministic architecture after two graphs that are too small", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        response: JSON.stringify({
          subgraphs: [{ title: "App", nodes: [{ id: "app", label: "App" }] }],
          nodes: [{ id: "user", label: "User" }, { id: "api", label: "API" }],
          edges: [{ from: "user", to: "app" }, { from: "app", to: "api" }],
        }),
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const client = new OllamaClient({ ollamaUrl: "http://localhost:11434", ollamaModel: "test-model" });
    const info = buildProjectInfo(
      { pkg: { name: "demo", bin: "demo" }, files: [], imports: {}, sources: {}, envExamples: {}, packages: [] },
      "/project",
    );

    const architecture = await client.generateArchitecture(info, "es");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(architecture?.mermaid).toContain('user["👤 Usuario"]');
    expect(architecture?.mermaid).toContain('entry["⌨️ demo<br/>Herramienta CLI"]');
    expect(architecture?.components).toHaveLength(3);
  });

});
