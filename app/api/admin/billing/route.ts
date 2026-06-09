import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection("billing").doc("main").get();
    if (!doc.exists) return NextResponse.json({ config: null });
    const data = doc.data()!;
    const serialized = Object.fromEntries(
      Object.entries(data).map(([k, v]) => {
        if (v && typeof v === "object" && "_seconds" in v) {
          return [k, (v as { _seconds: number })._seconds * 1000];
        }
        return [k, v];
      })
    );
    return NextResponse.json({ config: serialized });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const db = getAdminFirestore();
    await db.collection("billing").doc("main").set(
      { ...body, updated_at: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
