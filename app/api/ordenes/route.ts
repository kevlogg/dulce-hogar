import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("ordenes")
      .orderBy("createdAt", "desc")
      .get();
    const ordenes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json(ordenes);
  } catch (error) {
    console.error("Error fetching ordenes:", error);
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
