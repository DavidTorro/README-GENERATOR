import { runDetectors } from "./project.detectors.js";
import type { PkgJson, RawProject } from "./project-scanner.port.js";
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

// author puede ser "Name <email> (url)" u objeto; nos quedamos solo con el nombre
function detectAuthor(author: PkgJson["author"]): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") {
    return author.replace(/<[^>]*>/g, "").replace(/\([^)]*\)/g, "").trim() || undefined;
  }
  return author.name;
}

// repository puede ser "github:u/r", "git+https://...git" u objeto {url}; lo dejamos navegable
function detectRepositoryUrl(repository: PkgJson["repository"]): string | undefined {
  const raw = typeof repository === "string" ? repository : repository?.url;
  if (!raw) return undefined;
  if (raw.startsWith("github:")) return `https://github.com/${raw.slice("github:".length)}`;
  return raw.replace(/^git\+/, "").replace(/\.git$/, "");
}

// Resuelve un import RELATIVO a la ruta real del fichero destino dentro del proyecto.
// Los imports ESM llevan extensión .js aunque el fuente sea .ts: probamos .ts/.tsx/index.
function resolveImport(fromFile: string, spec: string, fileSet: Set<string>): string | undefined {
  if (!spec.startsWith(".")) return undefined; // paquete externo o node:, no es interno
  const stack = fromFile.split("/").slice(0, -1); // directorio del importador
  for (const part of spec.split("/")) {
    if (part === "" || part === ".") continue;
    else if (part === "..") stack.pop();
    else stack.push(part);
  }
  const base = stack.join("/").replace(/\.(?:js|jsx|mjs|cjs)$/, "");
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, base]) {
    if (fileSet.has(candidate)) return candidate;
  }
  return undefined;
}

// Grafo interno: por cada fichero, solo los imports que apuntan a otro fichero del proyecto
function resolveInternalImports(
  raw: Record<string, string[]>,
  fileSet: Set<string>,
): Record<string, string[]> {
  const internal: Record<string, string[]> = {};
  for (const [file, specs] of Object.entries(raw)) {
    const resolved = specs
      .map((spec) => resolveImport(file, spec, fileSet))
      .filter((target): target is string => target !== undefined);
    if (resolved.length > 0) internal[file] = resolved;
  }
  return internal;
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
    engines: pkg.engines ?? {},
    dependencies: Object.keys(pkg.dependencies ?? {}),
    devDependencies: Object.keys(pkg.devDependencies ?? {}),
    packageManager: detectPackageManager(fileSet),
    hasDocker:
      fileSet.has("Dockerfile") ||
      fileSet.has("docker-compose.yml") ||
      fileSet.has("docker-compose.yaml"),
    binName: detectBinName(pkg),
    files,
    imports: resolveInternalImports(raw.imports, fileSet),
    root,
    stack,
    features: [],
  };
}
