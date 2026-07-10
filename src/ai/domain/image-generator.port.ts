// Contrato del generador de imágenes con IA
// Devuelve los BYTES del PNG:
// el domain no sabe de ficheros; escribirlo en disco es cosa del composition root
// undefined = la generación se degradó (mismo criterio que el enrichment)
export interface ImageGeneratorPort {
  generateImage(prompt: string): Promise<Uint8Array | undefined>;
}