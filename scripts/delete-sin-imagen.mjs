import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "../.firebase-service-account.json"), "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snap = await db.collection("productos").get();
  const sinImagen = snap.docs.filter((d) => {
    const imgs = d.data().imagenes;
    return !imgs || imgs.length === 0;
  });

  console.log(`Productos sin imagen: ${sinImagen.length}`);
  sinImagen.forEach((d) => console.log(`  - [${d.id}] ${d.data().nombre}`));

  if (sinImagen.length === 0) return;

  for (const d of sinImagen) {
    await d.ref.delete();
    console.log(`  ✓ Eliminado: ${d.data().nombre}`);
  }

  console.log(`\n✓ ${sinImagen.length} productos eliminados.`);
}

run().catch(console.error);
