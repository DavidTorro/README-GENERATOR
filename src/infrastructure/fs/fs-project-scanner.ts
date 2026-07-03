import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import type { PkgJson, ProjectScannerPort, RawProject } from "../../domain/ports/project-scanner.port.js";

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
      console.warn("⚠️  package.json ilegible (JSON inválido), se ignora.");
      return {};
    }
  }

  private listFiles(root: string): string[] {
    return fg.sync(["**/*"], {
      cwd: root,
      ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**"],
      dot: true,
      onlyFiles: true,
    });
  }
}