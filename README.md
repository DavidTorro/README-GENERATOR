![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

README.md generator for your projects. Creates a professional and attractive README quickly with optional local AI enrichment.

## ⚙️ Stack técnico

- 🔤 **Lenguajes**: TypeScript
- 🤖 **IA**: Ollama
- 🔧 **Tooling**: tsup

## 🏗️ Arquitectura

```mermaid
%%{init: {
    "theme": "base",
    "flowchart": { "curve": "basis", "nodeSpacing": 60, "rankSpacing": 90 },
    "themeVariables": {
        "primaryColor": "#1f2937",
        "primaryTextColor": "#f9fafb",
        "primaryBorderColor": "#60a5fa",
        "lineColor": "#94a3b8",
        "tertiaryColor": "#0f172a"
    }
}}%%

flowchart LR
    subgraph SG0["cli"]
        direction LR
        cli["cli"]
    end
    subgraph SG1["ai"]
        direction LR
        ai_domain["domain"]
        ai_infrastructure["infrastructure"]
    end
    subgraph SG2["project"]
        direction LR
        project_domain["domain"]
        project_infrastructure["infrastructure"]
    end
    subgraph SG3["readme"]
        direction LR
        readme_application["application"]
        readme_domain["domain"]
    end
    cli --> readme_domain
    ai_domain --> project_domain
    ai_domain --> readme_domain
    ai_infrastructure --> ai_domain
    ai_infrastructure --> project_domain
    ai_infrastructure --> readme_domain
    project_infrastructure --> project_domain
    readme_application --> project_domain
    readme_application --> ai_domain
    readme_application --> readme_domain
    readme_domain --> project_domain

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class cli g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class ai_domain,ai_infrastructure g1;
    classDef g2 fill:#08111f,stroke:#34d399,color:#f8fafc,stroke-width:2px;
    class project_domain,project_infrastructure g2;
    classDef g3 fill:#1f2937,stroke:#f472b6,color:#f8fafc,stroke-width:2px;
    class readme_application,readme_domain g3;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG2 fill:#0b1220,stroke:#34d399,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG3 fill:#0b1220,stroke:#f472b6,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Componente | Tecnología | Detalle |
| --- | --- | --- |
| `ai/domain` | ai | Entities, types and pure business logic |
| `ai/infrastructure` | ai | Adapters to the outside world (fs, HTTP…) |
| `cli` | cli | Command-line parsing and help |
| `main` | — | Composition root — wires every layer |
| `project/domain` | project | Entities, types and pure business logic |
| `project/infrastructure` | project | Adapters to the outside world (fs, HTTP…) |
| `readme/application` | readme | Use cases orchestrating the domain |
| `readme/domain` | readme | Entities, types and pure business logic |

## 🗂️ Estructura del proyecto

```
@davidtorro/readme-gen/
├── assets/
│   └── banner.svg
├── src/
│   ├── ai/
│   │   ├── domain/
│   │   │   ├── ai-generator.port.ts
│   │   │   ├── banner.prompt.ts
│   │   │   └── image-generator.port.ts
│   │   └── infrastructure/
│   │       ├── ai.config.ts
│   │       ├── ollama-image.client.ts
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
│   │       ├── readme.architecture.ts
│   │       ├── readme.badges.ts
│   │       ├── readme.banner.ts
│   │       ├── readme.categories.ts
│   │       ├── readme.commands.ts
│   │       ├── readme.interfaces.ts
│   │       ├── readme.mermaid.ts
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

## 🛠️ Scripts

- `npm run build` — `tsup`
- `npm run dev` — `tsup --watch`
- `npm run typecheck` — `tsc`
- `npm run gen` — `npm run build && node dist/main.js`
- `npm run gen:all` — `npm run build && node dist/main.js banner --ai --force && node dist/main.js --ai --force`

## 🚀 Uso

Ejecútalo sin instalar, usando npx:

```bash
npx @davidtorro/readme-gen
```

O instálalo de forma global:

```bash
npm install -g @davidtorro/readme-gen
readme-gen
```

## 📋 Requisitos

- Node.js `>=20`

## 👤 Autor

Hecho por **David Torró**

## 📄 Licencia

Apache-2.0
