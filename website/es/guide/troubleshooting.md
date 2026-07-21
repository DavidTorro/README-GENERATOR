# Solución de problemas

## `README.md already exists`

El CLI protege las salidas existentes. Primero previsualiza y usa ambos indicadores de confirmación solo cuando quieras reemplazar el archivo completo:

```bash
readme-gen --dry-run
readme-gen en --force --all
```

Para actualizar solo la arquitectura, usa `readme-gen mermaid en --force`.

## No se puede conectar con Ollama

Comprueba que el servicio local está en marcha, que el modelo seleccionado está instalado y que `OLLAMA_URL` apunta a él:

```bash
ollama list
ollama serve
```

Después ejecuta el CLI con `--dry-run` para comprobar la integración sin escribir archivos.

## El banner ya existe

`assets/banner.svg` está protegido. Previsualiza con `readme-gen banner --dry-run` o reemplázalo intencionadamente con `readme-gen banner --force`.

## Combinación de opciones no compatible

`banner` no admite `--ai` ni `--output`. `mermaid` siempre utiliza Ollama, siempre actualiza `README.md` y rechaza `--ai`, `--output` y `--all`.

Ejecuta `readme-gen --help` para consultar los argumentos y ejemplos admitidos.
