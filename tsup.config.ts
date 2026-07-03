import { defineConfig } from "tsup"; 

// Definimos la configuración de construcción del proyecto
export default defineConfig({
  entry: ["src/main.ts"], // Archivo de entrada principal del proyecto
  format: ["esm"], // Formato de salida: ESM (ECMAScript Modules)
  target: "node20", // Versión de Node.js objetivo para la construcción
  clean: true, // borra dist/ antes de cada build
});