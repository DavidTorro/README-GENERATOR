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

// Mensaje para el argumento --help
export const HELP = `
readme-gen — generate README.md documentation from your project

Usage:
  readme-gen [readme] [en|es] [options]
  readme-gen banner [options]

Commands:
  readme (default)    generate README.md from detected project facts
  banner              generate assets/banner.svg locally (no AI)

Language:
  en (default) | es

Options:
  --ai                enrich README content with local Ollama AI; not available for banner
  -l, --lang <en|es>  language of the generated README
  -o, --output <path> output file (default: README.md)
      --dry-run       print the result without writing a file
  -f, --force         overwrite an existing output file
  -h, --help          show this help
  -v, --version       show version

Examples:
  readme-gen --force
  readme-gen es --ai --force
  readme-gen banner --force
  readme-gen --output docs/README.md --force
`;

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
