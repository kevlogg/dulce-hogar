import { getAdminFirestore } from "@/lib/firebase/admin";
import { Categoria } from "@/lib/types";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("categorias")
      .orderBy("orden", "asc")
      .get();
    const categorias = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Categoria[];

    return Response.json(categorias);
  } catch (error) {
    console.error("Error fetching categorias:", error);
    return Response.json(
      { error: "Failed to fetch categorias" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminFirestore();
    const body = await req.json();
    const { nombre, descripcion, imagen, orden } = body;

    if (!nombre) {
      return Response.json(
        { error: "Nombre is required" },
        { status: 400 }
      );
    }

    const docRef = await db.collection("categorias").add({
      nombre,
      descripcion: descripcion || "",
      imagen: imagen || "",
      orden: orden || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating categoria:", error);
    return Response.json(
      { error: "Failed to create categoria" },
      { status: 500 }
    );
  }
}
