import type { AiEnrichment, AiGeneratorPort } from "../domain/ai-generator.port.js";
import type { ProjectInfo } from "../../project/domain/project.interfaces.js";
import type { Lang } from "../../readme/domain/i18n/index.js";
import { buildMermaid } from "../../readme/domain/readme.mermaid.js";
import { BANNER_MOTIFS } from "../../readme/domain/readme.banner.js";
import type { Config } from "./ai.config.js";

// Modelos locales tardan en generar; para un Ollama apagado falla en ms igualmente
const TIMEOUT_MS = 120_000;

// Forma de la respuesta de POST /api/generate con stream: false
interface OllamaResponse {
  response: string;
}

const SPANISH_REPLACEMENTS: [RegExp, string][] = [
  [/\bAI Services\b/gi, "Servicios de IA"],
  [/\bAI Service\b/gi, "Servicio de IA"],
  [/\bAI\b/gi, "IA"],
  [/\bCLI Tool\b/gi, "Herramienta CLI"],
  [/\bProject Data\b/gi, "Datos del proyecto"],
  [/\bProject Scanner\b/gi, "Escaneador de proyecto"],
  [/\bCLI entrypoint\b/gi, "Punto de entrada CLI"],
  [/\bREADME Generation\b/gi, "Generación de README"],
  [/\bHTTP Client\b/gi, "Cliente HTTP"],
  [/\bImage Model\b/gi, "Modelo de imagen"],
  [/\bFrontend\b/gi, "Interfaz"],
  [/\bBackend\b/gi, "Servidor"],
  [/\bDatabase\b/gi, "Base de datos"],
  [/\bUser\b/gi, "Usuario"],
  [/\bTests?\b/gi, "Pruebas"],
  [/\btools\b/gi, "herramientas"],
];

function localizeGeneratedText(text: string, lang: Lang): string {
  if (lang !== "es") return text;
  return SPANISH_REPLACEMENTS.reduce(
    (localized, [pattern, replacement]) => localized.replace(pattern, replacement),
    text,
  );
}

export class OllamaClient implements AiGeneratorPort {
  constructor(private readonly config: Config) {}

  // Contrato: NUNCA revienta. Cada tarea degrada por separado:
  // si el árbol falla, la descripción y las features sobreviven
  async enrich(info: ProjectInfo, lang: Lang): Promise<AiEnrichment> {
    const text = (await this.enrichText(info, lang)) ?? {};
    const tree =
      (await this.tryTask("tree comments", lang, async () =>
        this.parseTreeEnrichment(
          // la respuesta más larga de todas: un comentario por cada ruta
          await this.generate(this.buildTreePrompt(info, lang), 3000),
          info,
          lang,
        ),
      )) ?? {};
    const architecture =
      (await this.enrichArchitecture(info, lang)) ?? {};
    return { ...text, ...tree, ...architecture };
  }

  async translateDescription(info: ProjectInfo, lang: Lang): Promise<string | undefined> {
    return (await this.enrichText(info, lang))?.description;
  }

  async generateArchitecture(info: ProjectInfo, lang: Lang): Promise<AiEnrichment["architecture"]> {
    return (await this.enrichArchitecture(info, lang))?.architecture;
  }

  private async enrichText(info: ProjectInfo, lang: Lang): Promise<AiEnrichment | undefined> {
    return this.tryTask("text", lang, async () =>
      this.parseTextEnrichment(await this.generate(this.buildTextPrompt(info, lang)), lang),
    );
  }

  private async enrichArchitecture(info: ProjectInfo, lang: Lang): Promise<AiEnrichment | undefined> {
    return this.tryTask("architecture", lang, async () =>
      this.parseArchitectureEnrichment(
        await this.generate(this.buildArchitecturePrompt(info, lang), 2000),
        lang,
      ),
    );
  }

