// Config es el contrato para la configuración del proyecto
export interface Config {
  ollamaUrl: string;
  ollamaModel: string;
  ollamaImageModel: string;
}

// Valores por defecto de la configuración
const DEFAULTS = {
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "qwen3:8b",
  ollamaImageModel: "x/flux2-klein:4b",
} as const;

// Recibe env como parámetro (con default) en vez de leer process.env directo
// así en los tests le pasaremos un objeto falso sin tocar process.env
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const ollamaUrl = env.OLLAMA_URL ?? DEFAULTS.ollamaUrl;

  try {
    new URL(ollamaUrl);
  } catch {
    throw new Error(
      `OLLAMA_URL is not a valid URL: "${ollamaUrl}". Example: http://localhost:11434`,
    );
  }

  return {
    ollamaUrl,
    ollamaModel: env.OLLAMA_MODEL ?? DEFAULTS.ollamaModel,
    ollamaImageModel: env.OLLAMA_IMAGE_MODEL ?? DEFAULTS.ollamaImageModel,
  };
}