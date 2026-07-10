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
import { buildBannerPrompt } from "./ai/domain/banner.prompt.js";
import { OllamaImageClient } from "./ai/infrastructure/ollama-image.client.js";

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
    console.error("🎨 Generating banner with local AI (this may take a while)...");

    const bannerPath = resolve(process.cwd(), "assets/banner.png");
    // Red de seguridad: no pisar un banner existente salvo --force
    if (existsSync(bannerPath) && !opts.force) {
      console.error("❌ assets/banner.png already exists. Use --force to overwrite.");
      process.exit(1);
    }

    const raw = new FsProjectScanner().scan(process.cwd());
    const info = buildProjectInfo(raw, process.cwd());
    const image = await new OllamaImageClient(loadConfig()).generateImage(
      buildBannerPrompt(info),
    );
    if (!image) process.exit(1); // el cliente ya avisó por stderr

    mkdirSync(dirname(bannerPath), { recursive: true });
    writeFileSync(bannerPath, image);
    console.error("✅ assets/banner.png generated");
    process.exit(0);
  }

  // Composition root: el ÚNICO sitio donde se enchufan las capas
  const scanner = new FsProjectScanner();
  const ai = opts.ai ? new OllamaClient(loadConfig()) : undefined;
  const generateReadme = new GenerateReadmeUseCase(scanner, ai);

  if (opts.ai) console.error("🤖 Enriching with local AI (this may take a while)...");

  const root = process.cwd();
  const markdown = await generateReadme.execute(root, opts.lang);

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