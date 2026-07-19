#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import pkg from "../package.json" with { type: "json" };
import { GenerateReadmeUseCase } from "./readme/application/generate-readme.use-case.js";
import { FsProjectScanner } from "./project/infrastructure/fs-project-scanner.js";
import { getHelp, parseCliArgs } from "./cli/cli.parser.js";
import { loadConfig } from "./ai/infrastructure/ai.config.js";
import { OllamaClient } from "./ai/infrastructure/ollama.client.js";
import { buildProjectInfo } from "./project/domain/project.builder.js";
import { buildBannerSvg } from "./readme/domain/readme.banner.js";
import { getTranslations, type Lang } from "./readme/domain/i18n/index.js";
import { renderArchitectureSection, replaceArchitectureSection } from "./readme/domain/readme.architecture.js";

let lang: Lang = "en";
try {
  // slice(2) para ignorar "node" y la ruta del script
  const opts = parseCliArgs(process.argv.slice(2));
  lang = opts.lang;

  if (opts.help) {
    console.log(getHelp(opts.lang));
    process.exit(0);
  }
  if (opts.version) {
    console.log(pkg.version);
    process.exit(0);
  }
  if (opts.command === "mermaid") {
    const readmePath = resolve(process.cwd(), "README.md");
    if (!opts.dryRun && !existsSync(readmePath)) {
      throw new Error(
        opts.lang === "es"
          ? "No existe README.md para actualizar su sección de arquitectura."
          : "README.md does not exist to update its architecture section.",
      );
    }
    if (!opts.dryRun && !opts.force) {
      console.error(
        opts.lang === "es"
          ? "❌ Usa --force para actualizar solo la sección de arquitectura de README.md."
          : "❌ Use --force to update only the architecture section of README.md.",
      );
      process.exit(1);
    }

    const raw = new FsProjectScanner().scan(process.cwd());
    const info = buildProjectInfo(raw, process.cwd());
    console.error(
      opts.lang === "es"
        ? "🤖 Regenerando la arquitectura Mermaid con Ollama local..."
        : "🤖 Regenerating the Mermaid architecture with local Ollama...",
    );
    const architecture = await new OllamaClient(loadConfig()).generateArchitecture(info, opts.lang);
    if (!architecture) {
      throw new Error(
        opts.lang === "es"
          ? "Ollama no pudo generar una arquitectura Mermaid válida."
          : "Ollama could not generate a valid Mermaid architecture.",
      );
    }

    const section = renderArchitectureSection(architecture, getTranslations(opts.lang));
    if (opts.dryRun) {
      console.log(section);
      process.exit(0);
    }

    const updated = replaceArchitectureSection(readFileSync(readmePath, "utf8"), section);
    writeFileSync(readmePath, updated, "utf8");
    console.error(
      opts.lang === "es"
        ? "✅ Sección de arquitectura de README.md actualizada"
        : "✅ README.md architecture section updated",
    );
    process.exit(0);
  }
  if (opts.command === "banner") {
    if (opts.ai) {
      throw new Error(
        opts.lang === "es"
          ? "--ai solo mejora el contenido del README; usa 'banner es' para un subtítulo en español."
          : "--ai enriches README content only; use 'banner es' for a Spanish tagline.",
      );
    }
    const bannerPath = resolve(process.cwd(), "assets/banner.svg");
    // Red de seguridad: no pisar un banner existente salvo --force
    if (!opts.dryRun && existsSync(bannerPath) && !opts.force) {
      console.error(
        opts.lang === "es"
          ? "❌ assets/banner.svg ya existe. Usa --force para sobrescribirlo."
          : "❌ assets/banner.svg already exists. Use --force to overwrite.",
      );
      process.exit(1);
    }

    const raw = new FsProjectScanner().scan(process.cwd());
    const info = buildProjectInfo(raw, process.cwd());
    let description = info.description;
    if (opts.lang === "es") {
      console.error("🤖 Traduciendo el subtítulo del banner con Ollama local...");
      const translatedDescription = await new OllamaClient(loadConfig()).translateDescription(info, "es");
      if (!translatedDescription) throw new Error("Ollama no pudo traducir el subtítulo del banner al español.");
      description = translatedDescription;
    }

    const svg = buildBannerSvg({
      title: info.name,
      description,
      seed: Math.floor(Math.random() * 1_000_000_000), // cada corrida, un banner distinto
    });

    if (opts.dryRun) {
      console.log(svg);
      process.exit(0);
    }

    mkdirSync(dirname(bannerPath), { recursive: true });
    writeFileSync(bannerPath, svg, "utf8");
    console.error(opts.lang === "es" ? "✅ assets/banner.svg generado" : "✅ assets/banner.svg generated");
    process.exit(0);
  }

  const root = process.cwd();
  const outputPath = resolve(root, opts.output);

  // Red de seguridad: no invocar IA si el destino no se puede sobrescribir
  if (!opts.dryRun && existsSync(outputPath) && !opts.force) {
    console.error(
      opts.lang === "es"
        ? `❌ ${opts.output} ya existe. Usa --force para sobrescribirlo.`
        : `❌ ${opts.output} already exists. Use --force to overwrite.`,
    );
    process.exit(1);
  }

  // Composition root: el ÚNICO sitio donde se enchufan las capas
  const scanner = new FsProjectScanner();
  const ai = opts.ai || opts.lang === "es" ? new OllamaClient(loadConfig()) : undefined;
  const generateReadme = new GenerateReadmeUseCase(scanner, ai);

  if (opts.lang === "es") console.error("🤖 Traduciendo y enriqueciendo el contenido en español con Ollama local...");
  else if (opts.ai) console.error("🤖 Enriching with local AI (this may take a while)...");

  const markdown = await generateReadme.execute(root, opts.lang);

  // --dry-run: el resultado va por stdout y no se toca el disco
  if (opts.dryRun) {
    console.log(markdown);
    process.exit(0);
  }

  writeFileSync(outputPath, markdown, "utf8");
  console.error(
    opts.lang === "es"
      ? `✅ ${opts.output} generado (idioma: ${opts.lang})`
      : `✅ ${opts.output} generated (lang: ${opts.lang})`,
  );
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  console.error(lang === "es" ? "   Prueba --help" : "   Try --help");
  process.exit(1);
}
