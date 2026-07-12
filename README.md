![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A README.md generator for your projects that creates a professional and attractive README quickly with optional local AI enrichment. It leverages TypeScript, Ollama, and a modular architecture to provide a flexible and extensible solution.

> 🤖 Generate professional READMEs with local AI enrichment, keeping your data private and your workflow simple.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 🤖 AI-powered content generation with optional local Ollama integration for enriched README sections
- 📁 Automatic project scanning and metadata extraction for structured README creation
- 🎨 Support for customizable banners, badges, and Mermaid diagrams for visual appeal
- 🌍 Multilingual support with built-in English and Spanish localization files
- 📦 Modular architecture with clear separation of concerns for easy extension
- ⚙️ Fast and efficient with TypeScript, tsup, and minimal dependencies

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
        ai_generator["🧠 AI generator"]
    end
    subgraph SG1["📂 Project Processing"]
        project_builder["🧱 Project builder"]
        project_detectors["🔍 Detectors"]
        fs_scanner["📁 File scanner"]
    end
    subgraph SG2["📝 README Generation"]
        badges["📌 Badges"]
        banner["🖼️ Banner"]
        categories["📁 Categories"]
        commands["🛠️ Commands"]
        mermaid["📊 Mermaid"]
        render["📄 Render"]
        tree["🌳 Tree"]
    end
    user["👤 User"]
    user -- "input" --> fs_scanner
    fs_scanner -- "data" --> project_detectors
    project_detectors -- "output" --> project_builder
    project_builder -- "data" --> ai_generator
    ai_generator -- "config" --> ai_config
    ai_config -- "config" --> ollama_client
    ollama_client -- "image" --> image_client
    image_client -- "image" --> banner
    project_builder -- "data" --> render
    render -- "output" --> user

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class ai_config,image_client,ollama_client,ai_generator g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class project_builder,project_detectors,fs_scanner g1;
    classDef g2 fill:#08111f,stroke:#34d399,color:#f8fafc,stroke-width:2px;
    class badges,banner,categories,commands,mermaid,render,tree g2;
    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;
    class user actor;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG2 fill:#0b1220,stroke:#34d399,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Component | Technology | Details |
| --- | --- | --- |
| `cli` | TypeScript | Parses command-line arguments |
| `fs_scanner` | Node.js | Scans project files for metadata |
| `project_detectors` | TypeScript | Detects project structure and features |
| `project_builder` | TypeScript | Constructs project metadata |
| `ai_config` | TypeScript | Configures AI services |
| `ollama_client` | TypeScript | Communicates with Ollama for text generation |
| `image_client` | TypeScript | Generates images using AI |
| `ai_generator` | TypeScript | Generates README sections using AI |
| `badges` | TypeScript | Generates badges for README |
| `banner` | TypeScript | Generates banner image for README |
| `categories` | TypeScript | Organizes README sections by category |
| `commands` | TypeScript | Generates command-line usage section |
| `mermaid` | TypeScript | Generates Mermaid diagrams |
| `render` | TypeScript | Renders final README content |

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/                                  # Static assets folder
│   └── banner.svg                           # Banner image asset
├── src/                                     # Source code directory
│   ├── ai/                                  # AI-related functionality
│   │   ├── domain/                          # AI domain models and ports
│   │   │   ├── ai-generator.port.ts         # AI generator interface
│   │   │   ├── banner.prompt.ts             # Banner prompt definitions
│   │   │   └── image-generator.port.ts      # Image generator interface
│   │   └── infrastructure/                  # AI infrastructure implementations
│   │       ├── ai.config.ts                 # AI configuration
│   │       ├── ollama-image.client.ts       # Ollama image client
│   │       └── ollama.client.ts             # Ollama client
│   ├── cli/                                 # Command line interface
│   │   └── cli.parser.ts                    # CLI argument parser
│   ├── project/                             # Project structure and metadata
│   │   ├── domain/
│   │   │   ├── project-scanner.port.ts      # Project scanner interface
│   │   │   ├── project.builder.ts           # Project builder
│   │   │   ├── project.detectors.ts         # Project detectors
│   │   │   └── project.interfaces.ts        # Project interfaces
│   │   └── infrastructure/
│   │       └── fs-project-scanner.ts        # File system project scanner
│   ├── readme/                              # README generation logic
│   │   ├── application/                     # README application layer
│   │   │   └── generate-readme.use-case.ts  # Generate README use case
│   │   └── domain/                          # README domain models
│   │       ├── i18n/                        # Internationalization files
│   │       │   ├── en.json                  # English i18n file
│   │       │   ├── es.json                  # Spanish i18n file
│   │       │   └── index.ts                 # i18n file index
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
├── LICENSE                                  # Project license
├── NOTICE                                   # Project notice
├── package-lock.json                        # Node package lock file
├── package.json                             # Project configuration
├── README.md                                # Project README file
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
