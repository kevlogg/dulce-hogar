import { getFirebaseFirestore } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirebaseFirestore();
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching producto:", error);
    return Response.json(
      { error: "Failed to fetch producto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirebaseFirestore();
    const body = await req.json();
    const docRef = doc(db, "productos", id);

    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id });
  } catch (error) {
    console.error("Error updating producto:", error);
    return Response.json(
      { error: "Failed to update producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirebaseFirestore();
    const docRef = doc(db, "productos", id);
    await deleteDoc(docRef);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting producto:", error);
    return Response.json(
      { error: "Failed to delete producto" },
      { status: 500 }
    );
  }
}
