import type { Architecture } from "../../project/domain/project.interfaces.js";
import type { Translations } from "./i18n/index.js";

const ARCHITECTURE_START = "<!-- readme-gen:architecture:start -->";
const ARCHITECTURE_END = "<!-- readme-gen:architecture:end -->";

export function renderArchitectureSection(architecture: Architecture, t: Translations): string {
  const lines = [ARCHITECTURE_START, `## 🏗️ ${t.architecture}`, "", "```mermaid", architecture.mermaid, "```"];
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
  lines.push("", ARCHITECTURE_END);
  return lines.join("\n");
}

export function replaceArchitectureSection(markdown: string, section: string): string | undefined {
  const managedStart = markdown.indexOf(ARCHITECTURE_START);
  const managedEnd = markdown.indexOf(ARCHITECTURE_END, managedStart);
  if (managedStart !== -1 && managedEnd !== -1) {
    return `${markdown.slice(0, managedStart)}${section}${markdown.slice(managedEnd + ARCHITECTURE_END.length)}`;
  }

  // Support legacy generated sections without risking manual architecture content.
  const headingStart = markdown.search(/^## (?:🏗️ )?(?:Arquitectura|Architecture)\s*$/m);
  if (headingStart === -1) return undefined;

  const afterHeading = markdown.slice(headingStart + 1);
  const nextHeading = afterHeading.search(/^## /m);
  const headingEnd = nextHeading === -1 ? markdown.length : headingStart + 1 + nextHeading;
  const legacySection = markdown.slice(headingStart, headingEnd);
  const legacyMermaid = /```mermaid\s*\n[\s\S]*?\n```/.exec(legacySection);
  const nextMermaid = /```mermaid\s*\n[\s\S]*?\n```/.exec(section);
  if (!legacyMermaid || !nextMermaid) return undefined;

  const mermaidStart = headingStart + legacyMermaid.index;
  return `${markdown.slice(0, mermaidStart)}${nextMermaid[0]}${markdown.slice(mermaidStart + legacyMermaid[0].length)}`;
}
