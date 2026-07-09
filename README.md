# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A CLI tool to generate professional README.md files for your projects quickly. It leverages AI to create attractive, well-structured documentation with minimal input.

> 🤖 Generate beautiful, professional README.md files in seconds with AI-powered assistance and zero configuration.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 📦 **TypeScript-powered** with TypeScript, tsup, and Ollama for modern, type-safe development
- 📄 **AI-assisted generation** using Ollama to create engaging README content
- 🔍 **Project analysis** to automatically detect project structure and content
- ⚙️ **Customizable output** with i18n support for multiple languages

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/
│   └── .gitkeep
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

## 📦 Installation

```bash
npm install
```

## 🛠️ Scripts

- `npm run build` — `tsup`
- `npm run dev` — `tsup --watch`
- `npm run typecheck` — `tsc`
- `npm run prepublishOnly` — `npm run build`
- `npm run gen` — `npm run build && node dist/main.js`

## 📄 License

Apache-2.0
