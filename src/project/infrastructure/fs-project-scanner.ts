import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import type { PkgJson, ProjectScannerPort, RawProject } from "../domain/project-scanner.port.js";

// Ignorados siempre, tenga .gitignore o no el proyecto analizado
const DEFAULT_IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**"];

// Extensiones cuyos imports nos interesan para el grafo de arquitectura
const SOURCE_RE = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
// Captura el especificador de `import/export ... from "X"`, `import "X"` e `import("X")`
const IMPORT_RE = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

// Única pieza del proyecto que lee el disco del proyecto analizado
export class FsProjectScanner implements ProjectScannerPort {
  scan(root: string): RawProject {
    const files = this.listFiles(root);
    return { pkg: this.readPackageJson(root), files, imports: this.readImports(root, files) };
  }

  // Por cada fichero fuente, extrae los especificadores de sus imports (crudos, sin resolver)
  private readImports(root: string, files: string[]): Record<string, string[]> {
    const imports: Record<string, string[]> = {};
    for (const file of files) {
      if (file.endsWith(".d.ts") || !SOURCE_RE.test(file)) continue;
      let text: string;
      try {
        text = readFileSync(join(root, file), "utf8");
      } catch {
        continue; // fichero ilegible: lo saltamos, no reventamos el escaneo
      }
      const specs = new Set<string>();
      for (const match of text.matchAll(IMPORT_RE)) {
        if (match[1]) specs.add(match[1]);
      }
      if (specs.size > 0) imports[file] = [...specs];
    }
    return imports;
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