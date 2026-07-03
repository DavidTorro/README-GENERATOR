#!/usr/bin/env node
import pkg from "../package.json" with { type: "json" };
import { buildProjectInfo } from "./domain/project/build-project-info.js";
import { FsProjectScanner } from "./infrastructure/fs/fs-project-scanner.js";
import { HELP, parseCliArgs } from "./presentation/cli/args.js";

try {
  // slice(2) para ignorar "node" y la ruta del script
  const opts = parseCliArgs(process.argv.slice(2));

  if (opts.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (opts.version) {
    console.log(pkg.version);
    process.exit(0);
  }

  // scanner para leer el disco y obtener datos crudos del proyecto
  const scanner = new FsProjectScanner();

  // Construye un objeto ProjectInfo a partir de los datos crudos del proyecto
  const info = buildProjectInfo(scanner.scan(process.cwd()), process.cwd());

  // PRUEBAS
  console.log(`📦 ${info.name} v${info.version} (${info.packageManager})`);
  console.log(`🔍 Stack detectado: ${info.stack.join(", ") || "nada"}`);
  console.log(`📄 ${info.files.length} ficheros analizados`);
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  console.error(`   Prueba con --help`);
  process.exit(1);
}
