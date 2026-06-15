import { getAdminFirestore } from "@/lib/firebase/admin";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const docSnap = await db.collection("productos").doc(id).get();

    if (!docSnap.exists) {
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
    const db = getAdminFirestore();
    const body = await req.json();

    const updateData: Record<string, any> = { ...body, updatedAt: new Date() };
    // Ensure accesorios is always written (even as empty array)
    if (!("accesorios" in updateData)) updateData.accesorios = [];
    await db.collection("productos").doc(id).update(updateData);

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
    const db = getAdminFirestore();
    await db.collection("productos").doc(id).delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting producto:", error);
    return Response.json(
      { error: "Failed to delete producto" },
      { status: 500 }
    );
  }
}
