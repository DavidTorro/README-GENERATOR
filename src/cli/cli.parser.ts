import { parseArgs } from "node:util";
import type { Lang } from "../readme/domain/i18n/index.js";

// Comandos disponibles: generar el README (defecto) o su banner local.
export type Command = "readme" | "banner";
const COMMANDS: Command[] = ["readme", "banner"];

export interface CliOptions {
  command: Command;
  ai: boolean;
  lang: Lang;
  output: string;
  dryRun: boolean;
  force: boolean;
  help: boolean;
  version: boolean;
}

const HELP_BY_LANG: Record<Lang, string> = {
  en: `
readme-gen — generate README.md documentation from your project

Usage:
  readme-gen [en|es] [options]
  readme-gen banner [options]

Commands:
  readme (default)    generate README.md from detected project facts
  banner              generate assets/banner.svg locally

README options:
  --ai                enrich content with local Ollama AI
  -l, --lang <en|es>  generate in English (default) or Spanish
  -o, --output <path> write to a custom path (default: README.md)

Common options:
      --dry-run       print the result without writing a file
  -f, --force         overwrite an existing output file
  -h, --help          show this help
  -v, --version       show version

Banner accepts only --dry-run and --force. It always writes to assets/banner.svg.

Examples:
  readme-gen --dry-run                                preview the README in English
  readme-gen es --output docs/README.es.md --force    write a Spanish README to a custom path
  readme-gen --ai --force                             generate README.md with Ollama, overwriting it if present
  readme-gen banner --dry-run                         preview the SVG banner
  readme-gen banner --force                           overwrite assets/banner.svg
`,
  es: `
readme-gen — genera documentación README.md desde tu proyecto

Uso:
  readme-gen [en|es] [opciones]
  readme-gen banner [opciones]

Comandos:
  readme (predeterminado)  genera README.md con los datos detectados del proyecto
  banner                   genera assets/banner.svg de forma local

Opciones de README:
  --ai                mejora el contenido con IA local de Ollama
  -l, --lang <en|es>  genera en inglés (predeterminado) o español
  -o, --output <ruta> escribe en una ruta personalizada (predeterminada: README.md)

Opciones comunes:
      --dry-run       muestra el resultado sin escribir ningún archivo
  -f, --force         sobrescribe un archivo de salida existente
  -h, --help          muestra esta ayuda
  -v, --version       muestra la versión

Banner solo acepta --dry-run y --force. Siempre escribe en assets/banner.svg.

Ejemplos:
  readme-gen --dry-run                                previsualiza el README en inglés
  readme-gen es --output docs/README.es.md --force    escribe un README en español en una ruta personalizada
  readme-gen --ai --force                             genera README.md con Ollama y lo sobrescribe si ya existe
  readme-gen banner --dry-run                         previsualiza el banner SVG
  readme-gen banner --force                           sobrescribe assets/banner.svg
`,
};

export const getHelp = (lang: Lang): string => HELP_BY_LANG[lang];
export const HELP = getHelp("en");

// Función PURA: recibe argv, devuelve opciones (o lanza con mensaje claro)
export function parseCliArgs(argv: string[]): CliOptions {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true, // permite "readme-gen en" además de "--lang en"
    options: {
      ai: { type: "boolean", default: false },
      lang: { type: "string", short: "l" },
      output: { type: "string", short: "o" },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", short: "f", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });

  // Si el primer posicional es un comando conocido, lo consumimos; si no, es el idioma
  const isCommand = (v: string | undefined): v is Command => COMMANDS.includes(v as Command);
  const command: Command = isCommand(positionals[0]) ? positionals[0] : "readme";
  const langPositional = isCommand(positionals[0]) ? positionals[1] : positionals[0];
  const remainingPositionals = isCommand(positionals[0]) ? positionals.slice(2) : positionals.slice(1);

  if (remainingPositionals.length > 0) {
    throw new Error(`Unexpected argument: "${remainingPositionals[0]}".`);
  }

  if (command === "banner") {
    if (values.ai) throw new Error("--ai enriches README content only; banner generation is always local.");
    if (langPositional || values.lang) throw new Error("banner does not support language selection.");
    if (values.output) throw new Error("banner always writes to assets/banner.svg; --output is not supported.");
  }

  // Prioridad del idioma: --lang gana al posicional; defecto "en"
  const rawLang = values.lang ?? langPositional ?? "en";
  if (rawLang !== "en" && rawLang !== "es") {
    throw new Error(`Unsupported language: "${rawLang}". Use "en" or "es".`);
  }

  // Devuelve un objeto con las opciones configuradas
  return {
    command,
    ai: values.ai,
    lang: rawLang,
    output: values.output ?? "README.md",
    dryRun: values["dry-run"],
    force: values.force,
    help: values.help,
    version: values.version,
  };
}
