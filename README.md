# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A TypeScript CLI tool that generates professional README.md files for your projects using Ollama's AI capabilities. It analyzes your project structure and automatically creates a visually appealing README with badges, categories, commands, and more.

> 🤖 Generate beautiful, professional README.md files in seconds with AI-powered content and zero configuration.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 📦 **Project Analysis**: Automatically scans your project files to gather metadata for the README.
- 🤖 **AI-Powered Content**: Uses Ollama to generate engaging text for README sections.
- 📄 **Customizable Output**: Supports multiple languages and allows fine-tuning of README structure.
- ⚡ **Fast Generation**: Leverages TypeScript and tsup for quick build times and efficient execution.

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/                                  # Static assets storage
│   └── .gitkeep                             # Keep directory in git
├── src/                                     # Source code directory
│   ├── ai/                                  # AI-related functionality
│   │   ├── domain/                          # AI domain models
│   │   │   └── ai-generator.port.ts         # AI generator interface
│   │   └── infrastructure/                  # AI infrastructure implementations
│   │       ├── ai.config.ts                 # AI configuration
│   │       └── ollama.client.ts             # Ollama API client
│   ├── cli/                                 # Command line interface
│   │   └── cli.parser.ts                    # CLI argument parsing
│   ├── project/                             # Project handling functionality
│   │   ├── domain/                          # Project domain models
│   │   │   ├── project-scanner.port.ts      # Project scanner interface
│   │   │   ├── project.builder.ts           # Project builder
│   │   │   ├── project.detectors.ts         # Project detectors
│   │   │   └── project.interfaces.ts        # Project interfaces
│   │   └── infrastructure/                  # Project infrastructure implementations
│   │       └── fs-project-scanner.ts        # File system project scanner
│   ├── readme/                              # README.md generation logic
│   │   ├── application/                     # README application layer
│   │   │   └── generate-readme.use-case.ts  # Generate README use case
│   │   └── domain/                          # README domain models
│   │       ├── i18n/                        # Internationalization resources
│   │       │   ├── en.json                  # English language resources
│   │       │   ├── es.json                  # Spanish language resources
│   │       │   └── index.ts                 # i18n resource management
│   │       ├── readme.badges.ts             # README badges
│   │       ├── readme.categories.ts         # README categories
│   │       ├── readme.commands.ts           # README commands
│   │       ├── readme.interfaces.ts         # README interfaces
│   │       ├── readme.render.ts             # README rendering
│   │       ├── readme.sections.ts           # README sections
│   │       └── readme.tree.ts               # README tree structure
│   └── main.ts                              # Main application entry point
├── .env.example                             # Environment variables example
├── .gitignore                               # Git ignore configuration
├── LICENSE                                  # Project license
├── NOTICE                                   # Project notice
├── package-lock.json                        # Node package dependencies
├── package.json                             # Project configuration
├── README.md                                # Project documentation
├── tsconfig.json                            # TypeScript configuration
└── tsup.config.ts                           # tsup build configuration
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
