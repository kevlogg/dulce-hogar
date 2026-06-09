import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("billing").doc("main").collection("payments")
      .orderBy("date", "desc").limit(24).get();
    const payments = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        date: data.date,
        amount: data.amount,
        concept: data.concept,
        confirmed: data.confirmed ?? false,
      };
    });
    return NextResponse.json({ payments });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getAdminFirestore();
    await db.collection("billing").doc("main").collection("payments").add({
      ...body,
      created_at: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
