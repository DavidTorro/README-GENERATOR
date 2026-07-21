# Installation

`@davidtorro/readme-gen` requires Node.js 20 or later. Run it from the root of the project you want to document.

## Run with npx

Use `npx` when you do not need a global installation:

```bash
npx @davidtorro/readme-gen --dry-run
```

`--dry-run` prints the generated README to standard output and does not write files. Remove it only after reviewing the result and reading [safe overwrites](/guide/safe-overwrites).

## Install globally

Install the CLI once to use `readme-gen` directly:

```bash
npm install --global @davidtorro/readme-gen
readme-gen --help
```

Check the installed version with:

```bash
readme-gen --version
```

## Choose a language

English is the default. Use a positional language or `--lang`:

```bash
readme-gen en --dry-run
readme-gen --lang en --dry-run
```

Spanish output uses local Ollama automatically. See [Ollama configuration](/guide/ollama) before running it.
