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

// Fix mojibake: string was UTF-8 decoded as Latin-1
function fix(str) {
  if (!str) return str;
  try {
    return Buffer.from(str, "latin1").toString("utf8");
  } catch {
    return str;
  }
}

const LOGO_URL = "logo-1763710130-1731213697";

const CATEGORIAS_META = {
  MUEBLES:     { nombre: "Muebles",      descripcion: "Mesas, sillones, bibliotecas y más",          orden: 1 },
  TEXTILES:    { nombre: "Textiles",     descripcion: "Almohadones, alfombras, mantas y cortinas",    orden: 2 },
  EXTERIOR:    { nombre: "Exterior",     descripcion: "Sillones, hamacas y mobiliario para jardín",   orden: 3 },
  ESPEJOS:     { nombre: "Espejos",      descripcion: "Espejos circulares, de cuerpo entero y más",   orden: 4 },
  DECO:        { nombre: "Decoración",   descripcion: "Floreros, cuadros, cestos y accesorios",       orden: 5 },
  ILUMINACION: { nombre: "Iluminación",  descripcion: "Lámparas, veladores y apliques",              orden: 6 },
};

const productos = JSON.parse(
  readFileSync(join(__dirname, "../productos_final.json"), "utf8")
);

async function run() {
  // 1. Upsert categorias
  console.log("Importando categorías...");
  const categoriasRef = db.collection("categorias");
  const catIdMap = {};

  for (const [key, meta] of Object.entries(CATEGORIAS_META)) {
    const snap = await categoriasRef.where("key", "==", key).limit(1).get();
    let docRef;
    if (snap.empty) {
      docRef = await categoriasRef.add({
        key,
        nombre: meta.nombre,
        descripcion: meta.descripcion,
        imagen: "",
        orden: meta.orden,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      docRef = snap.docs[0].ref;
      await docRef.update({ nombre: meta.nombre, descripcion: meta.descripcion, orden: meta.orden, updatedAt: new Date() });
    }
    catIdMap[key] = docRef.id;
    console.log(`  ✓ ${meta.nombre} → ${docRef.id}`);
  }

  // 2. Upsert productos
  console.log("\nImportando productos...");
  const productosRef = db.collection("productos");
  let count = 0;

  for (const p of productos) {
    const nombre = fix(p.nombre);
    const descripcion = fix(p.descripcion);

    // Skip logo thumbnail, keep real product images
    const imagenes = p.imagenes.filter((url) => !url.includes(LOGO_URL));

    const categoriaKey = p.categoria;
    const categoriaId = catIdMap[categoriaKey] || null;

    // Check if already exists by name to allow re-run
    const existing = await productosRef.where("nombre", "==", nombre).limit(1).get();

    const data = {
      nombre,
      descripcion,
      precio: p.precio,
      categoria: categoriaKey,
      categoriaId,
      imagenes,
      url: p.url,
      activo: true,
      updatedAt: new Date(),
    };

    if (existing.empty) {
      await productosRef.add({ ...data, createdAt: new Date() });
      console.log(`  + ${nombre}`);
    } else {
      await existing.docs[0].ref.update(data);
      console.log(`  ~ ${nombre} (actualizado)`);
    }
    count++;
  }

  console.log(`\n✓ ${count} productos importados. ${Object.keys(CATEGORIAS_META).length} categorías.`);
}

run().catch(console.error);
