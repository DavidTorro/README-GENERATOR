import type { ProjectInfo } from "../../project/domain/project.interfaces.js";

// Prompt para el modelo de imagen: describe la ESCENA, no el proyecto
export function buildBannerPrompt(info: ProjectInfo): string {
  const stack = info.stack.map((t) => t.name).slice(0, 5).join(", ");
  return [
    `Wide horizontal banner illustration for a software project called "${info.name}".`,
    info.description ? `The project: ${info.description}.` : "",
    stack ? `Themes to evoke: ${stack}.` : "",
    "Modern flat design, abstract geometric shapes, dark background with vibrant accent colors, clean tech aesthetic.",
    "No text, no letters, no words.", // de momento no se le ponemos el nombre por que Ollama no lo hace bien
  ]
    .filter(Boolean)
    .join(" ");
}