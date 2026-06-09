"use client";

import { getProxiedImageUrl } from "@/lib/image-url";

interface ProxiedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
}

/**
 * Imagen que usa el proxy para URLs de Firebase Storage, evitando CORS.
 * Usar en admin (vista previa) y en tienda (productos).
 */
export function ProxiedImage({ src, alt = "", ...props }: ProxiedImageProps) {
  const resolvedSrc = getProxiedImageUrl(src);
  if (!resolvedSrc) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Proxy URLs; alt viene de props
    <img src={resolvedSrc} alt={alt} {...props} />
  );
}
