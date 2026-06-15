import { getAdminFirestore } from "@/lib/firebase/admin";
import { Producto } from "@/lib/types";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("productos")
      .orderBy("createdAt", "desc")
      .get();
    const productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Producto[];

    return Response.json(productos);
  } catch (error) {
    console.error("Error fetching productos:", error);
    return Response.json(
      { error: "Failed to fetch productos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminFirestore();
    const body = await req.json();
    const {
      nombre,
      descripcion,
      precio,
      precioEfectivo,
      imagenes,
      categoria,
      categoriaId,
      stock,
      opciones,
      accesorios,
      especificaciones,
    } = body;

    if (!nombre || !precio) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = await db.collection("productos").add({
      nombre,
      descripcion: descripcion || "",
      precio: Number(precio),
      precioEfectivo: precioEfectivo ? Number(precioEfectivo) : Math.round(Number(precio) * 0.75),
      imagenes: imagenes || [],
      categoria: categoria || categoriaId || "",
      categoriaId: categoriaId || categoria || "",
      stock: stock || 0,
      opciones: opciones || [],
      accesorios: accesorios || [],
      especificaciones: especificaciones || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating producto:", error);
    return Response.json(
      { error: "Failed to create producto" },
      { status: 500 }
    );
  }
}
