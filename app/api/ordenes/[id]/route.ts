import { getAdminFirestore } from "@/lib/firebase/admin";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const docSnap = await db.collection("ordenes").doc(id).get();

    if (!docSnap.exists) {
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
    const db = getAdminFirestore();
    const body = await req.json();

    await db.collection("ordenes").doc(id).update({
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