  // Ejecuta una tarea de IA con un reintento; si falla dos veces, undefined.
  // Genérica: cada llamador decide qué tipo devuelve y cuál es su fallback
  private async tryTask<T>(name: string, lang: Lang, task: () => Promise<T>): Promise<T | undefined> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await task();
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        const taskLabels: Record<string, string> = {
          text: "texto",
          "tree comments": "comentarios del árbol",
          architecture: "arquitectura",
        };
        const taskLabel = lang === "es" ? taskLabels[name] ?? name : name;
        console.error(
          lang === "es"
            ? `⚠️  La tarea de IA «${taskLabel}» falló en el intento ${attempt} (${reason}).${attempt === 1 ? " Reintentando..." : " Se continuará sin ella."}`
            : `⚠️  AI ${name} attempt ${attempt} failed (${reason}).${attempt === 1 ? " Retrying..." : " Continuing without it."}`,
        );
      }
    }
    return undefined;
  }

  // ---- Tarea 1: descripción + features + blockquote ----

  private buildTextPrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    const scripts =
      Object.entries(info.scripts)
        .map(([name, cmd]) => `"${name}" runs \`${cmd}\``)
        .join("; ") || "(none)";
    return [
      `You are writing content for the README.md of a software project, in ${language}.`,
      "",
      "FACTS about the project (your ONLY source of truth):",
      `- Name: ${info.name}`,
      `- Current description: ${info.description || "(none)"}`,
      `- License: ${info.license ?? "(none)"}`,
      `- Package manager: ${info.packageManager}`,
      `- Detected tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      `- Dependencies: ${info.dependencies.join(", ") || "(none)"}`,
      `- Dev dependencies: ${info.devDependencies.join(", ") || "(none)"}`,
      `- npm scripts: ${scripts}`,
      `- Uses Docker: ${info.hasDocker ? "yes" : "no"}`,
      `- Project files: ${info.files.slice(0, 60).join(", ")}`,
      "",
      "KEY SOURCE FILES (real code from this project — read it to see what it ACTUALLY does):",
      ...info.keySources.flatMap((s) => [`----- ${s.path} -----`, "```", s.code, "```"]),
      "",
      "RULES:",
      `- Write EVERY human-readable string in ${language}, including the description, features and blockquote.`,
      "- Ground the description and features in what the SOURCE CODE above actually does (its flags, commands, behaviours), NOT in file names.",
      "- Base everything STRICTLY on the facts and code above. Do NOT invent features, integrations or capabilities they do not support.",
      "- Prefer fewer accurate features over many generic ones.",
      "- No marketing fluff: every sentence must say something concrete about THIS project.",
      "",
      "Reply ONLY with a JSON object with this exact shape:",
      '{"description": "2-3 engaging sentences describing the project", "features": ["3 to 6 bullet points, each starting with a fitting emoji"], "blockquote": "one punchy sentence highlighting the key selling point of the project (privacy, speed, simplicity...), starting with a fitting emoji"}',
    ].join("\n");
  }

  // JSON válido ≠ JSON con la forma esperada: valida campo a campo desde unknown
  private parseTextEnrichment(raw: string, lang: Lang): AiEnrichment {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const obj = parsed as Record<string, unknown>;

    const enrichment: AiEnrichment = {};
    if (typeof obj.description === "string" && obj.description.trim() !== "") {
      enrichment.description = localizeGeneratedText(obj.description.trim(), lang);
    }
    if (Array.isArray(obj.features)) {
      const features = obj.features.filter(
        (f): f is string => typeof f === "string" && f.trim() !== "",
      );
      if (features.length > 0) {
        enrichment.features = features.map((feature) => localizeGeneratedText(feature, lang));
      }
    }
    if (typeof obj.blockquote === "string" && obj.blockquote.trim() !== "") {
      enrichment.blockquote = localizeGeneratedText(obj.blockquote.trim(), lang);
    }

    // Listón de calidad: sin descripción la tarea no vale (dispara el reintento)
    if (!enrichment.description) throw new Error("reply had no usable description");
    return enrichment;
  }

  // ---- Tarea 2: comentarios del árbol de estructura ----

  // Carpetas intermedias derivadas de los ficheros ("src/cli/x.ts" → "src", "src/cli")
  private treePaths(info: ProjectInfo): string[] {
    const dirs = new Set<string>();
    for (const file of info.files) {
      const parts = file.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    }
    return [...[...dirs].sort(), ...info.files].slice(0, 80);
  }

  private buildTreePrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    return [
      `You are documenting the file tree of the project "${info.name}" (${info.description || "a software project"}) for its README.md, in ${language}.`,
      `Tech stack: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      "",
      "PATHS:",
      ...this.treePaths(info).map((p) => `- ${p}`),
      "",
      "RULES:",
      `- Write EVERY comment in ${language}; English prose is forbidden except for technology and file names.`,
      "- Write a short comment (max 8 words) explaining the purpose of each path.",
      "- Base comments ONLY on the path names and the tech stack. If a path is not self-explanatory, write an honest generic comment instead of inventing details.",
      "",
      "Reply ONLY with a JSON object mapping each path to its comment, like:",
      '{"src": "Source code", "src/main.ts": "CLI entry point"}',
    ].join("\n");
  }

  private parseTreeEnrichment(raw: string, info: ProjectInfo, lang: Lang): AiEnrichment {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    // Solo aceptamos claves que sean rutas reales del proyecto: qwen3 a veces
    // devuelve {"user": "<eco del prompt>"} o rutas inventadas
    const known = new Set(this.treePaths(info));
    const comments: Record<string, string> = {};
    for (const [path, value] of Object.entries(parsed)) {
      const clean = path.replace(/\/+$/, "");
      if (known.has(clean) && typeof value === "string" && value.trim() !== "") {
        comments[clean] = localizeGeneratedText(value.trim().replace(/\s+/g, " "), lang);
      }
    }

    // Listón de calidad: si casi nada casa con rutas reales, la tarea no vale.
    // min() para no exigir 5 a un proyecto diminuto de 3 ficheros
    const minimum = Math.min(5, known.size);
    if (Object.keys(comments).length < minimum) {
      throw new Error(`only ${Object.keys(comments).length} comments matched real paths`);
    }
    return { treeComments: comments };
  }

  // ---- Tarea 3: arquitectura como FLUJO de runtime ----
  // La IA da el grafo como DATOS (nodos ricos + flechas); buildMermaid lo dibuja con
  // sintaxis garantizada. Anclada a docker-compose/.env/entrypoint (keySources).

  private buildArchitecturePrompt(info: ProjectInfo, lang: Lang): string {
    const language = lang === "es" ? "Spanish" : "English";
    const exampleLabels =
      lang === "es"
        ? { frontend: "🌐 Interfaz", backend: "🧠 Servidor", database: "🗄️ Base de datos", user: "👤 Usuario" }
        : { frontend: "🌐 Frontend", backend: "🧠 Backend", database: "🗄️ Database", user: "👤 User" };
    // Ejemplo RICO (el modelo imita la forma): app web con front/back/db. Adaptar al proyecto real.
    const example = JSON.stringify({
      subgraphs: [
        { title: exampleLabels.frontend, nodes: [{ id: "web", label: "🖥️ React + TS<br/>Vite" }] },
        { title: exampleLabels.backend, nodes: [{ id: "api", label: "🔌 REST API<br/>:3000" }] },
        { title: exampleLabels.database, nodes: [{ id: "db", label: "🐘 PostgreSQL" }] },
      ],
      nodes: [{ id: "user", label: exampleLabels.user }],
      edges: [
        { from: "user", to: "web" },
        { from: "web", to: "api", label: "/api" },
        { from: "api", to: "db", label: "SQL" },
      ],
      components: [
        {
          name: "backend",
          tech: "NestJS",
          detail: lang === "es" ? "API REST en el puerto 3000" : "REST API on port 3000",
        },
      ],
    });
    return [
      `You are a software architect drawing the RUNTIME architecture of the project "${info.name}" for its README, with labels in ${language}.`,
      "Draw HOW THE SYSTEM WORKS AT RUN TIME (services, processes, data flow) — NOT the source folder tree.",
      "",
      `Tech stack detected: ${info.stack.map((t) => t.name).join(", ") || "(unknown)"}`,
      `Dependencies: ${info.dependencies.join(", ") || "(none)"}`,
      `Is a CLI tool: ${info.binName ? "yes" : "no"}`,
      "",
      "KEY FILES (docker-compose, .env, entrypoints, core code — the architecture lives HERE):",
      ...info.keySources.flatMap((s) => [`----- ${s.path} -----`, "```", s.code, "```"]),
      "",
      "Build the graph:",
      '- "subgraphs": runtime tiers/services (e.g. "🌐 Frontend", "🧠 Backend", "🗄️ Database", "🤖 AI"). For a CLI/library with no services, model the DATA PIPELINE as ordered stages (e.g. "Scan", "Build", "Render").',
      '- Each node "label" is RICH and multi-line with <br/>: technology + port/detail, starting with a fitting emoji. Example: "🔌 REST API<br/>:3000".',
      '- "nodes": 1 to 2 standalone actors outside any tier (👤 user, 🌐 browser, external client).',
      '- "edges": the data flow between declared node ids, each with a short "label" when meaningful ("/api", "HTTP", "SQL", "httpx"). Only reference ids you declared.',
      '- "components": one row per main component: name, technology, one-line detail.',
      "",
      "RULES:",
      lang === "es"
        ? '- Write EVERY subgraph title, node label, edge label and component detail in Spanish. English prose is forbidden: write "Herramienta CLI", not "CLI Tool"; "Punto de entrada CLI", not "CLI entrypoint"; and "Escaneador de proyecto", not "Project Scanner". Technology and file names may stay unchanged.'
        : "- Write EVERY subgraph title, node label, edge label and component detail in English.",
      "- Do not claim that a .env file is loaded automatically unless the code explicitly parses it.",
      "- Infer services, PORTS and databases ONLY from the files above (docker-compose/.env/code). NEVER invent ports or services that are not there.",
      "- 2 to 5 tiers, 4 to 9 nodes total. Keep it clean and readable.",
      "",
      "Reply ONLY with a JSON object of EXACTLY this shape, adapting the CONTENT to THIS project:",
      example,
    ].join("\n");
  }

  // La IA aporta DATOS del grafo; buildMermaid garantiza la sintaxis del mermaid
  private parseArchitectureEnrichment(raw: string, lang: Lang): AiEnrichment {
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null;
    const toNodes = (arr: unknown): { id: string; label: string }[] =>
      (Array.isArray(arr) ? arr : [])
        .filter(isRecord)
        .flatMap((n) =>
          typeof n.id === "string" && typeof n.label === "string"
            ? [{ id: n.id, label: localizeGeneratedText(n.label, lang) }]
            : [],
        );

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};

    const subgraphs = (Array.isArray(parsed.subgraphs) ? parsed.subgraphs : [])
      .filter(isRecord)
      .flatMap((sg) => {
        const nodes = toNodes(sg.nodes);
        return typeof sg.title === "string" && nodes.length > 0
          ? [{ title: localizeGeneratedText(sg.title, lang), nodes }]
          : [];
      });
    const nodes = toNodes(parsed.nodes);

    // Solo aceptamos flechas entre nodos DECLARADOS: un id fantasma saldría como caja pelada
    const declared = new Set([...subgraphs.flatMap((sg) => sg.nodes), ...nodes].map((n) => n.id));
    const edges = (Array.isArray(parsed.edges) ? parsed.edges : [])
      .filter(isRecord)
      .flatMap((e) =>
        typeof e.from === "string" &&
        typeof e.to === "string" &&
        declared.has(e.from) &&
        declared.has(e.to)
          ? [
              {
                from: e.from,
                to: e.to,
                ...(typeof e.label === "string" && e.label.trim()
                  ? { label: localizeGeneratedText(e.label.trim(), lang) }
                  : {}),
              },
            ]
          : [],
      );

    // Listón de calidad: menos que esto no es un diagrama de arquitectura (dispara el reintento)
    const totalNodes = subgraphs.reduce((sum, sg) => sum + sg.nodes.length, 0) + nodes.length;
    if (totalNodes < 4 || edges.length < 3) {
      throw new Error(`graph too thin (${totalNodes} nodes, ${edges.length} edges)`);
    }

    const components = (Array.isArray(parsed.components) ? parsed.components : [])
      .filter(isRecord)
      .flatMap((c) =>
        typeof c.name === "string" && typeof c.tech === "string" && typeof c.detail === "string"
            ? [
                {
                  name: localizeGeneratedText(c.name.trim(), lang),
                  tech: c.tech.trim(),
                  detail: localizeGeneratedText(c.detail.trim(), lang),
                },
              ]
          : [],
      );

    return { architecture: { mermaid: buildMermaid({ subgraphs, nodes, edges }), components } };
  }

  // ---- Transporte común ----

  private async generate(prompt: string, numPredict = 1500): Promise<string> {
    const res = await fetch(`${this.config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.ollamaModel,
        prompt,
        stream: false,
        format: "json", // Ollama fuerza al modelo a emitir JSON válido
        think: false, // sin esto, qwen3 "quiere pensar", format json no le deja, y a veces vomita el prompt como eco {"user": ...}
        options: {
          temperature: 0.4,
          num_ctx: 8192, // holgura para prompts largos (60 ficheros + instrucciones)
          num_predict: numPredict, // 1500 corta bucles de whitespace; tareas largas piden más
          seed: Math.trunc(Math.random() * 2_147_483_647), // sin seed, Ollama casi repite la respuesta: el reintento repetía el MISMO error
        }, // tareas estructuradas: obediencia > creatividad
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Ollama replied ${res.status} ${res.statusText}`);
    const data = (await res.json()) as OllamaResponse;
    return data.response;
  }
}
