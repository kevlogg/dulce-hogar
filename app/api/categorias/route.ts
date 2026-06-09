import { getFirebaseFirestore } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { Categoria } from "@/lib/types";

export async function GET() {
  try {
    const db = getFirebaseFirestore();
    const q = query(collection(db, "categorias"), orderBy("orden", "asc"));
    const snapshot = await getDocs(q);
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
    const db = getFirebaseFirestore();
    const body = await req.json();
    const { nombre, descripcion, imagen, orden } = body;

    if (!nombre) {
      return Response.json(
        { error: "Nombre is required" },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "categorias"), {
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
