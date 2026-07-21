# Sobrescrituras seguras

El CLI evita reemplazar archivos existentes de forma predeterminada. Empieza siempre con `--dry-run` en proyectos con documentación que necesites conservar.

## Reemplazar un README completo

Si el destino ya existe, generar un README completo requiere ambos indicadores:

```bash
readme-gen en --force --all
```

`--force` permite sobrescribir y `--all` confirma que se reemplazará todo el README existente. Usar `--force` sin `--all` falla intencionadamente cuando la salida ya existe.

En un destino personalizado se aplica la misma regla cuando esa ruta existe:

```bash
readme-gen es --output docs/README.es.md --force --all
```

## Actualizar solo la arquitectura

Usa `mermaid` si solo necesitas actualizar la sección de arquitectura. No reemplaza el README completo:

```bash
readme-gen mermaid en --force
```

Este comando requiere `--force` porque modifica el `README.md` existente. `--all` se rechaza porque no se reemplaza ningún README completo.

## Reemplazar un banner

Un `assets/banner.svg` existente también está protegido:

```bash
readme-gen banner --force
```

## Previsualizar sin escribir

`--dry-run` no escribe en disco ni requiere confirmación de sobrescritura:

```bash
readme-gen --dry-run
readme-gen banner --dry-run
readme-gen mermaid es --dry-run
```
