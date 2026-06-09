import { NextResponse, type NextRequest } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    await db.collection("ipc_records").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error deleting IPC record" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getAdminFirestore();

    await db.collection("ipc_records").doc(id).update({
      ...body,
      updated_at: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error updating IPC record" }, { status: 500 });
  }
}
