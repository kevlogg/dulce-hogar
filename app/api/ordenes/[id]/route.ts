import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("ordenes").doc(params.id).get();
    if (!snap.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Error fetching orden:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
