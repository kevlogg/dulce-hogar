import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection("ipc_records")
      .orderBy("month", "desc")
      .get();

    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ records });
  } catch (e) {
    return NextResponse.json({ error: "Error fetching IPC records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, factor } = body;

    if (!month || factor === undefined) {
      return NextResponse.json({ error: "month and factor are required" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = await db.collection("ipc_records").add({
      month, // format: "2026-06" (YYYY-MM)
      factor, // format: 1.025 (multiplicative factor)
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ id: docRef.id, month, factor });
  } catch (e) {
    return NextResponse.json({ error: "Error creating IPC record" }, { status: 500 });
  }
}
