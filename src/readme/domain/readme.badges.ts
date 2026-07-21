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
    Vue: { color: "4fc08d", logo: "vuedotjs", logoColor: "white" },
  Angular: { color: "dd0031", logo: "angular", logoColor: "white" },
  Svelte: { color: "ff3e00", logo: "svelte", logoColor: "white" },
  Sass: { color: "cc6699", logo: "sass", logoColor: "white" },
  Fastify: { color: "000000", logo: "fastify", logoColor: "white" },
  Prisma: { color: "2d3748", logo: "prisma", logoColor: "white" },
  MongoDB: { color: "47a248", logo: "mongodb", logoColor: "white" },
  PostgreSQL: { color: "4169e1", logo: "postgresql", logoColor: "white" },
  Redis: { color: "ff4438", logo: "redis", logoColor: "white" },
  Cypress: { color: "69d3a7", logo: "cypress", logoColor: "black" },
  esbuild: { color: "ffcf00", logo: "esbuild", logoColor: "black" },
  tsup: { color: "0f172a" },
  Ollama: { color: "000000", logo: "ollama", logoColor: "white" },
};

// Fallback para tecnologías sin entrada en el catálogo
const DEFAULT_STYLE: BadgeStyle = { color: "555555" };

const encodeBadgeValue = (value: string): string => encodeURIComponent(value.replace(/-/g, "--"));

// Genera el markdown de un badge shields.io
export function buildBadge(tech: string): string {
  const style = BADGE_CATALOG[tech] ?? DEFAULT_STYLE;
  // '-' es separador en shields.io: un guion literal se escapa como '--'
  const label = encodeBadgeValue(tech);
  let url = `https://img.shields.io/badge/-${label}-${style.color}?style=for-the-badge`;
  if (style.logo) url += `&logo=${style.logo}`;
  if (style.logoColor) url += `&logoColor=${style.logoColor}`;
  return `![${tech}](${url})`;
}

// Una línea con todos los badges del stack, separados por espacio
export function buildBadgeLine(techs: string[]): string {
  return techs.map(buildBadge).join(" ");
}

export function buildProjectBadgeLine(version: string, license: string | undefined): string {
  const badges = [
    `![Version](https://img.shields.io/badge/version-${encodeBadgeValue(version)}-4b61c9?style=for-the-badge)`,
  ];
  if (license) {
    badges.push(
      `![License](https://img.shields.io/badge/license-${encodeBadgeValue(license)}-555555?style=for-the-badge&logo=spdx&logoColor=white)`,
    );
  }
  return badges.join(" ");
}
