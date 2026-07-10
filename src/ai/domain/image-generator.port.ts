// Contrato del generador de imágenes con IA. Devuelve los BYTES del PNG;
// undefined = degradación (mismo criterio que el resto de tareas de IA)
export interface ImageGeneratorPort {
  generateImage(prompt: string, width: number, height: number): Promise<Uint8Array | undefined>;
}