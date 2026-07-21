# Comandos

El CLI tiene tres comandos. `readme` es el comando predeterminado, por lo que normalmente se omite.

## Generar un README

```bash
readme-gen [en|es] [options]
```

Opciones relevantes:

| Opción | Significado |
| --- | --- |
| `--ai` | Enriquece un README en inglés con Ollama local. |
| `-l, --lang <en|es>` | Selecciona el idioma de salida. |
| `-o, --output <path>` | Escribe en una ruta personalizada en vez de `README.md`. |
| `--dry-run` | Imprime el resultado sin escribir. |
| `-f, --force` | Permite reemplazar una salida existente. |
| `--all` | Confirma el reemplazo de un README existente completo. |

Todo README completo generado por este comando termina con un enlace corto de atribución a [readme-gen](https://readme-gen.davidtorro.com). No se añade con `banner` ni con `mermaid`.

## Generar un banner

```bash
readme-gen banner [en|es] [options]
```

Escribe `assets/banner.svg`. `--dry-run` imprime el SVG en su lugar. Los banners existentes requieren `--force`. Un banner en español usa Ollama para traducir el subtítulo; este comando no admite `--ai` ni `--output`.

```bash
readme-gen banner --dry-run
readme-gen banner es --force
```

## Regenerar la arquitectura Mermaid

```bash
readme-gen mermaid [en|es] [options]
```

Este comando siempre usa Ollama local y actualiza solo un bloque Mermaid generado previamente por `readme-gen` en `README.md`. Necesita un README generado existente salvo con `--dry-run`, y requiere `--force` para escribir. Se detiene en lugar de reemplazar una sección de arquitectura manual.

```bash
readme-gen mermaid es --dry-run
readme-gen mermaid en --force
```

`mermaid` no admite `--ai`, `--output` ni `--all`.
