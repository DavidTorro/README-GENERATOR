import type { PackageManager } from "../../project/domain/project.interfaces.js";

// Comando de instalación según el gestor de paquetes detectado
export const INSTALL_COMMANDS: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm install",
  yarn: "yarn",
  bun: "bun install",
};

// Prefijo para ejecutar scripts según el gestor
export const RUN_COMMANDS: Record<PackageManager, string> = {
  npm: "npm run",
  pnpm: "pnpm run",
  yarn: "yarn",
  bun: "bun run",
};