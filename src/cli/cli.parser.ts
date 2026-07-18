// Este archivo contiene la lógica de parseo de argumentos de línea de comandos este se encarga de definir 
// las opciones disponibles, sus valores por defecto y la ayuda que se muestra al usuario además, valida 
// los argumentos recibidos y devuelve un objeto con las opciones configuradas

import { parseArgs } from "node:util"; // parseArgs es una función nativa de Node.js que permite parsear argumentos de línea de comandos de manera sencilla y robusta
import type { Lang } from "../readme/domain/i18n/index.js";

// Comandos disponibles: generar el README (defecto) o generar el banner con IA de imagen
export type Command = "readme" | "banner";
const COMMANDS: Command[] = ["readme", "banner"];

// Interfaz que define las opciones de línea de comandos disponibles para el usuario
export interface CliOptions {
  command: Command; // qué hace la CLI: "readme" (defecto) o "banner"
  ai: boolean; // uso de IA local (Ollama)
  lang: Lang; // idioma del README generado
  output: string; // ruta del fichero de salida
  dryRun: boolean; // si se debe hacer un testeo sin escribir ningún fichero
  force: boolean; // si se debe sobrescribir el README existente sin preguntar
  help: boolean; // si se debe mostrar la ayuda
  version: boolean; // si se debe mostrar la versión
}

// Mensaje para el argumento --help
export const HELP = `
readme-gen — generate a professional README.md by analyzing your project

Usage:
  readme-gen [command] [language] [options]

Commands:
  readme (default)    generate README.md by analyzing the project
  banner              generate assets/banner.svg with an animated SVG design

Language:
  en (default) | es          also available as flag: --lang es

Options:
  --ai                use local AI (Ollama) to enrich README content
  -l, --lang <en|es>  language of the generated README
  -o, --output <path> output file (default: README.md)
      --dry-run       print the result without writing any file
  -f, --force         overwrite an existing README without asking
  -h, --help          show this help
  -v, --version       show version

Examples:
  npx @davidtorro/readme-gen             Generate the README in English (default)
  npx @davidtorro/readme-gen --ai        Generate the README using local AI (Ollama)
  npx @davidtorro/readme-gen es --ai     Generate the README in Spanish using local AI (Ollama)
  npx @davidtorro/readme-gen --lang es   Generate the README in Spanish using the --lang flag
  npx @davidtorro/readme-gen --dry-run   Generate the README and print it to the console without writing any file
`;

// Función PURA: recibe argv, devuelve opciones (o lanza con mensaje claro)
export function parseCliArgs(argv: string[]): CliOptions {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true, // permite "readme-gen en" además de "--lang en"
    options: {
      ai: { type: "boolean", default: false },
      lang: { type: "string", short: "l" },
      output: { type: "string", short: "o", default: "README.md" },
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
    output: values.output,
    dryRun: values["dry-run"],
    force: values.force,
    help: values.help,
    version: values.version,
  };
}
