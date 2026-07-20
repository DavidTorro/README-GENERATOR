![Banner](https://raw.githubusercontent.com/DavidTorro/README-GENERATOR/main/assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![Vitest](https://img.shields.io/badge/-Vitest-6e9f18?style=for-the-badge&logo=vitest&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

Generador de README.md para proyectos que crea documentación profesional y atractiva de forma rápida, con la opción de enriquecimiento local mediante inteligencia artificial. Utiliza Ollama para analizar el código y sugerir contenido, y soporta múltiples idiomas.

> ⚡ Crea documentación profesional en segundos, sin salir de tu máquina ni compartir datos sensibles.

## ⚙️ Tecnologías

- 🔤 **Lenguajes**: TypeScript
- 🧪 **Pruebas**: Vitest
- 🤖 **IA**: Ollama
- 🔧 **Herramientas**: tsup

## ✨ Características

- ✨ Genera un README.md completo basado en el análisis del proyecto y sus dependencias
- 🤖 Enriquece el contenido con IA local usando Ollama para descripciones, características y arquitectura
- 🌐 Soporta internacionalización en inglés y español con archivos de traducción integrados
- 📁 Detecta automáticamente tecnologías, scripts, imports y variables de entorno desde el código fuente
- 🛠️ Incluye comandos CLI para ejecutar el generador directamente desde la terminal
- 🔧 Configurable mediante variables de entorno, con valores por defecto optimizados para desarrollo local

## 🏗️ Arquitectura

![Architecture diagram](https://raw.githubusercontent.com/DavidTorro/README-GENERATOR/main/assets/architecture.svg)

| Componente | Tecnología | Detalle |
| --- | --- | --- |
| `Punto de entrada CLI` | TypeScript | src/main.ts - Punto de entrada del CLI |
| `Escaneador de proyecto` | fast-glob | src/project/infrastructure/fs-project-scanner.js - Escanea archivos del proyecto |
| `Motor de IA` | Ollama | src/IA/infrastructure/ollama.client.js - Comunica con el modelo Ollama |
| `Generador de README` | TypeScript | src/readme/application/generate-readme.use-case.js - Genera el contenido final |

## 🗂️ Estructura del proyecto

```
@davidtorro/readme-gen/
├── assets/                                       # Recursos del proyecto
│   └── banner.svg                                # Banner del proyecto
├── src/                                          # Código fuente principal
│   ├── ai/                                       # Lógica de inteligencia artificial
│   │   ├── domain/                               # Dominio de la IA
│   │   │   └── ai-generator.port.ts              # Interfaz generadora IA
│   │   └── infrastructure/                       # Infraestructura de IA
│   │       ├── ai.config.test.ts                 # Pruebas de configuración IA
│   │       ├── ai.config.ts                      # Configuración IA
│   │       ├── ollama.client.test.ts             # Pruebas cliente Ollama
│   │       └── ollama.client.ts                  # Cliente Ollama
│   ├── cli/                                      # Interfaz de línea de comandos
│   │   ├── cli.parser.test.ts                    # Pruebas del parser CLI
│   │   └── cli.parser.ts                         # Parser de comandos CLI
│   ├── project/                                  # Lógica del proyecto
│   │   ├── domain/                               # Dominio del proyecto
│   │   │   ├── project-scanner.port.ts           # Interfaz escaneadora proyecto
│   │   │   ├── project.builder.test.ts           # Pruebas constructor proyecto
│   │   │   ├── project.builder.ts                # Constructor de proyecto
│   │   │   ├── project.detectors.ts              # Detectores de proyecto
│   │   │   └── project.interfaces.ts             # Interfaces del proyecto
│   │   └── infrastructure/                       # Infraestructura del proyecto
│   │       ├── fs-project-scanner.test.ts        # Pruebas escaneador FS
│   │       └── fs-project-scanner.ts             # Escaneador de sistema FS
│   ├── readme/                                   # Generación de README
│   │   ├── application/                          # Casos de uso de README
│   │   │   ├── generate-readme.use-case.test.ts  # Pruebas caso de uso README
│   │   │   └── generate-readme.use-case.ts       # Caso de uso generar README
│   │   └── domain/                               # Dominio de README
│   │       ├── i18n/                             # Internacionalización de README
│   │       │   ├── en.json                       # Traducciones inglés
│   │       │   ├── es.json                       # Traducciones español
│   │       │   └── index.ts                      # Módulo de internacionalización
│   │       ├── readme.architecture.test.ts       # Pruebas arquitectura README
│   │       ├── readme.architecture.ts            # Arquitectura README
│   │       ├── readme.badges.ts                  # Badges del README
│   │       ├── readme.banner.test.ts             # Pruebas banner README
│   │       ├── readme.banner.ts                  # Banner del README
│   │       ├── readme.categories.ts              # Categorías del README
│   │       ├── readme.commands.ts                # Comandos del README
│   │       ├── readme.interfaces.ts              # Interfaces del README
│   │       ├── readme.mermaid.ts                 # Diagramas Mermaid
│   │       ├── readme.render.test.ts             # Pruebas renderizado README
│   │       ├── readme.render.ts                  # Renderizado del README
│   │       ├── readme.sections.ts                # Secciones del README
│   │       └── readme.tree.ts                    # Árbol de archivos README
│   └── main.ts                                   # Punto de entrada CLI
├── .env.example
├── .gitignore
├── LICENSE
├── NOTICE
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tsup.config.ts
```

## 🧪 Pruebas

Este proyecto incluye pruebas con Vitest.

```bash
npm run test
```

## 🚀 Uso

Ejecútalo sin instalarlo con npx:

```bash
npx @davidtorro/readme-gen
```

O instálalo de forma global:

```bash
npm install -g @davidtorro/readme-gen
readme-gen
```

## 📋 Requisitos

- Node.js `>=20`

## 🔐 Variables de entorno

| Variable | Descripción |
| --- | --- |
| `OLLAMA_MODEL` | Modelo de Ollama para analizar código y redactar el README |
| `OLLAMA_URL` | URL del servidor Ollama |

## 👤 Autor

Hecho por **David Torró**

## 📄 Licencia

Apache-2.0
