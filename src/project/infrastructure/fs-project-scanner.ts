import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import type { PkgJson, ProjectScannerPort, RawProject } from "../domain/project-scanner.port.js";

// Ignorados siempre, tenga .gitignore o no el proyecto analizado
const DEFAULT_IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**"];

// Extensiones que consideramos "código fuente" (para imports y para dar código a la IA)
const SOURCE_RE = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
// Ficheros de infraestructura: definen la arquitectura de RUNTIME (servicios, puertos, BBDD)
const INFRA_RE = /(?:^|\/)(?:docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|\.env\.(?:example|sample))$/;
// Captura el especificador de `import/export ... from "X"`, `import "X"` e `import("X")`
const IMPORT_RE = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

// Especificadores de import por fichero de CÓDIGO, extraídos del texto ya leído (sin volver a disco)
function extractImports(sources: Record<string, string>): Record<string, string[]> {
  const imports: Record<string, string[]> = {};
  for (const [file, text] of Object.entries(sources)) {
    if (!SOURCE_RE.test(file)) continue; // los infra (yaml, Dockerfile) no tienen imports ESM
    const specs = new Set<string>();
    for (const match of text.matchAll(IMPORT_RE)) {
      if (match[1]) specs.add(match[1]);
    }
    if (specs.size > 0) imports[file] = [...specs];
  }
  return imports;
}

// Única pieza del proyecto que lee el disco del proyecto analizado
export class FsProjectScanner implements ProjectScannerPort {
  scan(root: string): RawProject {
    const files = this.listFiles(root);
    const sources = this.readSources(root, files);
    return { pkg: this.readPackageJson(root), files, sources, imports: extractImports(sources) };
  }

  // Texto de cada fichero fuente: alimenta el grafo de imports Y los extractos que lee la IA
  private readSources(root: string, files: string[]): Record<string, string> {
    const sources: Record<string, string> = {};
    for (const file of files) {
      if (file.endsWith(".d.ts")) continue;
      if (!SOURCE_RE.test(file) && !INFRA_RE.test(file)) continue;
      try {
        sources[file] = readFileSync(join(root, file), "utf8");
      } catch {
        // fichero ilegible: lo saltamos, no reventamos el escaneo
      }
    }
    return sources;
  }

  private readPackageJson(root: string): PkgJson {
    const path = join(root, "package.json");
    if (!existsSync(path)) return {};
    try {
      return JSON.parse(readFileSync(path, "utf8")) as PkgJson;
    } catch {
      console.warn("⚠️  Unreadable package.json (invalid JSON), skipping it.");
      return {};
    }
  }

  // Convierte las líneas del .gitignore en patrones glob para fast-glob
  private readGitignorePatterns(root: string): string[] {
    const path = join(root, ".gitignore");
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#") && !line.startsWith("!"))
      .flatMap((pattern) => {
        const clean = pattern.replace(/^\//, "").replace(/\/+$/, "");
        // cada entrada puede ser fichero o carpeta: cubrimos ambos casos
        return [`**/${clean}`, `**/${clean}/**`];
      });
  }

  private listFiles(root: string): string[] {
    return fg.sync(["**/*"], {
      cwd: root,
      ignore: [...DEFAULT_IGNORE, ...this.readGitignorePatterns(root)],
      dot: true,
      onlyFiles: true,
    });
  }
}