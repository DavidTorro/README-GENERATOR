![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A README.md generator that creates professional and attractive documentation for your projects with optional AI-powered enhancements. It leverages TypeScript, Ollama, and a modular architecture to streamline the README creation process.

> 🤖 Generate professional READMEs quickly with AI enrichment, all while keeping your data private and your workflow simple.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 🤖 AI-powered content generation for README sections using Ollama
- 📁 Automatic project scanning and metadata extraction from your codebase
- 🎨 Customizable README layout with badges, categories, and Mermaid diagrams
- 🖼️ Optional banner image generation using AI-based image prompts
- 📦 Modular architecture with clear separation of concerns for easy extension
- ⚙️ Built with TypeScript, tsup, and supports i18n for multiple languages

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
    subgraph SG0["🧠 AI Services"]
        ai_config["⚙️ AI config"]
        image_client["🖼️ Image client"]
        ollama_client["🤖 Ollama client"]
    end
    subgraph SG1["📁 Project Processing"]
        scanner["📂 File scanner"]
        builder["🧱 Project builder"]
        detectors["🔍 Detectors"]
    end
    subgraph SG2["📝 README Generation"]
        badges["📌 Badges"]
        renderer["📝 Renderer"]
        tree["🌳 Tree"]
    end
    user["👤 User"]
    user -- "trigger" --> scanner
    scanner -- "data" --> builder
    builder -- "process" --> detectors
    detectors -- "output" --> renderer
    user -- "configure" --> ai_config
    ai_config -- "setup" --> ollama_client
    ollama_client -- "generate" --> image_client
    image_client -- "enrich" --> renderer

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class ai_config,image_client,ollama_client g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class scanner,builder,detectors g1;
    classDef g2 fill:#08111f,stroke:#34d399,color:#f8fafc,stroke-width:2px;
    class badges,renderer,tree g2;
    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;
    class user actor;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG2 fill:#0b1220,stroke:#34d399,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Component | Technology | Details |
| --- | --- | --- |
| `cli` | TypeScript | Parses command-line arguments |
| `scanner` | Node.js | Scans project files for metadata |
| `builder` | TypeScript | Constructs project structure |
| `ai_config` | TypeScript | Manages AI service configuration |
| `ollama_client` | TypeScript | Communicates with Ollama for text generation |
| `image_client` | TypeScript | Generates images using AI |
| `renderer` | TypeScript | Generates and formats the README.md |

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/                                  # Static assets like banner
│   └── banner.svg                           # Banner image asset
├── src/                                     # Source code directory
│   ├── ai/                                  # AI-related functionality
│   │   ├── domain/                          # AI domain models and ports
│   │   │   ├── ai-generator.port.ts         # AI generator interface
│   │   │   ├── banner.prompt.ts             # Banner prompt definitions
│   │   │   └── image-generator.port.ts      # Image generator interface
│   │   └── infrastructure/                  # AI implementation details
│   │       ├── ai.config.ts                 # AI configuration
│   │       ├── ollama-image.client.ts       # Ollama image client
│   │       └── ollama.client.ts             # Ollama API client
│   ├── cli/                                 # Command line interface
│   │   └── cli.parser.ts                    # CLI argument parsing
│   ├── project/                             # Project structure handling
│   │   ├── domain/
│   │   │   ├── project-scanner.port.ts      # Project scanner interface
│   │   │   ├── project.builder.ts           # Project builder logic
│   │   │   ├── project.detectors.ts         # Project detectors
│   │   │   └── project.interfaces.ts        # Project interfaces
│   │   └── infrastructure/
│   │       └── fs-project-scanner.ts        # File system project scanner
│   ├── readme/                              # README generation logic
│   │   ├── application/
│   │   │   └── generate-readme.use-case.ts  # README generation use case
│   │   └── domain/
│   │       ├── i18n/
│   │       │   ├── en.json                  # English i18n strings
│   │       │   ├── es.json                  # Spanish i18n strings
│   │       │   └── index.ts                 # i18n string management
│   │       ├── readme.badges.ts             # README badges logic
│   │       ├── readme.banner.ts             # README banner logic
│   │       ├── readme.categories.ts         # README categories logic
│   │       ├── readme.commands.ts           # README commands logic
│   │       ├── readme.interfaces.ts         # README interfaces
│   │       ├── readme.mermaid.ts            # README Mermaid logic
│   │       ├── readme.render.ts             # README rendering logic
│   │       ├── readme.sections.ts           # README sections logic
│   │       └── readme.tree.ts               # README tree logic
│   └── main.ts                              # Main application entry point
├── .env.example                             # Environment variables example
├── .gitignore                               # Git ignore configuration
├── LICENSE                                  # Project license file
├── NOTICE                                   # Project notice file
├── package-lock.json                        # Node package lock
├── package.json                             # Node package config
├── README.md                                # Project root README
├── tsconfig.json                            # TypeScript config
└── tsup.config.ts                           # Tsup bundler config
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
- `npm run gen:all` — `npm run build && node dist/main.js banner --ai --force && node dist/main.js --ai --force`

## 📄 License

Apache-2.0
