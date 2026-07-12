// Contrato que define la forma de un package.json
export interface PkgJson {
  name?: string;
  description?: string;
  version?: string;
  license?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  bin?: string | Record<string, string>;
  engines?: Record<string, string>;
  author?: string | { name?: string; url?: string };
  repository?: string | { url?: string };
  homepage?: string;
}

// Datos CRUDOS del proyecto
export interface RawProject {
  pkg: PkgJson;
  files: string[];
  // Por cada fichero fuente, los especificadores de módulo que importa (sin resolver):
  // "src/main.ts" → ["./cli/cli.parser.js", "node:fs", ...]
  imports: Record<string, string[]>;
  // Texto de cada fichero fuente (ruta → contenido); base de imports y de keySources
  sources: Record<string, string>;
}

// Contrato para un escáner de proyectos, su función principal es escanear un proyecto y devolver sus datos crudos
export interface ProjectScannerPort {
  scan(root: string): RawProject;
}