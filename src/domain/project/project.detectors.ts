import type { DetectedTech, TechCategory } from "./project.interfaces.js";

// Contrato que define el contexto que se pasa a cada detector
export interface DetectContext {
  // dependencies + devDependencies juntas
  deps: Set<string>;
  // rutas de ficheros del proyecto, relativas a la raíz
  files: string[];
  hasFile: (path: string) => boolean;
}

// Contrato que define un detector de tecnología
export interface Detector {
  tech: string;
  category: TechCategory;
  detect: (ctx: DetectContext) => boolean;
}

// Lista de detectores de tecnologías conocidas
export const DETECTORS: Detector[] = [
  { tech: "TypeScript", category: "language", detect: (c) => c.deps.has("typescript") || c.hasFile("tsconfig.json") },
  { tech: "React", category: "frontend", detect: (c) => c.deps.has("react") },
  { tech: "NestJS", category: "backend", detect: (c) => c.deps.has("@nestjs/core") },
  { tech: "Next.js", category: "frontend", detect: (c) => c.deps.has("next") },
  { tech: "Express", category: "backend", detect: (c) => c.deps.has("express") },
  { tech: "Vite", category: "tooling", detect: (c) => c.deps.has("vite") },
  { tech: "TailwindCSS", category: "frontend", detect: (c) => c.deps.has("tailwindcss") },
  { tech: "React Router", category: "frontend", detect: (c) => c.deps.has("react-router") || c.deps.has("react-router-dom") },
  { tech: "Swagger", category: "backend", detect: (c) => c.deps.has("@nestjs/swagger") || c.deps.has("swagger-ui-express") },
  { tech: "Jest", category: "testing", detect: (c) => c.deps.has("jest") },
  { tech: "Vitest", category: "testing", detect: (c) => c.deps.has("vitest") },
  { tech: "ESLint", category: "tooling", detect: (c) => c.deps.has("eslint") },
  { tech: "Prettier", category: "tooling", detect: (c) => c.deps.has("prettier") },
  { tech: "Docker", category: "infra", detect: (c) => c.hasFile("Dockerfile") || c.hasFile("docker-compose.yml") || c.hasFile("docker-compose.yaml") },
  { tech: "GitHub Actions", category: "infra", detect: (c) => c.files.some((f) => f.startsWith(".github/workflows/")) },
];

// Ejecuta todos los detectores y devuelve las tecnologías detectadas con su categoría
export function runDetectors(ctx: DetectContext): DetectedTech[] {
  return DETECTORS.filter((d) => d.detect(ctx)).map((d) => ({ name: d.tech, category: d.category }));
}