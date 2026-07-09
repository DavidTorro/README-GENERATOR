import type { TechCategory } from "../../project/domain/project.interfaces.js";

// Orden de aparición de las categorías en el stack técnico
export const CATEGORY_ORDER: TechCategory[] = [
  "language",
  "frontend",
  "backend",
  "database",
  "testing",
  "infra",
  "ai",
  "tooling",
];

// Emoji de cada categoría (no se traduce → no va en i18n)
export const CATEGORY_EMOJI: Record<TechCategory, string> = {
  language: "🔤",
  frontend: "🎨",
  backend: "⚙️",
  database: "🗄️",
  testing: "🧪",
  infra: "🐳",
  ai: "🤖",
  tooling: "🔧",
};