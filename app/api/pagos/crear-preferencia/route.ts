// API MERCADO PAGO - CREAR PREFERENCIA
// DESCOMENTA CUANDO TENGAS CREDENCIALES EN .env.local

import { crearPreferenciaMercadoPago } from "@/lib/mercadopago-setup";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ordenId, montoTotal } = body;

    // const preferenceId = await crearPreferenciaMercadoPago(ordenId, montoTotal);
    // return Response.json({ preferenceId });

    return Response.json(
      {
        error:
          "Mercado Pago no configurado. Agrega credenciales a .env.local",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
