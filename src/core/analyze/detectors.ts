// Un detector = una tecnología + cómo reconocerla

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
  detect: (ctx: DetectContext) => boolean;
}

// Lista de detectores de tecnologías conocidas
export const DETECTORS: Detector[] = [
  { tech: "TypeScript", detect: (c) => c.deps.has("typescript") || c.hasFile("tsconfig.json") },
  { tech: "React", detect: (c) => c.deps.has("react") },
  { tech: "NestJS", detect: (c) => c.deps.has("@nestjs/core") },
  { tech: "Next.js", detect: (c) => c.deps.has("next") },
  { tech: "Express", detect: (c) => c.deps.has("express") },
  { tech: "Vite", detect: (c) => c.deps.has("vite") },
  { tech: "TailwindCSS", detect: (c) => c.deps.has("tailwindcss") },
  { tech: "React Router", detect: (c) => c.deps.has("react-router") || c.deps.has("react-router-dom") },
  { tech: "Swagger", detect: (c) => c.deps.has("@nestjs/swagger") || c.deps.has("swagger-ui-express") },
  { tech: "Jest", detect: (c) => c.deps.has("jest") },
  { tech: "Vitest", detect: (c) => c.deps.has("vitest") },
  { tech: "ESLint", detect: (c) => c.deps.has("eslint") },
  { tech: "Prettier", detect: (c) => c.deps.has("prettier") },
  { tech: "Docker", detect: (c) => c.hasFile("Dockerfile") || c.hasFile("docker-compose.yml") || c.hasFile("docker-compose.yaml") },
  { tech: "GitHub Actions", detect: (c) => c.files.some((f) => f.startsWith(".github/workflows/")) },
];

// Función que ejecuta todos los detectores y devuelve un array con las tecnologías detectadas
export function runDetectors(ctx: DetectContext): string[] {
  return DETECTORS.filter((d) => d.detect(ctx)).map((d) => d.tech);
}