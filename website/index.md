---
layout: home

hero:
  name: readme-gen
  text: README documentation from your project
  tagline: Generate a polished README.md from local project analysis, with optional Ollama enrichment.
  actions:
    - theme: brand
      text: Read the documentation
      link: /guide/installation
    - theme: alt
      text: View on npm
      link: https://www.npmjs.com/package/@davidtorro/readme-gen

features:
  - title: Local analysis
    details: Detect project structure, package metadata, scripts, dependencies, and source files.
  - title: Optional local AI
    details: Use a local Ollama instance to enrich README content, translate it to Spanish, or generate Mermaid architecture data.
  - title: Safe by default
    details: Existing files are never replaced unless the required confirmation flags are explicit.
---

## Start here

Run the CLI in the project you want to document:

```bash
npx @davidtorro/readme-gen --dry-run
```

The dry run prints the generated README without writing files. Continue with [installation](/guide/installation) for all options.
