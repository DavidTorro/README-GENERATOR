#!/usr/bin/env node
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import pkg from "../package.json" with { type: "json" };
import { GenerateReadmeUseCase } from "./readme/application/generate-readme.use-case.js";
import { FsProjectScanner } from "./project/infrastructure/fs-project-scanner.js";
import { HELP, parseCliArgs } from "./cli/cli.parser.js";

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

  // Composition root: el ÚNICO sitio donde se enchufan las capas
  const scanner = new FsProjectScanner();
  const generateReadme = new GenerateReadmeUseCase(scanner);

  const root = process.cwd();
  const markdown = generateReadme.execute(root, opts.lang);

  // --dry-run: el resultado va por stdout y no se toca el disco
  if (opts.dryRun) {
    console.log(markdown);
    process.exit(0);
  }

  const outputPath = resolve(root, opts.output);

  // Red de seguridad: no pisar un README existente salvo --force
  if (existsSync(outputPath) && !opts.force) {
    console.error(`❌ ${opts.output} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  writeFileSync(outputPath, markdown, "utf8");
  console.error(`✅ ${opts.output} generated (lang: ${opts.lang})`);
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  console.error(`   Try --help`);
  process.exit(1);
}