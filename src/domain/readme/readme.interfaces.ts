import type { ProjectInfo } from "../project/project.interfaces.js";
import type { Translations } from "./i18n/index.js";

// Una sección es una función pura: recibe los datos y las traducciones,
// y devuelve su bloque de markdown — o null si no aplica a este proyecto
export type Section = (info: ProjectInfo, t: Translations) => string | null;

// La apariencia shields.io de una tecnología detectada
export interface BadgeStyle {
  color: string; // color de fondo, hex sin '#'
  logo?: string; // slug de simpleicons.org
  logoColor?: string;
}