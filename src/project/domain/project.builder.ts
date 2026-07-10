import { runDetectors } from "./project.detectors.js";
import type { RawProject } from "./project-scanner.port.js";
import type { PackageManager, ProjectInfo } from "./project.interfaces.js";

// Detección por lockfile del gestor de paquetes usado en el proyecto
function detectPackageManager(files: Set<string>): PackageManager {
  if (files.has("pnpm-lock.yaml")) return "pnpm";
  if (files.has("yarn.lock")) return "yarn";
  if (files.has("bun.lock") || files.has("bun.lockb")) return "bun";
  return "npm";
}

// "bin" como string usa el nombre del paquete (sin scope); como objeto, su primera clave
function detectBinName(pkg: RawProject["pkg"]): string | undefined {
  if (!pkg.bin) return undefined;
  if (typeof pkg.bin === "string") {
    const name = pkg.name ?? "";
    return (name.includes("/") ? name.split("/").pop() : name) || undefined;
  }
  return Object.keys(pkg.bin)[0];
}

// Construye un objeto ProjectInfo a partir de los datos crudos del proyecto
export function buildProjectInfo(raw: RawProject, root: string): ProjectInfo {
  const { pkg, files } = raw;
  const fileSet = new Set(files);
  const deps = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);

  const stack = runDetectors({ deps, files, hasFile: (p) => fileSet.has(p) });

  return {
    name: pkg.name ?? "proyecto",
    description: pkg.description ?? "",
    version: pkg.version ?? "0.0.0",
    license: pkg.license,
    scripts: pkg.scripts ?? {},
    dependencies: Object.keys(pkg.dependencies ?? {}),
    devDependencies: Object.keys(pkg.devDependencies ?? {}),
    packageManager: detectPackageManager(fileSet),
    hasDocker:
      fileSet.has("Dockerfile") ||
      fileSet.has("docker-compose.yml") ||
      fileSet.has("docker-compose.yaml"),
    binName: detectBinName(pkg),
    files,
    root,
    stack,
    features: [],
  };
}
