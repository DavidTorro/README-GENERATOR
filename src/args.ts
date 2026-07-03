// Este archivo contiene la lógica de parseo de argumentos de línea de comandos este se encarga de definir 
// las opciones disponibles, sus valores por defecto y la ayuda que se muestra al usuario además, valida 
// los argumentos recibidos y devuelve un objeto con las opciones configuradas

import { parseArgs } from "node:util"; // parseArgs es una función nativa de Node.js que permite parsear argumentos de línea de comandos de manera sencilla y robusta
import type { Lang } from "./core/i18n/index.js";

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
readme-gen — genera un README.md profesional analizando tu proyecto

Uso:
  readme-gen [idioma] [opciones]

Idioma:
  es (defecto) | en          también como: --lang en

Opciones:
  --ai                usar IA local (Ollama) para enriquecer el contenido
  -l, --lang <es|en>  idioma del README generado
  -o, --output <ruta> fichero de salida (defecto: README.md)
      --dry-run       imprime el resultado sin escribir ningún fichero
  -f, --force         sobrescribe el README existente sin preguntar
  -h, --help          muestra esta ayuda
  -v, --version       muestra la versión

Ejemplos:
  npx @davidtorro/readme-gen.             genera un README.md en español
  npx @davidtorro/readme-gen en           genera un README.md en inglés
  npx @davidtorro/readme-gen --ai.        genera un README.md en español usando IA local (Ollama)
  npx @davidtorro/readme-gen --dry-run    genera un README.md en español y lo imprime por consola sin escribir ningún fichero
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

  // Prioridad del idioma: --lang gana al posicional; defecto "es"
  const rawLang = values.lang ?? positionals[0] ?? "es";
  if (rawLang !== "es" && rawLang !== "en") {
    throw new Error(`Idioma no soportado: "${rawLang}". Usa "es" o "en".`);
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