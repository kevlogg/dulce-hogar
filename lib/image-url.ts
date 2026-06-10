/**
 * Convierte URLs de Firebase Storage a URLs proxiadas
 * Para evitar problemas de CORS en el navegador
 */
export function getProxiedImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;

  // Si es una URL de Firebase Storage, proxiarla a través de Next.js
  if (src.includes("firebasestorage.googleapis.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  }

  // Para otras URLs, retornarlas tal cual
  return src;
}
