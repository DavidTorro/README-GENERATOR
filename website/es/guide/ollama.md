# Configuración de Ollama

Ollama es opcional para un README estándar en inglés. Es obligatorio para generar README en español, subtítulos de banner en español, regenerar la arquitectura Mermaid y usar `--ai` en inglés.

## Iniciar Ollama localmente

Instala Ollama desde [ollama.com](https://ollama.com), descarga un modelo y comprueba que su servidor local está disponible:

```bash
ollama pull llama3.2
ollama serve
```

El servidor suele escuchar en `http://127.0.0.1:11434`.

## Configurar modelo y URL

Define estas variables en tu terminal o en la configuración de entorno del proyecto:

```bash
export OLLAMA_MODEL=llama3.2
export OLLAMA_URL=http://127.0.0.1:11434
```

`OLLAMA_MODEL` selecciona el modelo local. `OLLAMA_URL` sustituye la URL del servidor local. No publiques credenciales ni archivos de entorno específicos de una máquina.

## Usar enriquecimiento con IA

```bash
readme-gen en --ai --dry-run
readme-gen es --dry-run
readme-gen mermaid es --dry-run
```

Utiliza primero `--dry-run` para comprobar que Ollama es accesible y que el contenido generado es adecuado para el proyecto.
