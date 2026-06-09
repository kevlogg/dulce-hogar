import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function GET() {
  try {
    const db = getFirebaseFirestore();
    const q = query(collection(db, "ordenes"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
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
