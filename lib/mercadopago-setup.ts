// SETUP MERCADO PAGO
// Cuando tengas credenciales, sigue estos pasos:

// 1. Obtén credenciales en: https://www.mercadopago.com.ar/developers/panel
//    - NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
//    - MERCADOPAGO_ACCESS_TOKEN

// 2. Agrégalas a .env.local:
//    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_public_key
//    MERCADOPAGO_ACCESS_TOKEN=tu_access_token

// 3. Descomenta el código en app/api/pagos/crear-preferencia/route.ts
// 4. Descomenta el código en app/api/pagos/confirmar/route.ts

// 5. Test en sandbox: https://www.mercadopago.com.ar/developers/es/guides/resources/sandbox

// ========== ESTRUCTURA LISTA ==========

export async function crearPreferenciaMercadoPago(ordenId: string, montoTotal: number) {
  // IMPLEMENTAR cuando tengas credenciales
  // Usar: mercadopago SDK
  // Retornar: preference_id y checkout_url
  throw new Error("Mercado Pago no configurado. Agrega credenciales a .env.local");
}

export async function confirmarPagoMercadoPago(paymentId: string) {
  // IMPLEMENTAR cuando tengas credenciales
  // Usar: mercadopago SDK para consultar estado del pago
  // Retornar: { status: "approved" | "rejected" | "pending" }
  throw new Error("Mercado Pago no configurado");
}
