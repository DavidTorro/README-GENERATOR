# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

Generador de README.md para tus proyectos. Crea un README.md profesional y atractivo para tu proyecto de manera rápida y sencilla.

## ⚙️ Stack técnico

- 🔤 **Lenguajes**: TypeScript

## 🗂️ Estructura del proyecto

```
@davidtorro/readme-gen/
├── src/
│   ├── application/
│   │   └── use-cases/
│   │       └── generate-readme.use-case.ts
│   ├── domain/
│   │   ├── ports/
│   │   │   └── project-scanner.port.ts
│   │   ├── project/
│   │   │   ├── project.builder.ts
│   │   │   ├── project.detectors.ts
│   │   │   └── project.interfaces.ts
│   │   └── readme/
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
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── env.config.ts
│   │   └── fs/
│   │       └── fs-project-scanner.ts
│   ├── presentation/
│   │   └── cli/
│   │       └── cli.parser.ts
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
