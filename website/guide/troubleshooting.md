# Troubleshooting

## `README.md already exists`

The CLI protects existing output. Preview first, then use both confirmation flags only when replacing the complete file is intended:

```bash
readme-gen --dry-run
readme-gen en --force --all
```

To update only architecture, use `readme-gen mermaid en --force` instead.

## Ollama cannot be reached

Check that the local service is running, that the selected model is installed, and that `OLLAMA_URL` points to it:

```bash
ollama list
ollama serve
```

Then run the CLI with `--dry-run` to test the integration without writing files.

## Banner already exists

`assets/banner.svg` is protected. Preview with `readme-gen banner --dry-run`, or deliberately replace it with `readme-gen banner --force`.

## Unsupported option combination

`banner` does not support `--ai` or `--output`. `mermaid` always uses Ollama, always updates `README.md`, and rejects `--ai`, `--output`, and `--all`.

Run `readme-gen --help` to see the supported arguments and examples.
