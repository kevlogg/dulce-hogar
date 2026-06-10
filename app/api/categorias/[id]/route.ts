import { getAdminFirestore } from "@/lib/firebase/admin";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const docSnap = await db.collection("categorias").doc(id).get();

    if (!docSnap.exists) {
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const body = await req.json();

    await db.collection("categorias").doc(id).update({
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id });
  } catch (error) {
    console.error("Error updating categoria:", error);
    return Response.json(
      { error: "Failed to update categoria" },
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
    const db = getAdminFirestore();
    await db.collection("categorias").doc(id).delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting categoria:", error);
    return Response.json(
      { error: "Failed to delete categoria" },
      { status: 500 }
    );
  }
}
