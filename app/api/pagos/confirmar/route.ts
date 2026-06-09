// API MERCADO PAGO - CONFIRMAR PAGO
// DESCOMENTA CUANDO TENGAS CREDENCIALES EN .env.local

import { confirmarPagoMercadoPago } from "@/lib/mercadopago-setup";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, ordenId } = body;

    // const paymentStatus = await confirmarPagoMercadoPago(paymentId);

    // if (paymentStatus.status === "approved") {
    //   const db = getFirebaseFirestore();
    //   const docRef = doc(db, "ordenes", ordenId);
    //   await updateDoc(docRef, {
    //     estadoPago: "completado",
    //     mercadopagoPaymentId: paymentId,
    //     updatedAt: new Date(),
    //   });
    //   return Response.json({ success: true });
    // }

    return Response.json(
      { error: "Mercado Pago no configurado" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
