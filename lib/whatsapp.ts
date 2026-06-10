/**
 * Configuración y utilidades para WhatsApp
 * Contacto: Flor y Esteban de Dulce Hogar
 */

const WHATSAPP_PHONE = "5491126917777"; // +54 9 11 2691 7777 sin formato

export function isWhatsAppConfigured(): boolean {
  return !!WHATSAPP_PHONE;
}

export function whatsappUrl(message: string): string {
  if (!isWhatsAppConfigured()) return "#";

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
}

export function messageGeneral(): string {
  return "Hola, tengo una consulta sobre Dulce Hogar";
}

export function messageProduct(productName: string): string {
  return `Hola, me interesa el producto: ${productName}`;
}
