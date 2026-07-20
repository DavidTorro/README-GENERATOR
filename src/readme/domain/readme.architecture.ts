import type { Architecture } from "../../project/domain/project.interfaces.js";
import type { Translations } from "./i18n/index.js";

export function renderArchitectureSection(architecture: Architecture, t: Translations): string {
  const lines = [`## 🏗️ ${t.architecture}`, "", "```mermaid", architecture.mermaid, "```"];
  if (architecture.components.length > 0) {
    const cell = (value: string) => value.replaceAll("|", "\\|");
    lines.push(
      "",
      `| ${t.archComponent} | ${t.archTech} | ${t.archDetail} |`,
      "| --- | --- | --- |",
      ...architecture.components.map(
        (component) => `| \`${cell(component.name)}\` | ${cell(component.tech)} | ${cell(component.detail)} |`,
      ),
    );
  }
  return lines.join("\n");
}

export function replaceArchitectureSection(markdown: string, section: string): string {
  const start = markdown.search(/^## (?:🏗️ )?(?:Arquitectura|Architecture)\s*$/m);
  if (start === -1) return `${markdown.trimEnd()}\n\n${section}\n`;

  const afterSection = markdown.slice(start + 1);
  const nextHeading = afterSection.search(/^## /m);
  const end = nextHeading === -1 ? markdown.length : start + 1 + nextHeading;
  const updated = `${markdown.slice(0, start)}${section}${markdown.slice(end)}`;
  return end === markdown.length ? `${updated}\n` : updated;
}
