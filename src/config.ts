// Config es el contrato para la configuración del proyecto
export interface Config {
  ollamaUrl: string;
  ollamaModel: string;
}

// Valores por defecto de la configuración
const DEFAULTS = {
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "qwen3:8b",
} as const;

// Recibe env como parámetro (con default) en vez de leer process.env directo
// así en los tests le pasaremos un objeto falso sin tocar process.env
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const ollamaUrl = env.OLLAMA_URL ?? DEFAULTS.ollamaUrl;

  try {
    new URL(ollamaUrl);
  } catch {
    throw new Error(
      `OLLAMA_URL no es una URL válida: "${ollamaUrl}". Ejemplo: http://localhost:11434`,
    );
  }

  return {
    ollamaUrl,
    ollamaModel: env.OLLAMA_MODEL ?? DEFAULTS.ollamaModel,
  };
}