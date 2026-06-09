import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, clienteInfo, direccionEnvio, montoTotal } = body;

    if (!items || !clienteInfo || !direccionEnvio) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, "ordenes"), {
      items,
      clienteInfo,
      direccionEnvio,
      montoSubtotal: montoTotal,
      montoEnvio: 0,
      montoTotal,
      estadoPago: "pendiente",
      estadoEnvio: "procesando",
      metodoPago: "mercadopago",
      mercadopagoPreferenceId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
