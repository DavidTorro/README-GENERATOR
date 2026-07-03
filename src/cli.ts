#!/usr/bin/env node

import { parseCliArgs, HELP } from "./args.js";
import pkg from "../package.json" with { type: "json" };

try {
  // Parseo de argumentos de línea de comandos slice(2) para ignorar "node" y "src/cli.ts"
  const opts = parseCliArgs(process.argv.slice(2));

  // Manejo de flags --help y --version
  if (opts.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (opts.version) {
    console.log(pkg.version);
    process.exit(0);
  }

  // Pruebas
  console.log("Opciones parseadas:", opts);
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  console.error(`   Prueba con --help`);
  process.exit(1);
}