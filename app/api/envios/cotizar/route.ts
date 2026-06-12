import { cotizarEnvio, EnviopackError } from "@/lib/enviopack";
import { getAdminFirestore } from "@/lib/firebase/admin";

interface CotizarBody {
  codigoPostal: string;
  tipoEntrega: "domicilio" | "sucursal";
  sucursalId?: string;
  items: { productoId: string; cantidad: number }[];
}

export async function POST(req: Request) {
  let body: CotizarBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const { codigoPostal, tipoEntrega, sucursalId, items } = body;

  if (!codigoPostal || !tipoEntrega || !items?.length) {
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const db = getAdminFirestore();

  const productosDocs = await Promise.all(
    items.map(({ productoId }) =>
      db.collection("productos").doc(productoId).get()
    )
  );

  const sinDimensiones: string[] = [];
  const dimensiones = productosDocs.map((snap, idx) => {
    const data = snap.data();
    if (!data?.peso || !data?.alto || !data?.ancho || !data?.largo) {
      sinDimensiones.push(data?.nombre ?? items[idx].productoId);
    }
    return {
      peso: data?.peso ?? 0,
      alto: data?.alto ?? 0,
      ancho: data?.ancho ?? 0,
      largo: data?.largo ?? 0,
      cantidad: items[idx].cantidad,
    };
  });

  if (sinDimensiones.length > 0) {
    return Response.json(
      { error: "missing_dimensions", productos: sinDimensiones },
      { status: 422 }
    );
  }

  const pesoTotal = dimensiones.reduce(
    (acc, d) => acc + d.peso * d.cantidad,
    0
  );
  const alto = Math.max(...dimensiones.map((d) => d.alto));
  const ancho = Math.max(...dimensiones.map((d) => d.ancho));
  const largo = Math.max(...dimensiones.map((d) => d.largo));

  try {
    const costo = await cotizarEnvio({
      codigoPostal,
      tipoEntrega,
      sucursalId,
      peso: pesoTotal,
      alto,
      ancho,
      largo,
    });
    return Response.json({ costo });
  } catch (err) {
    if (err instanceof EnviopackError) {
      return Response.json(
        { error: "No disponible para esta zona" },
        { status: 502 }
      );
    }
    console.error("Error cotizando envío:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
