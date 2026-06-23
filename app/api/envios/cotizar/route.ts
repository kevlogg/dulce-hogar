import { cotizarEnvio, EnviopackError } from "@/lib/enviopack";
import { getAdminFirestore } from "@/lib/firebase/admin";

interface CotizarBody {
  provincia: string;
  tipoEntrega: "domicilio" | "sucursal";
  items: { productoId: string; cantidad: number }[];
}

export async function POST(req: Request) {
  let body: CotizarBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const { provincia, tipoEntrega, items } = body;

  if (!provincia || !tipoEntrega || !items?.length) {
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const productosDocs = await Promise.all(
    items.map(({ productoId }) => db.collection("productos").doc(productoId).get())
  );

  const dimensiones = productosDocs.map((snap, idx) => ({
    peso: snap.data()?.peso ?? 5,
    cantidad: items[idx].cantidad,
  }));

  const pesoTotal = dimensiones.reduce((acc, d) => acc + d.peso * d.cantidad, 0);

  try {
    const costo = await cotizarEnvio({
      provincia,
      tipoEntrega,
      peso: pesoTotal,
    });
    return Response.json({ costo });
  } catch (err) {
    if (err instanceof EnviopackError) {
      console.error("Enviopack cotizar error:", err.status, err.message);
      return Response.json({ error: "No disponible para esta zona" }, { status: 502 });
    }
    console.error("Error cotizando envío:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
