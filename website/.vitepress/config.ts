import { defineConfig } from "vitepress";

const guideSidebar = [
  {
    text: "Guide",
    items: [
      { text: "Installation", link: "/guide/installation" },
      { text: "Commands", link: "/guide/commands" },
      { text: "Ollama configuration", link: "/guide/ollama" },
      { text: "Safe overwrites", link: "/guide/safe-overwrites" },
      { text: "Examples", link: "/guide/examples" },
      { text: "Troubleshooting", link: "/guide/troubleshooting" },
    ],
  },
];

const spanishGuideSidebar = [
  {
    text: "Guía",
    items: [
      { text: "Instalación", link: "/es/guide/installation" },
      { text: "Comandos", link: "/es/guide/commands" },
      { text: "Configuración de Ollama", link: "/es/guide/ollama" },
      { text: "Sobrescrituras seguras", link: "/es/guide/safe-overwrites" },
      { text: "Ejemplos", link: "/es/guide/examples" },
      { text: "Solución de problemas", link: "/es/guide/troubleshooting" },
    ],
  },
];

export default defineConfig({
  lang: "en-US",
  title: "readme-gen",
  description: "Technical documentation for @davidtorro/readme-gen.",
  base: "/",
  cleanUrls: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["meta", { name: "theme-color", content: "#4b61c9" }],
    ["meta", { name: "robots", content: "index, follow" }],
    ["meta", { property: "og:site_name", content: "readme-gen" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { name: "twitter:card", content: "summary" }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "readme-gen",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Node.js",
        url: "https://readme-gen.davidtorro.com",
        codeRepository: "https://github.com/DavidTorro/README-GENERATOR",
        downloadUrl: "https://www.npmjs.com/package/@davidtorro/readme-gen",
        description: "Generate README documentation from local project analysis.",
      }),
    ],
  ],
  vite: {
    build: { target: "esnext" },
  },
  locales: {
    root: { label: "English", lang: "en-US" },
    es: {
      label: "Español",
      lang: "es-ES",
      link: "/es/",
      title: "readme-gen",
      description: "Documentación técnica para @davidtorro/readme-gen.",
      head: [["meta", { property: "og:locale", content: "es_ES" }]],
      themeConfig: {
        logo: { src: "/logo.svg", alt: "RG" },
        nav: [
          { text: "Documentación", link: "/es/guide/installation" },
          { text: "npm", link: "https://www.npmjs.com/package/@davidtorro/readme-gen" },
          { text: "GitHub", link: "https://github.com/DavidTorro/README-GENERATOR" },
        ],
        sidebar: { "/es/guide/": spanishGuideSidebar },
        search: { provider: "local" },
        socialLinks: [{ icon: "github", link: "https://github.com/DavidTorro/README-GENERATOR" }],
        footer: {
          message: "Publicado bajo la licencia Apache-2.0.",
          copyright: "Copyright © 2026 David Torró",
        },
        outlineTitle: "En esta página",
        docFooter: { prev: "Página anterior", next: "Página siguiente" },
        notFound: {
          title: "PÁGINA NO ENCONTRADA",
          quote: "La ruta que buscas no forma parte de esta documentación.",
          linkLabel: "Volver a inicio",
          linkText: "Ir a la documentación",
        },
      },
    },
  },
  themeConfig: {
    logo: { src: "/logo.svg", alt: "RG" },
    nav: [
      { text: "Documentation", link: "/guide/installation" },
      { text: "npm", link: "https://www.npmjs.com/package/@davidtorro/readme-gen" },
      { text: "GitHub", link: "https://github.com/DavidTorro/README-GENERATOR" },
    ],
    sidebar: { "/guide/": guideSidebar },
    search: { provider: "local" },
    socialLinks: [{ icon: "github", link: "https://github.com/DavidTorro/README-GENERATOR" }],
    footer: {
      message: "Released under the Apache-2.0 License.",
      copyright: "Copyright © 2026 David Torró",
    },
    outlineTitle: "On this page",
    docFooter: { prev: "Previous page", next: "Next page" },
    notFound: {
      title: "PAGE NOT FOUND",
      quote: "The route you requested is not part of this documentation.",
      linkLabel: "Return home",
      linkText: "Go to documentation",
    },
  },
});
