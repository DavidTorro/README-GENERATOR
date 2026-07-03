import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import type { PackageManager, ProjectInfo } from "./types.js";
import { runDetectors } from "./detectors.js";

// Forma tipada de lo que nos interesa del package.json ajeno
interface PkgJson {
  name?: string;
  description?: string;
  version?: string;
  license?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// Lee y parsea el package.json del proyecto, devolviendo un objeto con lo que nos interesa
function readPackageJson(root: string): PkgJson {
  const path = join(root, "package.json");
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PkgJson;
  } catch {
    // JSON roto: avisamos y seguimos con lo que se pueda detectar por ficheros.
    console.warn("⚠️  package.json ilegible (JSON inválido), se ignora.");
    return {};
  }
}

// Detecta el gestor de paquetes usado en el proyecto, según los ficheros lock presentes
function detectPackageManager(root: string): PackageManager {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lock")) || existsSync(join(root, "bun.lockb"))) return "bun";
  return "npm";
}

// Analiza un proyecto y devuelve un objeto con la información relevante para generar el README
export function analyzeProject(root: string): ProjectInfo {
  const pkg = readPackageJson(root);

  const files = fg.sync(["**/*"], {
    cwd: root,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**"],
    dot: true, // queremos ver .github/, .env.example, .dockerignore...
    onlyFiles: true,
  });

  const deps = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
  const fileSet = new Set(files);

  const stack = runDetectors({
    deps,
    files,
    hasFile: (path) => fileSet.has(path),
  });

  return {
    name: pkg.name ?? "proyecto",
    description: pkg.description ?? "",
    version: pkg.version ?? "0.0.0",
    license: pkg.license,
    scripts: pkg.scripts ?? {},
    dependencies: Object.keys(pkg.dependencies ?? {}),
    devDependencies: Object.keys(pkg.devDependencies ?? {}),
    packageManager: detectPackageManager(root),
    hasDocker: fileSet.has("Dockerfile") || fileSet.has("docker-compose.yml") || fileSet.has("docker-compose.yaml"),
    files,
    root,
    stack,
  };
}