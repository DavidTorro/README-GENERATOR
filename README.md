# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

Crea un README.md profesional y atractivo para tu proyecto de manera rápida y sencilla. @davidtorro/readme-gen es la solución ideal para desarrolladores que desean automatizar la generación de documentación de proyectos. Con su interfaz intuitiva y funcionalidad robusta, transforma la creación de README.md en un proceso eficiente y sencillo.

## ⚙️ Stack técnico

- 🔤 **Lenguajes**: TypeScript

## ✨ Características

- 🚀 Genera README.md en segundos con un enfoque en la productividad
- 📝 Soporta múltiples lenguajes y formatos de documentación
- 🔧 Integración sencilla con herramientas de desarrollo modernas
- 📊 Proporciona una estructura clara y organizada para tu proyecto
- 🎨 Personaliza el estilo y el contenido según tus necesidades
- 📦 Incluye scripts de npm para facilitar el desarrollo y la publicación

## 🗂️ Estructura del proyecto

```
@davidtorro/readme-gen/
├── src/
│   ├── ai/
│   │   ├── domain/
│   │   │   └── ai-generator.port.ts
│   │   └── infrastructure/
│   │       ├── ai.config.ts
│   │       └── ollama.client.ts
│   ├── cli/
│   │   └── cli.parser.ts
│   ├── project/
│   │   ├── domain/
│   │   │   ├── project-scanner.port.ts
│   │   │   ├── project.builder.ts
│   │   │   ├── project.detectors.ts
│   │   │   └── project.interfaces.ts
│   │   └── infrastructure/
│   │       └── fs-project-scanner.ts
│   ├── readme/
│   │   ├── application/
│   │   │   └── generate-readme.use-case.ts
│   │   └── domain/
│   │       ├── i18n/
│   │       │   ├── en.json
│   │       │   ├── es.json
│   │       │   └── index.ts
│   │       ├── readme.badges.ts
│   │       ├── readme.categories.ts
│   │       ├── readme.commands.ts
│   │       ├── readme.interfaces.ts
│   │       ├── readme.render.ts
│   │       ├── readme.sections.ts
│   │       └── readme.tree.ts
│   └── main.ts
├── .env.example
├── .gitignore
├── LICENSE
├── NOTICE
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tsup.config.ts
```

## 📦 Instalación

```bash
npm install
```

## 🛠️ Scripts

- `npm run build` — `tsup`
- `npm run dev` — `tsup --watch`
- `npm run typecheck` — `tsc`
- `npm run prepublishOnly` — `npm run build`

## 📄 Licencia

Apache-2.0
