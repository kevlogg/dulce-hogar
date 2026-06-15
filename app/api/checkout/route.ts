import { getAdminFirestore } from "@/lib/firebase/admin";
import { MercadoPagoConfig, Preference } from "mercadopago";

function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, clienteInfo, direccionEnvio, montoTotal, montoEnvio, metodoPago } = body;

    if (!items || !clienteInfo || !direccionEnvio) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getAdminFirestore();

    // 1. Crear orden en Firestore
    const docRef = await db.collection("ordenes").add({
      items,
      clienteInfo,
      direccionEnvio,
      montoSubtotal: montoTotal - (montoEnvio ?? 0),
      montoEnvio: montoEnvio ?? 0,
      montoTotal,
      estadoPago: "pendiente",
      estadoEnvio: "procesando",
      metodoPago: "mercadopago",
      mercadopagoPreferenceId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const orderId = docRef.id;

    // 2. Crear preferencia en MercadoPago
    const client = getMPClient();
    const preference = new Preference(client);

    const mpItems = items.map((item: any) => ({
      id: item.productoId,
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: item.precioUnitario,
      currency_id: "ARS",
    }));

    // Agregar envío como ítem si tiene costo
    if ((montoEnvio ?? 0) > 0) {
      mpItems.push({
        id: "envio",
        title: "Envío",
        quantity: 1,
        unit_price: montoEnvio,
        currency_id: "ARS",
      });
    }

    const prefResult = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: clienteInfo.nombre,
          surname: clienteInfo.apellido,
          email: clienteInfo.email,
          phone: { number: clienteInfo.telefono },
        },
        back_urls: {
          success: `${BASE_URL}/confirmacion?orden=${orderId}`,
          failure: `${BASE_URL}/checkout?error=pago_fallido`,
          pending: `${BASE_URL}/confirmacion?orden=${orderId}&pendiente=1`,
        },
        auto_return: "approved",
        external_reference: orderId,
        statement_descriptor: "Dulce Hogar",
      },
    });

    // 3. Guardar el preference ID en la orden
    await docRef.update({ mercadopagoPreferenceId: prefResult.id ?? "" });

    return Response.json({
      id: orderId,
      init_point: prefResult.init_point,
    }, { status: 201 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Checkout error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
