import type { Section } from "./readme.interfaces.js";
import { INSTALL_COMMANDS, RUN_COMMANDS } from "./readme.commands.js";
import { CATEGORY_ORDER, CATEGORY_EMOJI } from "./readme.categories.js";
import { buildBadgeLine } from "./readme.badges.js";
import { buildTree } from "./readme.tree.js";

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

// Diagrama mermaid + tabla de componentes (solo existe en modo --ai)
const architecture: Section = (info, t) => {
  if (!info.architecture) return null;
  const lines = [`## 🏗️ ${t.architecture}`, "", "```mermaid", info.architecture.mermaid, "```"];
  if (info.architecture.components.length > 0) {
    // '|' dentro de una celda rompería la tabla markdown: se escapa
    const cell = (s: string) => s.replaceAll("|", "\\|");
    lines.push(
      "",
      `| ${t.archComponent} | ${t.archTech} | ${t.archDetail} |`,
      "| --- | --- | --- |",
      ...info.architecture.components.map(
        (c) => `| \`${cell(c.name)}\` | ${cell(c.tech)} | ${cell(c.detail)} |`,
      ),
    );
  }
  return lines.join("\n");
};

const projectStructure: Section = (info, t) => {
  if (info.files.length === 0) return null;
  return `## 🗂️ ${t.projectStructure}\n\n\`\`\`\n${buildTree(info.name, info.files, info.treeComments)}\n\`\`\``;
};

const installation: Section = (info, t) =>
  `## 📦 ${t.installation}\n\n\`\`\`bash\n${INSTALL_COMMANDS[info.packageManager]}\n\`\`\``;

const scripts: Section = (info, t) => {
  const entries = Object.entries(info.scripts);
  if (entries.length === 0) return null;
  const run = RUN_COMMANDS[info.packageManager];
  const items = entries
    .map(([name, command]) => `- \`${run} ${name}\` — \`${command}\``)
    .join("\n");
  return `## 🛠️ ${t.scripts}\n\n${items}`;
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
  projectStructure,
  installation,
  scripts,
  docker,
  license,
];