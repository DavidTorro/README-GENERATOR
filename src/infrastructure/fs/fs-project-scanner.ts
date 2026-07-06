import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import type { PkgJson, ProjectScannerPort, RawProject } from "../../domain/ports/project-scanner.port.js";

// Ignorados siempre, tenga .gitignore o no el proyecto analizado
const DEFAULT_IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**"];

// Única pieza del proyecto que lee el disco del proyecto analizado
export class FsProjectScanner implements ProjectScannerPort {
  scan(root: string): RawProject {
    return { pkg: this.readPackageJson(root), files: this.listFiles(root) };
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