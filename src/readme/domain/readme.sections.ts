import type { Section } from "./readme.interfaces.js";
import { INSTALL_COMMANDS, RUN_COMMANDS } from "./readme.commands.js";
import { CATEGORY_ORDER, CATEGORY_EMOJI } from "./readme.categories.js";
import { buildBadgeLine } from "./readme.badges.js";
import { buildTree } from "./readme.tree.js";
import { buildArchitecture } from "./readme.architecture.js";

// Banner del proyecto: solo si existe un assets/banner.(png|jpg|...) real
const BANNER_PATTERN = /^assets\/banner\.(png|jpe?g|webp|svg)$/i;

const banner: Section = (info) => {
  const file = info.files.find((f) => BANNER_PATTERN.test(f));
  return file ? `![Banner](./${file})` : null;
};

const title: Section = (info) => `# 📝 ${info.name}`;

const badges: Section = (info) =>
  info.stack.length === 0 ? null : buildBadgeLine(info.stack.map((tech) => tech.name));

const description: Section = (info, t) => info.description || t.defaultDescription;

// Nota destacada del proyecto (solo existe en modo --ai)
const blockquote: Section = (info) => (info.blockquote ? `> ${info.blockquote}` : null);

const techStack: Section = (info, t) => {
  if (info.stack.length === 0) return null;
  const groups = CATEGORY_ORDER.map((category) => {
    const techs = info.stack.filter((tech) => tech.category === category);
    if (techs.length === 0) return null;
    const names = techs.map((tech) => tech.name).join(", ");
    return `- ${CATEGORY_EMOJI[category]} **${t.categories[category]}**: ${names}`;
  }).filter((line): line is string => line !== null);
  return `## ⚙️ ${t.techStack}\n\n${groups.join("\n")}`;
};

const features: Section = (info, t) => {
  if (info.features.length === 0) return null;
  const items = info.features.map((f) => `- ${f}`).join("\n");
  return `## ✨ ${t.features}\n\n${items}`;
};

// Con --ai: flujo de runtime rico (info.architecture). Sin IA (o si degrada): grafo
// determinista de imports (readme.architecture.ts). null si el proyecto es demasiado plano.
const architecture: Section = (info, t) => {
  const arch = info.architecture ?? buildArchitecture(info);
  if (!arch) return null;
  const lines = [`## 🏗️ ${t.architecture}`, "", "```mermaid", arch.mermaid, "```"];
  if (arch.components.length > 0) {
    // '|' dentro de una celda rompería la tabla markdown: se escapa
    const cell = (s: string) => s.replaceAll("|", "\\|");
    lines.push(
      "",
      `| ${t.archComponent} | ${t.archTech} | ${t.archDetail} |`,
      "| --- | --- | --- |",
      ...arch.components.map(
        (c) => `| \`${cell(c.name)}\` | ${cell(c.tech)} | ${cell(c.detail)} |`,
      ),
    );
  }
  return lines.join("\n");
};

const endpoints: Section = (info, t) => {
  if (info.endpoints.length === 0) return null;
  const rows = info.endpoints.map((endpoint) => `| \`${endpoint.method}\` | \`${endpoint.path}\` |`);
  return `## 📡 ${t.endpoints}\n\n${[`| ${t.endpointMethod} | ${t.endpointRoute} |`, "| --- | --- |", ...rows].join("\n")}`;
};

const projectStructure: Section = (info, t) => {
  if (info.files.length === 0) return null;
  return `## 🗂️ ${t.projectStructure}\n\n\`\`\`\n${buildTree(info.name, info.files, info.treeComments)}\n\`\`\``;
};

const installation: Section = (info, t) =>
  info.binName
    ? null // es una CLI: la sección Usage ya cubre cómo instalarla/ejecutarla (npx / -g)
    : `## 📦 ${t.installation}\n\n\`\`\`bash\n${INSTALL_COMMANDS[info.packageManager]}\n\`\`\``;

// npm ejecuta solo los hooks de ciclo de vida (prepublishOnly, prepare, postinstall...):
// nadie los lanza a mano, no pintan en una lista de "scripts que puedes correr"
const LIFECYCLE_SCRIPTS = new Set([
  "prepare", "prepublish", "prepublishonly", "prepack", "postpack",
  "preinstall", "install", "postinstall", "preuninstall", "postuninstall",
]);

