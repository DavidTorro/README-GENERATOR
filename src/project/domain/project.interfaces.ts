// Definimos el tipo de gestor de paquetes que puede ser utilizado en el proyecto
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

// Categorías para agrupar el stack técnico en el README
export type TechCategory =
  | "language"
  | "frontend"
  | "backend"
  | "testing"
  | "infra"
  | "tooling";

// Una tecnología detectada: nombre + categoría a la que pertenece
export interface DetectedTech {
  name: string;
  category: TechCategory;
}

// ProjectInfo es el contrato central del proyecto
export interface ProjectInfo {
  name: string;
  description: string;
  version: string;
  license?: string;
  scripts: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  packageManager: PackageManager;
  hasDocker: boolean;
  // Rutas de todos los ficheros del proyecto (relativas a root)
  files: string[];
  // Directorio raíz analizado
  root: string;
  // Tecnologías detectadas (React, NestJS, Vite, etc.) con su categoría
  stack: DetectedTech[];
}