# Examples

The following small Node.js CLI is a representative input project:

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

It also contains `src/main.ts` and tests. Preview its generated documentation before writing it:

```bash
cd release-notes-cli
npx @davidtorro/readme-gen --dry-run
```

The result includes project-specific sections such as:

```md
# release-notes-cli

Create release notes from Git history.

## Features

- CLI application with detected commands and scripts
- Project structure and dependency information

## Usage

npx release-notes-cli
```

Once reviewed, write a new README when no `README.md` exists:

```bash
npx @davidtorro/readme-gen
```

For an existing README, follow the explicit confirmation flow in [safe overwrites](/guide/safe-overwrites).

## Banner and architecture previews

```bash
npx @davidtorro/readme-gen banner --dry-run > banner-preview.svg
npx @davidtorro/readme-gen mermaid en --dry-run
```

The first command prints a valid SVG banner. The second prints only the Markdown Mermaid architecture section, leaving the README unchanged.