const scripts: Section = (info, t) => {
  const entries = Object.entries(info.scripts).filter(
    ([name]) => !LIFECYCLE_SCRIPTS.has(name.toLowerCase()),
  );
  if (entries.length === 0) return null;
  const run = RUN_COMMANDS[info.packageManager];
  const items = entries
    .map(([name, command]) => `- \`${run} ${name}\` — \`${command}\``)
    .join("\n");
  return `## 🛠️ ${t.scripts}\n\n${items}`;
};

const testing: Section = (info, t) => {
  const runners = info.stack
    .filter((tech) => tech.category === "testing")
    .map((tech) => tech.name);
  const testScript = info.scripts.test;
  // Sin runner detectado y sin script de test, el proyecto no documenta testing
  if (runners.length === 0 && !testScript) return null;

  const body: string[] = [];
  if (runners.length > 0) body.push(`${t.testingText} ${runners.join(", ")}.`);
  if (testScript) {
    const run = RUN_COMMANDS[info.packageManager];
    body.push(`\`\`\`bash\n${run} test\n\`\`\``);
  }
  return `## 🧪 ${t.testing}\n\n${body.join("\n\n")}`;
};

const usage: Section = (info, t) => {
  if (!info.binName) return null;
  return [
    `## 🚀 ${t.usage}`,
    "",
    t.usageNpx,
    "",
    "```bash",
    `npx ${info.name}`,
    "```",
    "",
    t.usageGlobal,
    "",
    "```bash",
    `npm install -g ${info.name}`,
    info.binName,
    "```",
  ].join("\n");
};

const requirements: Section = (info, t) => {
  const entries = Object.entries(info.engines);
  if (entries.length === 0) return null;
  // "node" se muestra como "Node.js"; el resto (npm, pnpm...) tal cual
  const label = (name: string) => (name === "node" ? "Node.js" : name);
  const items = entries
    .map(([name, range]) => `- ${label(name)} \`${range}\``)
    .join("\n");
  return `## 📋 ${t.requirements}\n\n${items}`;
};

const environment: Section = (info, t) => {
  if (info.environment.length === 0) return null;
  const multipleSources = new Set(info.environment.map((variable) => variable.source)).size > 1;
  const cell = (value: string) => value.replaceAll("|", "\\|");
  const header = multipleSources
    ? `| ${t.environmentFile} | ${t.environmentVariable} | ${t.environmentDescription} |\n| --- | --- | --- |`
    : `| ${t.environmentVariable} | ${t.environmentDescription} |\n| --- | --- |`;
  const rows = info.environment.map((variable) => {
    const description = variable.description ? cell(variable.description) : "—";
    return multipleSources
      ? `| \`${cell(variable.source)}\` | \`${variable.name}\` | ${description} |`
      : `| \`${variable.name}\` | ${description} |`;
  });
  return `## 🔐 ${t.environment}\n\n${[header, ...rows].join("\n")}`;
};

const author: Section = (info, t) => {
  const links: string[] = [];
  if (info.repositoryUrl) links.push(`[${t.authorRepo}](${info.repositoryUrl})`);
  if (info.homepage) links.push(`[${t.authorHomepage}](${info.homepage})`);
  if (!info.author && links.length === 0) return null;

  const body: string[] = [];
  if (info.author) body.push(`${t.authorBy} **${info.author}**`);
  if (links.length > 0) body.push(links.join(" · "));
  return `## 👤 ${t.author}\n\n${body.join("\n\n")}`;
};

const docker: Section = (info, t) =>
  info.hasDocker ? `## 🐳 ${t.docker}\n\n${t.dockerText}` : null;

const license: Section = (info, t) =>
  `## 📄 ${t.license}\n\n${info.license ?? t.noLicense}`;

// El orden de esta lista es el orden del README
export const sections: Section[] = [
  banner,
  title,
  badges,
  description,
  blockquote,
  techStack,
  features,
  architecture,
  endpoints,
  projectStructure,
  installation,
  scripts,
  testing,
  usage,
  requirements,
  environment,
  docker,
  author,
  license,
];
