![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

A README.md generator that creates professional and attractive README files for your projects, with optional local AI enrichment for enhanced content.

> 🤖 Generate professional READMEs with local AI enrichment, ensuring speed, simplicity, and privacy.

## ⚙️ Tech Stack

- 🔤 **Languages**: TypeScript
- 🤖 **AI**: Ollama
- 🔧 **Tooling**: tsup

## ✨ Features

- 🚀 Generates README.md files quickly using TypeScript and tsup for efficient builds
- 🤖 Integrates with Ollama for local AI-powered content generation and image creation
- 📁 Scans project files to automatically detect and structure README sections
- 🎨 Supports customizable banners and Mermaid diagrams for visual appeal
- 🌍 Includes multilingual support with English and Spanish localization options
- ⚙️ Offers command-line interface (CLI) for easy project README generation

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
        ai_config["🧠 AI config"]
        ollama_client["🤖 Ollama client"]
        image_generator["🖼️ Image generator"]
        ai_generator["📝 AI generator"]
    end
    subgraph SG1["📁 Project Processing"]
        project_scanner["📂 Project scanner"]
        project_builder["🧱 Project builder"]
        project_detectors["🔍 Project detectors"]
    end
    subgraph SG2["📝 README Generation"]
        readme_render["📝 README renderer"]
        readme_sections["📄 README sections"]
        readme_badges["📌 README badges"]
        readme_mermaid["📊 README mermaid"]
    end
    user["👤 User"]
    user -- "input" --> project_scanner
    project_scanner -- "data" --> project_builder
    project_builder -- "project" --> readme_render
    user -- "config" --> ai_config
    ai_config -- "setup" --> ollama_client
    ollama_client -- "prompt" --> ai_generator
    ai_generator -- "content" --> readme_render
    readme_render -- "structure" --> readme_sections
    readme_sections -- "badges" --> readme_badges
    readme_sections -- "charts" --> readme_mermaid

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class ai_config,ollama_client,image_generator,ai_generator g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class project_scanner,project_builder,project_detectors g1;
    classDef g2 fill:#08111f,stroke:#34d399,color:#f8fafc,stroke-width:2px;
    class readme_render,readme_sections,readme_badges,readme_mermaid g2;
    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;
    class user actor;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG2 fill:#0b1220,stroke:#34d399,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Component | Technology | Details |
| --- | --- | --- |
| `cli` | TypeScript | Parses command-line arguments |
| `project-scanner` | Node.js | Scans the project directory for files |
| `project-builder` | TypeScript | Constructs the project metadata |
| `ai-config` | TypeScript | Stores AI configuration settings |
| `ollama-client` | TypeScript | Communicates with Ollama for AI generation |
| `image-generator` | TypeScript | Generates images using AI |
| `ai-generator` | TypeScript | Generates content using AI prompts |
| `readme-render` | TypeScript | Renders the final README content |
| `readme-sections` | TypeScript | Organizes README sections |
| `readme-badges` | TypeScript | Adds badges to the README |
| `readme-mermaid` | TypeScript | Generates Mermaid diagrams for README |

## 🗂️ Project Structure

```
@davidtorro/readme-gen/
├── assets/                                  # Static assets like banner image
│   └── banner.svg                           # Banner image for README
├── src/                                     # Source code directory
│   ├── ai/                                  # AI-related functionality
│   │   ├── domain/                          # AI domain models and ports
│   │   │   ├── ai-generator.port.ts         # AI generator interface
│   │   │   ├── banner.prompt.ts             # Banner generation prompt
│   │   │   └── image-generator.port.ts      # Image generator interface
│   │   └── infrastructure/                  # AI infrastructure implementations
│   │       ├── ai.config.ts                 # AI configuration
│   │       ├── ollama-image.client.ts       # Ollama image client
│   │       └── ollama.client.ts             # Ollama client
│   ├── cli/                                 # Command line interface
│   │   └── cli.parser.ts                    # CLI argument parsing
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
│   │       │   ├── en.json                  # English i18n strings
│   │       │   ├── es.json                  # Spanish i18n strings
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
├── LICENSE                                  # License file
├── NOTICE                                   # Notice file
├── package-lock.json                        # Node package lock
├── package.json                             # Node package config
├── README.md                                # Project README
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

## 📄 License

Apache-2.0
