# Safe overwrites

The CLI avoids replacing existing files by default. Always start with `--dry-run` when working in a project with documentation you need to preserve.

## Complete README replacement

If the destination already exists, generating a complete README needs both flags:

```bash
readme-gen en --force --all
```

`--force` permits an overwrite, while `--all` confirms that the whole existing README will be replaced. Using `--force` without `--all` intentionally fails when the output already exists.

For a custom destination, the same rule applies when that path exists:

```bash
readme-gen es --output docs/README.es.md --force --all
```

The CLI creates missing parent directories for a custom output path.

## Targeted architecture update

Use `mermaid` when you only need to refresh the architecture section. It does not replace the complete README:

```bash
readme-gen mermaid en --force
```

This command requires `--force` because it modifies the existing `README.md`. `--all` is rejected because no complete README is replaced.

## Banner replacement

An existing `assets/banner.svg` is protected too:

```bash
readme-gen banner --force
```

## Preview without writing

`--dry-run` never writes to disk and does not require overwrite confirmation:

```bash
readme-gen --dry-run
readme-gen banner --dry-run
readme-gen mermaid es --dry-run
```
