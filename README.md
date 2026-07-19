![Banner](./assets/banner.svg)

# 📝 @davidtorro/readme-gen

![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white) ![Vitest](https://img.shields.io/badge/-Vitest-6e9f18?style=for-the-badge&logo=vitest&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-0f172a?style=for-the-badge) ![Ollama](https://img.shields.io/badge/-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

Generador de README.md profesional para proyectos Node.js. Analiza automáticamente el código fuente, detecta tecnologías y crea un documento atractivo con secciones estructuradas. Incluye enriquecimiento opcional con IA local usando Ollama para descripciones, características y arquitectura.

> 🚀 Crea README.md profesionales en segundos sin salir de tu terminal

## ⚙️ Tecnologías

- 🔤 **Lenguajes**: TypeScript
- 🧪 **Pruebas**: Vitest
- 🤖 **IA**: Ollama
- 🔧 **Herramientas**: tsup

## ✨ Características

- ✨ Genera README.md completo con secciones como descripción, características, instalación y uso
- 🔧 Detecta automáticamente tecnologías y dependencias del proyecto (TypeScript, Vitest, etc.)
- 🤖 Enriquece el contenido con IA local mediante Ollama para mejorar descripciones y arquitectura
- 🌐 Soporta múltiples idiomas: inglés y español, con sistema de traducciones escalable
- 📂 Analiza archivos .env.example para documentar variables de entorno del proyecto
- 🛠️ Comando CLI para generar banner SVG personalizado con soporte para IA

## 🏗️ Arquitectura

```mermaid
%%{init: {
    "theme": "base",
    "flowchart": { "curve": "basis", "nodeSpacing": 60, "rankSpacing": 90 },
    "themeVariables": {
        "primaryColor": "#1f2937",
        "primaryTextColor": "#f9fafb",
        "primaryBorderColor": "#60a5fa",
        "lineColor": "#94a3b8",
        "tertiaryColor": "#0f172a"
    }
}}%%

flowchart LR
    subgraph SG0["🔧 Punto de entrada"]
        direction LR
        cli["🖥️ Herramienta CLI<br/>node src/main.ts"]
    end
    subgraph SG1["🔍 Escaneador de proyecto"]
        direction LR
        scanner["🔍 Escaneador de proyecto<br/>fs-project-scanner.js"]
    end
    subgraph SG2["🧠 Motor de IA"]
        direction LR
        ai["🤖 Ollama<br/>http://localhost:11434"]
    end
    subgraph SG3["📄 Generador de README"]
        direction LR
        generator["📝 Generador de README<br/>generate-readme.use-case.js"]
    end
    user["👤 Usuario"]
    user -- "ejecutar" --> cli
    cli -- "analizar" --> scanner
    scanner -- "info proyecto" --> generator
    cli -- "consultar" --> ai
    ai -- "enriquecer" --> generator

    classDef g0 fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:2px;
    class cli g0;
    classDef g1 fill:#111827,stroke:#c084fc,color:#f8fafc,stroke-width:2px;
    class scanner g1;
    classDef g2 fill:#08111f,stroke:#34d399,color:#f8fafc,stroke-width:2px;
    class ai g2;
    classDef g3 fill:#1f2937,stroke:#f472b6,color:#f8fafc,stroke-width:2px;
    class generator g3;
    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;
    class user actor;
    style SG0 fill:#0b1220,stroke:#38bdf8,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG1 fill:#0b1220,stroke:#c084fc,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG2 fill:#0b1220,stroke:#34d399,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
    style SG3 fill:#0b1220,stroke:#f472b6,stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0
```

| Componente | Tecnología | Detalle |
| --- | --- | --- |
| `Herramienta CLI` | TypeScript + Node.js | Punto de entrada principal del generador de README |
| `Escaneador de proyecto` | fast-glob + fs | Analiza el árbol de archivos y dependencias del proyecto |
| `Motor de IA` | Ollama + modelo qwen3-coder:30b | Servicio de lenguaje para generar contenido del README |
| `Generador de README` | TypeScript | Construye el archivo README.md con datos analizados y generados por IA |## 🧪 Pruebas

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
