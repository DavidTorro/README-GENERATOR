import en from "./en.json" with { type: "json" };
import es from "./es.json" with { type: "json" };

// Idiomas soportados, ampliables a futuras versiones, el idioma por defecto es "en" (ingles).
export type Lang = "en" | "es";

// en.json es la fuente de verdad: sus claves definen el contrato.
export type Translations = typeof en;

// satisfies: si a es.json (o a un idioma futuro) le falta una clave, NO compila.
const dictionaries = { en, es } satisfies Record<Lang, Translations>;

// Metodo para obtener las traducciones de un idioma concreto, devuelve un objeto con las traducciones
export const getTranslations = (lang: Lang): Translations => dictionaries[lang];