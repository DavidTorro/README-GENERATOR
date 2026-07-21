# Instalación

`@davidtorro/readme-gen` requiere Node.js 20 o posterior. Ejecútalo desde la raíz del proyecto que quieres documentar.

## Ejecutar con npx

Usa `npx` si no necesitas una instalación global:

```bash
npx @davidtorro/readme-gen --dry-run
```

`--dry-run` imprime el README generado en la salida estándar y no escribe archivos. Elimínalo solo después de revisar el resultado y leer [sobrescrituras seguras](/es/guide/safe-overwrites).

## Instalar globalmente

Instala el CLI una vez para utilizar `readme-gen` directamente:

```bash
npm install --global @davidtorro/readme-gen
readme-gen --help
```

Comprueba la versión instalada con:

```bash
readme-gen --version
```

## Elegir idioma

El inglés es el valor predeterminado. Utiliza un idioma posicional o `--lang`:

```bash
readme-gen en --dry-run
readme-gen --lang en --dry-run
```

La salida en español usa Ollama local automáticamente. Consulta la [configuración de Ollama](/es/guide/ollama) antes de ejecutarla.
