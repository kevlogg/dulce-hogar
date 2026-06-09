import { getFirebaseFirestore } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirebaseFirestore();
    const docRef = doc(db, "ordenes", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
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
    const docRef = doc(db, "ordenes", id);

    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
