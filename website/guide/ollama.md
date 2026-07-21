# Ollama configuration

Ollama is optional for a standard English README. It is required for Spanish README generation, Spanish banner taglines, Mermaid architecture regeneration, and the English `--ai` option.

## Start Ollama locally

Install Ollama from [ollama.com](https://ollama.com), download a model, and make sure its local server is available:

```bash
ollama pull llama3.2
ollama serve
```

The server normally listens on `http://127.0.0.1:11434`.

## Configure the model and URL

Set these variables in your shell or in the project's environment configuration:

```bash
export OLLAMA_MODEL=llama3.2
export OLLAMA_URL=http://127.0.0.1:11434
```

`OLLAMA_MODEL` selects the local model. `OLLAMA_URL` overrides the local server URL. Do not commit credentials or machine-specific environment files.

## Use AI enrichment

```bash
readme-gen en --ai --dry-run
readme-gen es --dry-run
readme-gen mermaid es --dry-run
```

Use `--dry-run` first to verify that Ollama is reachable and that the generated content is suitable for the project.
