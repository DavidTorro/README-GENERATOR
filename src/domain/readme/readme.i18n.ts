// Definimos el tipo de idioma que puede ser utilizado en el proyecto (ampliable a futuras versiones con más idiomas)
export type Lang = "es" | "en";

// Un diccionario por idioma asi podemos traducir las claves de texto a mostrar en el README generado
// De momento solo unas claves de muestra para probar (textos de instalación, scripts y licencia que hay en todos los proycetos)
const dictionaries = {
  es: {
    installation: "Instalación",
    scripts: "Scripts",
    license: "Licencia",
    noLicense: "Sin licencia especificada.",
  },
  en: {
    installation: "Installation",
    scripts: "Scripts",
    license: "License",
    noLicense: "No license specified.",
  },
} as const satisfies Record<Lang, Record<string, string>>; // satisfies garantiza que la estructura del diccionario cumpla con el tipo esperado

// Exportamos el tipo de traducciones y la función para obtener las traducciones según el idioma seleccionado
export type Translations = (typeof dictionaries)[Lang];

// Función para obtener las traducciones según el idioma seleccionado
export const getTranslations = (lang: Lang): Translations => dictionaries[lang];