// Este archivo contiene la lógica de parseo de argumentos de línea de comandos este se encarga de definir 
// las opciones disponibles, sus valores por defecto y la ayuda que se muestra al usuario además, valida 
// los argumentos recibidos y devuelve un objeto con las opciones configuradas

import { parseArgs } from "node:util"; // parseArgs es una función nativa de Node.js que permite parsear argumentos de línea de comandos de manera sencilla y robusta
import type { Lang } from "../readme/domain/i18n/index.js";

// Interfaz que define las opciones de línea de comandos disponibles para el usuario
export interface CliOptions {
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
  readme-gen [language] [options]

Language:
  en (default) | es          also available as flag: --lang es

Options:
  --ai                use local AI (Ollama) to enrich the content
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

  // Prioridad del idioma: --lang gana al posicional; defecto "en"
  const rawLang = values.lang ?? positionals[0] ?? "en";
  if (rawLang !== "en" && rawLang !== "es") {
    throw new Error(`Unsupported language: "${rawLang}". Use "en" or "es".`);
  }

  // Devuelve un objeto con las opciones configuradas
  return {
    ai: values.ai,
    lang: rawLang,
    output: values.output,
    dryRun: values["dry-run"],
    force: values.force,
    help: values.help,
    version: values.version,
  };
}