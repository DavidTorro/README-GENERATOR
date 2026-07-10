import type { ProjectInfo } from "../../project/domain/project.interfaces.js";

// El tono del hash, en palabras que un modelo de imagen entiende
export function hueToColorWord(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 160) return "green";
  if (h < 200) return "teal";
  if (h < 250) return "blue";
  if (h < 290) return "purple";
  return "pink";
}

// Marca abstracta pequeña: lo único que la difusión hace decentemente.
// Prohibido el texto: a 30px las letras de IA son ruido
export function buildLogoPrompt(info: ProjectInfo, colorWord: string): string {
  return [
    `Minimal flat logo mark for a software project called "${info.name}".`,
    `Abstract geometric symbol in ${colorWord} tones on a clean white background,`,
    "centered, simple bold shapes, modern vector style, high contrast.",
    "No text, no letters, no words.",
  ].join(" ");
}
