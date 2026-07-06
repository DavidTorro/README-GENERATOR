import type { Section } from "./readme.interfaces.js";
import { INSTALL_COMMANDS, RUN_COMMANDS } from "./readme.commands.js";
import { buildBadgeLine } from "./readme.badges.js";

const title: Section = (info) => `# 📝 ${info.name}`;

const badges: Section = (info) =>
  info.stack.length === 0 ? null : buildBadgeLine(info.stack);

const description: Section = (info, t) => info.description || t.defaultDescription;

const techStack: Section = (info, t) => {
  if (info.stack.length === 0) return null;
  const items = info.stack.map((tech) => `- ${tech}`).join("\n");
  return `## ⚙️ ${t.techStack}\n\n${items}`;
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
  title,
  description,
  badges,
  techStack,
  installation,
  scripts,
  docker,
  license,
];