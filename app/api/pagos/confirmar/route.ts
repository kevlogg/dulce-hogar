import { confirmarPagoMercadoPago } from "@/lib/mercadopago-setup";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { crearEnvio, EnviopackError } from "@/lib/enviopack";
import {
  sendTrackingEmail,
  sendTrackingPendingEmail,
  sendShipmentFailedAlert,
} from "@/lib/email";
import type { Orden } from "@/lib/types";

export async function POST(req: Request) {
  let paymentId: string;
  let ordenId: string;

  try {
    const body = await req.json();
    paymentId = body.paymentId;
    ordenId = body.ordenId;
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!paymentId || !ordenId) {
    return Response.json(
      { error: "Missing paymentId or ordenId" },
      { status: 400 }
    );
  }

  // 1. Verify payment with Mercado Pago
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentStatus: { status: string } = null as any;
  try {
    paymentStatus = (await confirmarPagoMercadoPago(paymentId)) as unknown as { status: string };
  } catch (err) {
    console.error("MP verification error:", err);
    return Response.json({ error: "Error verificando pago" }, { status: 502 });
  }

  if (paymentStatus.status !== "approved") {
    return Response.json({ approved: false, status: paymentStatus.status });
  }

  const db = getAdminFirestore();
  const ordenRef = db.collection("ordenes").doc(ordenId);

  // 2. Fetch full order
  const ordenSnap = await ordenRef.get();
  if (!ordenSnap.exists) {
    return Response.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  const orden = { id: ordenSnap.id, ...ordenSnap.data() } as Orden;

  // 3. Mark payment as completed
  await ordenRef.update({
    estadoPago: "completado",
    mercadopagoPaymentId: paymentId,
    updatedAt: new Date(),
  });

  // 4. Fetch product dimensions
  const productosSnaps = await Promise.all(
    orden.items.map((item) =>
      db.collection("productos").doc(item.productoId).get()
    )
  );
  const dimensiones = productosSnaps.map((snap, idx) => ({
    peso: snap.data()?.peso ?? 1,
    alto: snap.data()?.alto ?? 10,
    ancho: snap.data()?.ancho ?? 10,
    largo: snap.data()?.largo ?? 10,
    cantidad: orden.items[idx].cantidad,
  }));

  // 5. Create shipment in Envíopack
  try {
    const { enviopackId, trackingNumber } = await crearEnvio({
      ordenId: orden.id,
      clienteInfo: orden.clienteInfo,
      direccionEnvio: orden.direccionEnvio,
      dimensiones,
    });

    await ordenRef.update({ enviopackId, trackingNumber, updatedAt: new Date() });

    try {
      await sendTrackingEmail({ ...orden, trackingNumber, enviopackId } as Orden);
    } catch (emailErr) {
      console.error("Tracking email failed (non-blocking):", emailErr);
    }

    return Response.json({ success: true, trackingNumber });
  } catch (err) {
    const errorMsg =
      err instanceof EnviopackError
        ? `EnviopackError ${err.status}: ${err.message}`
        : err instanceof Error
        ? err.message
        : String(err);

    console.error("Envíopack crearEnvio failed:", errorMsg);

    await ordenRef.update({ estadoEnvio: "sin_envio", updatedAt: new Date() });

    try {
      await sendTrackingPendingEmail(orden);
      await sendShipmentFailedAlert(orden, errorMsg);
    } catch (emailErr) {
      console.error("Alert email failed (non-blocking):", emailErr);
    }

    // Payment succeeded — shipment handled manually by admin
    return Response.json({ success: true, trackingNumber: null });
  }
}
