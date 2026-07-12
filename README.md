![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A README.md generator for your projects that creates a professional and attractive README quickly with optional local AI enrichment. It leverages TypeScript, Ollama, and a modular architecture to provide flexibility and extensibility.

> 🤖 Generate professional READMEs with AI enrichment, all locally and privately.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 🤖 AI-powered content generation using Ollama for enriched README sections
- 📁 Automatic project scanning and metadata extraction from your codebase
- 🎨 Customizable README layout with support for badges, categories, and Mermaid diagrams
- 🌍 Multilingual support with built-in English and Spanish translations
- ⚡ Fast build and development workflow using tsup and TypeScript
- 📦 Ready-to-use CLI for generating READMEs with optional AI enhancements

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
    subgraph SG2["🤖 AI"]
        ai["🤖 AI"]
        image["🖼️ Image"]
    end
    subgraph SG3["📦 Project"]
        builder["📦 Builder"]
        detectors["🔍 Detectors"]
    end
    user["👤 User"]
    user --> parser
    parser -- "options" --> usecase
    usecase --> scanner
    usecase --> renderer
    usecase --> ai
    usecase --> image
    usecase --> builder
    usecase --> detectors

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class parser,usecase g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class scanner,renderer g1;
    classDef g2 fill:#08111f,stroke:#34d399,color:#f8fafc,stroke-width:2px;
    class ai,image g2;
    classDef g3 fill:#1f2937,stroke:#f472b6,color:#f8fafc,stroke-width:2px;
    class builder,detectors g3;
    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;
    class user actor;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG2 fill:#0b1220,stroke:#34d399,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG3 fill:#0b1220,stroke:#f472b6,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Component | Technology | Details |
| --- | --- | --- |
| `cli` | TypeScript | Parses arguments |
| `scanner` | Node.js | Reads project files |
| `ai` | Ollama | Generates content for README |
| `image` | Ollama | Generates banner image |
| `builder` | TypeScript | Constructs README sections |
| `detectors` | TypeScript | Detects project structure and metadata |
| `renderer` | TypeScript | Formats and renders the final README |

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/                                  # Static assets like SVG banners
│   └── banner.svg                           # Banner image for README
├── src/                                     # Source code directory
│   ├── ai/                                  # AI-related functionality
│   │   ├── domain/                          # AI domain logic and ports
│   │   │   ├── ai-generator.port.ts         # AI generator interface
│   │   │   ├── banner.prompt.ts             # Banner prompt template
│   │   │   └── image-generator.port.ts      # Image generator interface
│   │   └── infrastructure/                  # AI implementation details
│   │       ├── ai.config.ts                 # AI configuration
│   │       ├── ollama-image.client.ts       # Ollama image client
│   │       └── ollama.client.ts             # Ollama client
│   ├── cli/                                 # Command line interface
│   │   └── cli.parser.ts                    # CLI argument parsing
│   ├── project/                             # Project-related logic
│   │   ├── domain/
│   │   │   ├── project-scanner.port.ts      # Project scanner interface
│   │   │   ├── project.builder.ts           # Project builder
│   │   │   ├── project.detectors.ts         # Project detectors
│   │   │   └── project.interfaces.ts        # Project interfaces
│   │   └── infrastructure/
│   │       └── fs-project-scanner.ts        # File system project scanner
│   ├── readme/                              # README generation logic
│   │   ├── application/
│   │   │   └── generate-readme.use-case.ts  # Generate README use case
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
├── package.json                             # Node package metadata
├── README.md                                # Project root README
├── tsconfig.json                            # TypeScript configuration
└── tsup.config.ts                           # Tsup build configuration
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

## 🚀 Usage

Run it without installing, using npx:

```bash
npx @davidtorro/readme-gen
```

Or install it globally:

```bash
npm install -g @davidtorro/readme-gen
readme-gen
```

## 📋 Requirements

- Node.js `>=20`

## 📄 License

Apache-2.0
