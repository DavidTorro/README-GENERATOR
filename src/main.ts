#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import pkg from "../package.json" with { type: "json" };
import { GenerateReadmeUseCase } from "./readme/application/generate-readme.use-case.js";
import { FsProjectScanner } from "./project/infrastructure/fs-project-scanner.js";
import { HELP, parseCliArgs } from "./cli/cli.parser.js";
import { loadConfig } from "./ai/infrastructure/ai.config.js";
import { OllamaClient } from "./ai/infrastructure/ollama.client.js";
import { buildProjectInfo } from "./project/domain/project.builder.js";
import { buildBannerSvg } from "./readme/domain/readme.banner.js";

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
  if (opts.command === "banner") {
    if (opts.ai) {
      throw new Error("--ai enriches README content only; banner generation is always local.");
    }
    const bannerPath = resolve(process.cwd(), "assets/banner.svg");
    // Red de seguridad: no pisar un banner existente salvo --force
    if (!opts.dryRun && existsSync(bannerPath) && !opts.force) {
      console.error("❌ assets/banner.svg already exists. Use --force to overwrite.");
      process.exit(1);
    }

    const raw = new FsProjectScanner().scan(process.cwd());
    const info = buildProjectInfo(raw, process.cwd());

    const svg = buildBannerSvg({
      title: info.name,
      description: info.description,
      seed: Math.floor(Math.random() * 1_000_000_000), // cada corrida, un banner distinto
    });

    if (opts.dryRun) {
      console.log(svg);
      process.exit(0);
    }

    mkdirSync(dirname(bannerPath), { recursive: true });
    writeFileSync(bannerPath, svg, "utf8");
    console.error("✅ assets/banner.svg generated");
    process.exit(0);
  }

  const root = process.cwd();
  const outputPath = resolve(root, opts.output);

  // Red de seguridad: no invocar IA si el destino no se puede sobrescribir
  if (!opts.dryRun && existsSync(outputPath) && !opts.force) {
    console.error(`❌ ${opts.output} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  // Composition root: el ÚNICO sitio donde se enchufan las capas
  const scanner = new FsProjectScanner();
  const ai = opts.ai ? new OllamaClient(loadConfig()) : undefined;
  const generateReadme = new GenerateReadmeUseCase(scanner, ai);

  if (opts.ai) console.error("🤖 Enriching with local AI (this may take a while)...");

  const markdown = await generateReadme.execute(root, opts.lang);

  // --dry-run: el resultado va por stdout y no se toca el disco
  if (opts.dryRun) {
    console.log(markdown);
    process.exit(0);
  }

  writeFileSync(outputPath, markdown, "utf8");
  console.error(`✅ ${opts.output} generated (lang: ${opts.lang})`);
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  console.error(`   Try --help`);
  process.exit(1);
}
