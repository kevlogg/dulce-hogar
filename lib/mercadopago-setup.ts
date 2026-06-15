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

export async function crearPreferenciaMercadoPago(_ordenId: string, _montoTotal: number) {
  throw new Error("Usar /api/checkout en su lugar");
}

export async function confirmarPagoMercadoPago(paymentId: string) {
  const { MercadoPagoConfig, Payment } = await import("mercadopago");
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });
  return { status: result.status };
}
