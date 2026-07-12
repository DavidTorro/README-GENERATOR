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
}

// Datos CRUDOS del proyecto
export interface RawProject {
  pkg: PkgJson;
  files: string[];
}

// Contrato para un escáner de proyectos, su función principal es escanear un proyecto y devolver sus datos crudos
export interface ProjectScannerPort {
  scan(root: string): RawProject;
}