import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// IPC Servicios INDEC - últimos 6 meses (2026)
// Fuente: INDEC - Índice de Precios al Consumidor (componente Servicios)
const IPC_SEED_DATA = [
  { month: "2026-01", factor: 1.0268 }, // Enero: +2.68%
  { month: "2026-02", factor: 1.0187 }, // Febrero: +1.87%
  { month: "2026-03", factor: 1.0142 }, // Marzo: +1.42%
  { month: "2026-04", factor: 1.0156 }, // Abril: +1.56%
  { month: "2026-05", factor: 1.0173 }, // Mayo: +1.73%
  { month: "2026-06", factor: 1.0195 }, // Junio: +1.95%
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { force } = body;

    const db = getAdminFirestore();

    // Verificar si ya existen registros
    const snapshot = await db.collection("ipc_records").get();
    if (!snapshot.empty && !force) {
      return NextResponse.json({
        success: false,
        message: "IPC records already exist. Use force:true to overwrite.",
        existingCount: snapshot.size,
        seedData: IPC_SEED_DATA,
      }, { status: 409 });
    }

    // Eliminar registros existentes si force es true
    if (force && !snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // Insertar nuevos registros
    const batch = db.batch();
    IPC_SEED_DATA.forEach((data) => {
      const docRef = db.collection("ipc_records").doc(data.month);
      batch.set(docRef, {
        month: data.month,
        factor: data.factor,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    const accumulated = IPC_SEED_DATA.reduce((acc, d) => acc * d.factor, 1);

    return NextResponse.json({
      success: true,
      message: `${IPC_SEED_DATA.length} IPC records seeded successfully`,
      records: IPC_SEED_DATA,
      cumulativeFactor: parseFloat(accumulated.toFixed(6)),
      cumulativePercentage: parseFloat(((accumulated - 1) * 100).toFixed(2)),
    });
  } catch (error) {
    // Si falla, retornar los datos igual para cargar manualmente
    const accumulated = IPC_SEED_DATA.reduce((acc, d) => acc * d.factor, 1);

    return NextResponse.json({
      success: false,
      message: "Firestore connection failed. Here are the seed data to load manually:",
      seedData: IPC_SEED_DATA,
      cumulativeFactor: parseFloat(accumulated.toFixed(6)),
      cumulativePercentage: parseFloat(((accumulated - 1) * 100).toFixed(2)),
      instructions: "Copy each record and add it manually in the IPC Manager panel, or wait until you connect your Firebase instance.",
    });
  }
}

export async function GET() {
  const accumulated = IPC_SEED_DATA.reduce((acc, d) => acc * d.factor, 1);

  return NextResponse.json({
    seedData: IPC_SEED_DATA,
    cumulativeFactor: parseFloat(accumulated.toFixed(6)),
    cumulativePercentage: parseFloat(((accumulated - 1) * 100).toFixed(2)),
    instructions: "POST with { force: true } to load these records into Firestore",
  });
}
