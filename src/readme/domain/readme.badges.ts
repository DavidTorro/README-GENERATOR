import type { BadgeStyle } from "./readme.interfaces.js";

const BADGE_CATALOG: Record<string, BadgeStyle> = {
  TypeScript: { color: "3178c6", logo: "typescript", logoColor: "white" },
  React: { color: "20232a", logo: "react", logoColor: "61dafb" },
  NestJS: { color: "e0234e", logo: "nestjs", logoColor: "white" },
  "Next.js": { color: "000000", logo: "nextdotjs", logoColor: "white" },
  Express: { color: "000000", logo: "express", logoColor: "white" },
  Vite: { color: "646cff", logo: "vite", logoColor: "white" },
  TailwindCSS: { color: "06b6d4", logo: "tailwindcss", logoColor: "white" },
  "React Router": { color: "ca4245", logo: "reactrouter", logoColor: "white" },
  Swagger: { color: "85ea2d", logo: "swagger", logoColor: "black" },
  Jest: { color: "c21325", logo: "jest", logoColor: "white" },
  Vitest: { color: "6e9f18", logo: "vitest", logoColor: "white" },
  ESLint: { color: "4b32c3", logo: "eslint", logoColor: "white" },
  Prettier: { color: "f7b93e", logo: "prettier", logoColor: "black" },
  Docker: { color: "2496ed", logo: "docker", logoColor: "white" },
  "GitHub Actions": { color: "2088ff", logo: "githubactions", logoColor: "white" },
};

// Fallback para tecnologías sin entrada en el catálogo
const DEFAULT_STYLE: BadgeStyle = { color: "555555" };

// Genera el markdown de un badge shields.io
export function buildBadge(tech: string): string {
  const style = BADGE_CATALOG[tech] ?? DEFAULT_STYLE;
  // '-' es separador en shields.io: un guion literal se escapa como '--'
  const label = encodeURIComponent(tech.replace(/-/g, "--"));
  let url = `https://img.shields.io/badge/-${label}-${style.color}?style=for-the-badge`;
  if (style.logo) url += `&logo=${style.logo}`;
  if (style.logoColor) url += `&logoColor=${style.logoColor}`;
  return `![${tech}](${url})`;
}

// Una línea con todos los badges del stack, separados por espacio
export function buildBadgeLine(techs: string[]): string {
  return techs.map(buildBadge).join(" ");
}