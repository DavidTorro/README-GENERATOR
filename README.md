![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![Vitest](https://img.shields.io/badge/-Vitest-6e9f18?style=for-the-badge&logo=vitest&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

README.md generator for your projects. Creates a professional and attractive README quickly with optional local AI enrichment.

## ⚙️ Stack técnico

- 🔤 **Lenguajes**: TypeScript
- 🧪 **Testing**: Vitest
- 🤖 **IA**: Ollama
- 🔧 **Tooling**: tsup

## 🗂️ Estructura del proyecto

```
@davidtorro/readme-gen/
├── assets/
│   └── banner.svg
├── src/
│   ├── ai/
│   │   ├── domain/
│   │   │   └── ai-generator.port.ts
│   │   └── infrastructure/
│   │       ├── ai.config.test.ts
│   │       ├── ai.config.ts
│   │       ├── ollama.client.test.ts
│   │       └── ollama.client.ts
│   ├── cli/
│   │   ├── cli.parser.test.ts
│   │   └── cli.parser.ts
│   ├── project/
│   │   ├── domain/
│   │   │   ├── project-scanner.port.ts
│   │   │   ├── project.builder.test.ts
│   │   │   ├── project.builder.ts
│   │   │   ├── project.detectors.ts
│   │   │   └── project.interfaces.ts
│   │   └── infrastructure/
│   │       ├── fs-project-scanner.test.ts
│   │       └── fs-project-scanner.ts
│   ├── readme/
│   │   ├── application/
│   │   │   ├── generate-readme.use-case.test.ts
│   │   │   └── generate-readme.use-case.ts
│   │   └── domain/
│   │       ├── i18n/
│   │       │   ├── en.json
│   │       │   ├── es.json
│   │       │   └── index.ts
│   │       ├── readme.badges.ts
│   │       ├── readme.banner.test.ts
│   │       ├── readme.banner.ts
│   │       ├── readme.categories.ts
│   │       ├── readme.commands.ts
│   │       ├── readme.interfaces.ts
│   │       ├── readme.mermaid.ts
│   │       ├── readme.render.test.ts
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
- `npm run test` — `vitest run`
- `npm run verify` — `npm run typecheck && npm test && npm run build`
- `npm run banner` — `npm run build && node dist/main.js banner --force`
- `npm run readme` — `npm run build && node dist/main.js --force`
- `npm run readme:ai` — `npm run build && node dist/main.js --ai --force`
- `npm run readme:es` — `npm run build && node dist/main.js es --force`
- `npm run readme:es:ai` — `npm run build && node dist/main.js es --ai --force`
- `npm run all` — `npm run banner && npm run readme:ai`
- `npm run gen` — `npm run readme`
- `npm run gen:all` — `npm run all`

## 🧪 Testing

Este proyecto incluye configuración de testing con Vitest.

```bash
npm run test
```

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

## 🔐 Variables de entorno

| Variable | Descripción |
| --- | --- |
| `OLLAMA_MODEL` | Modelo de Ollama para analizar código y redactar el README |
| `OLLAMA_URL` | URL del servidor Ollama |

## 👤 Autor

Hecho por **David Torró**

## 📄 Licencia

Apache-2.0
