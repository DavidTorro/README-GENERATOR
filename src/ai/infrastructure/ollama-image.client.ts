import type { ImageGeneratorPort } from "../domain/image-generator.port.js";
import type { Config } from "./ai.config.js";

// Generar imagen es MUCHO más lento que texto (y la primera vez carga el modelo)
const TIMEOUT_MS = 300_000;

// POST /api/generate con un modelo de imagen: el PNG llega en base64 en "image"
interface OllamaImageResponse {
  image?: string;
}

export class OllamaImageClient implements ImageGeneratorPort {
  constructor(private readonly config: Config) {}

  // Contrato: NUNCA revienta — degrada a undefined con aviso por stderr
  async generateImage(prompt: string): Promise<Uint8Array | undefined> {
    try {
      const res = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.ollamaImageModel,
          prompt,
          stream: false,
          width: 1280, // proporción banner (~4:1), tamaño típico de cabecera de GitHub
          height: 320,
          steps: 4, // flux2-klein está destilado para pocos pasos
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Ollama replied ${res.status} ${res.statusText}`);
      const data = (await res.json()) as OllamaImageResponse;
      if (typeof data.image !== "string" || data.image === "") {
        throw new Error("reply had no image");
      }
      return Buffer.from(data.image, "base64");
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(`⚠️  AI image generation failed (${reason}).`);
      return undefined;
    }
  }
}