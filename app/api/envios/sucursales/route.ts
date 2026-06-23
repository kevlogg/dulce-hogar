import { getSucursales, EnviopackError } from "@/lib/enviopack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cp = searchParams.get("cp");

  if (!cp || cp.length < 4) {
    return Response.json({ error: "Código postal inválido" }, { status: 400 });
  }

  try {
    const sucursales = await getSucursales(cp);
    return Response.json({ sucursales });
  } catch (err) {
    if (err instanceof EnviopackError) {
      console.error("Enviopack sucursales error:", err.status, err.message);
      return Response.json({ sucursales: [] }, { status: 200 });
    }
    console.error("Error fetching sucursales:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
