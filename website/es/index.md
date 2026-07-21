---
layout: home

hero:
  name: readme-gen
  text: Documentación README desde tu proyecto
  tagline: Genera un README.md cuidado desde el análisis local del proyecto, con enriquecimiento opcional mediante Ollama.
  actions:
    - theme: brand
      text: Leer la documentación
      link: /es/guide/installation
    - theme: alt
      text: Ver en npm
      link: https://www.npmjs.com/package/@davidtorro/readme-gen

features:
  - title: Análisis local
    details: Detecta la estructura del proyecto, metadatos de paquete, scripts, dependencias y archivos de código.
  - title: IA local opcional
    details: Usa una instancia local de Ollama para enriquecer el README, traducirlo al español o generar datos para la arquitectura Mermaid.
  - title: Seguro por defecto
    details: Nunca reemplaza archivos existentes sin los indicadores de confirmación necesarios.
---

## Empieza aquí

Ejecuta el CLI en el proyecto que quieres documentar:

```bash
npx @davidtorro/readme-gen --dry-run
```

El modo de prueba muestra el README generado sin escribir archivos. Consulta la [instalación](/es/guide/installation) para conocer todas las opciones.
