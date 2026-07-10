// Definimos el tipo de gestor de paquetes que puede ser utilizado en el proyecto
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

// Categorías para agrupar el stack técnico en el README
export type TechCategory =
  | "language"
  | "frontend"
  | "backend"
  | "database"
  | "testing"
  | "infra"
  | "ai"
  | "tooling";

// Una tecnología detectada: nombre + categoría a la que pertenece
export interface DetectedTech {
  name: string;
  category: TechCategory;
}

// Fila de la tabla de componentes de la sección de arquitectura
export interface ArchitectureComponent {
  name: string;
  tech: string;
  detail: string;
}

// Diagrama + tabla de componentes (lo rellena la IA)
export interface Architecture {
  mermaid: string;
  components: ArchitectureComponent[];
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
  // Nombre del comando si el package expone un bin (⇒ el proyecto es una CLI)
  binName?: string;
  // Rutas de todos los ficheros del proyecto (relativas a root)
  files: string[];
  // Directorio raíz analizado
  root: string;
  // Tecnologías detectadas (React, NestJS, Vite, etc.) con su categoría
  stack: DetectedTech[];
  // Características del proyecto (las rellena la IA; vacío sin --ai)
  features: string[];
  // Frase destacada del proyecto (la rellena la IA; ausente sin --ai)
  blockquote?: string;
  // Comentario por ruta para el árbol de estructura (lo rellena la IA)
  treeComments?: Record<string, string>;
  // Sección de arquitectura (la rellena la IA; ausente sin --ai)
  architecture?: Architecture;
}