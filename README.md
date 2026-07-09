# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A CLI tool that generates professional README.md files for your projects using AI-powered templates. It analyzes your project structure and automatically creates a visually appealing README with badges, sections, and documentation links.

> 🤖 Generate beautiful, professional README.md files in seconds with AI-powered template generation.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 📦 **Project Analysis** - Automatically scans your project files and structure to extract relevant information
- 🤖 **AI-Powered Templates** - Uses Ollama to generate README content based on your project's characteristics
- 📝 **Markdown Output** - Produces clean, formatted README.md files with badges, sections, and documentation links
- 🌐 **Multilingual Support** - Includes English and Spanish language templates for README sections

## 🏗️ Architecture

```mermaid
%%{init: {
    "theme": "base",
    "themeVariables": {
        "primaryColor": "#1f2937",
        "primaryTextColor": "#f9fafb",
        "primaryBorderColor": "#60a5fa",
        "lineColor": "#94a3b8",
        "tertiaryColor": "#0f172a"
    }
}}%%

flowchart LR
    subgraph SG0["🖥️ CLI"]
        parser["🖥️ Arg parser"]
        usecase["⚙️ Use case"]
    end
    subgraph SG1["🧠 Services"]
        scanner["📂 File scanner"]
        renderer["📝 Renderer"]
    end
    user["👤 User"]
    user --> parser
    parser -- "options" --> usecase
    usecase --> renderer

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class parser,usecase g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class scanner,renderer g1;
    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;
    class user actor;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Component | Technology | Details |
| --- | --- | --- |
| `cli` | TypeScript | Parses arguments |
| `scanner` | Node.js | Reads project files |

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/                                  # Static assets
│   └── .gitkeep                             # Keep assets directory
├── src/                                     # Source code
│   ├── ai/                                  # AI-related code
│   │   ├── domain/                          # AI domain logic
│   │   │   └── ai-generator.port.ts         # AI generator port
│   │   └── infrastructure/                  # AI infrastructure
│   │       ├── ai.config.ts                 # AI configuration
│   │       └── ollama.client.ts             # Ollama client
│   ├── cli/                                 # Command line interface
│   │   └── cli.parser.ts                    # CLI argument parser
│   ├── project/                             # Project-related code
│   │   ├── domain/                          # Project domain logic
│   │   │   ├── project-scanner.port.ts      # Project scanner port
│   │   │   ├── project.builder.ts           # Project builder
│   │   │   ├── project.detectors.ts         # Project detectors
│   │   │   └── project.interfaces.ts        # Project interfaces
│   │   └── infrastructure/                  # Project infrastructure
│   │       └── fs-project-scanner.ts
│   ├── readme/                              # README generation code
│   │   ├── application/                     # README application layer
│   │   │   └── generate-readme.use-case.ts  # Generate README use case
│   │   └── domain/                          # README domain logic
│   │       ├── i18n/                        # i18n for README
│   │       │   ├── en.json                  # English i18n for README
│   │       │   ├── es.json                  # Spanish i18n for README
│   │       │   └── index.ts                 # i18n index for README
│   │       ├── readme.badges.ts             # README badges
│   │       ├── readme.categories.ts         # README categories
│   │       ├── readme.commands.ts           # README commands
│   │       ├── readme.interfaces.ts         # README interfaces
│   │       ├── readme.mermaid.ts            # README Mermaid diagrams
│   │       ├── readme.render.ts             # README rendering
│   │       ├── readme.sections.ts           # README sections
│   │       └── readme.tree.ts               # README file tree
│   └── main.ts                              # CLI entry point
├── .env.example                             # Environment variables example
├── .gitignore                               # Git ignore file
├── LICENSE                                  # License file
├── NOTICE                                   # Notice file
├── package-lock.json                        # Node package lock
├── package.json                             # Node package config
├── README.md                                # Project README
├── tsconfig.json                            # TypeScript config
└── tsup.config.ts                           # tsup build config
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
