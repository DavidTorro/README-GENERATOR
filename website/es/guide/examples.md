# Ejemplos

El siguiente CLI de Node.js pequeño es un proyecto de entrada representativo:

```json
{
  "name": "release-notes-cli",
  "version": "1.0.0",
  "description": "Create release notes from Git history.",
  "bin": { "release-notes": "dist/main.js" },
  "scripts": { "build": "tsup", "test": "vitest run" },
  "dependencies": { "fast-glob": "^3.3.3" }
}
```

También contiene `src/main.ts` y pruebas. Previsualiza su documentación antes de escribirla:

```bash
cd release-notes-cli
npx @davidtorro/readme-gen --dry-run
```

El resultado incluye secciones específicas del proyecto, como:

```md
# release-notes-cli

Create release notes from Git history.

## Features

- CLI application with detected commands and scripts
- Project structure and dependency information

## Usage

npx release-notes-cli
```

Cuando lo hayas revisado, escribe un README nuevo si no existe `README.md`:

```bash
npx @davidtorro/readme-gen
```

Para un README existente, sigue el flujo de confirmación explícita de [sobrescrituras seguras](/es/guide/safe-overwrites).

## Previsualizar banner y arquitectura

```bash
npx @davidtorro/readme-gen banner --dry-run > banner-preview.svg
npx @davidtorro/readme-gen mermaid en --dry-run
```

El primer comando imprime un banner SVG válido. El segundo imprime únicamente la sección Markdown de arquitectura Mermaid, sin modificar el README.
