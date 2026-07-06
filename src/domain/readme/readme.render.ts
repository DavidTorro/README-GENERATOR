import type { ProjectInfo } from "../project/project.interfaces.js";
import { getTranslations, type Lang } from "./i18n/index.js";
import { sections } from "./readme.sections.js";

// Ensambla el README: ejecuta cada sección en orden y descarta las que no aplican
export const renderReadme = (info: ProjectInfo, lang: Lang): string => {
  const t = getTranslations(lang);
  const blocks = sections
    .map((section) => section(info, t))
    .filter((block): block is string => block !== null);
  return blocks.join("\n\n") + "\n";
};