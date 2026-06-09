import { getFirebaseFirestore } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirebaseFirestore();
    const docRef = doc(db, "categorias", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching categoria:", error);
    return Response.json(
      { error: "Failed to fetch categoria" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirebaseFirestore();
    const body = await req.json();
    const docRef = doc(db, "categorias", params.id);

    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id: params.id });
  } catch (error) {
    console.error("Error updating categoria:", error);
    return Response.json(
      { error: "Failed to update categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirebaseFirestore();
    const docRef = doc(db, "categorias", params.id);
    await deleteDoc(docRef);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting categoria:", error);
    return Response.json(
      { error: "Failed to delete categoria" },
      { status: 500 }
    );
  }
}
