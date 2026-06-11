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

function extractDataVariants(html) {
  // data-variants="[...]" attribute
  const m = html.match(/data-variants="([^"]+)"/);
  if (!m) return null;
  try {
    const decoded = m[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Normalize a CDN image URL to a comparable key (strip protocol, query, size params)
function normalizeUrl(url) {
  return url
    .replace(/^https?:/, "")
    .replace(/\?.*$/, "")
    .replace(/-\d+-\d+\.(webp|jpg|jpeg|png)$/i, "")
    .replace(/-(480|960|1280)-0\.(webp|jpg|jpeg|png)$/i, "");
}

async function run() {
  const snap = await db.collection("productos").get();
  // Only process products that already have color opciones
  const docs = snap.docs
    .map((d) => ({ id: d.id, ref: d.ref, data: d.data() }))
    .filter((d) => d.data.opciones?.some((o) => o.id === "color"));

  console.log(`Productos con variantes de color: ${docs.length}\n`);

  let updated = 0;

  for (const doc of docs) {
    const url = doc.data.url;
    if (!url) {
      console.log(`  ⚠ Sin URL: ${doc.data.nombre}`);
      continue;
    }

    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    } catch {
      console.log(`  ✗ Error fetching ${url}`);
      continue;
    }

    const html = await res.text();
    const variants = extractDataVariants(html);

    if (!variants || variants.length === 0) {
      console.log(`  - Sin data-variants: ${doc.data.nombre}`);
      continue;
    }

    // Build color → image_url map (option0 = first variant dimension = color)
    const colorImageMap = {};
    for (const v of variants) {
      if (v.option0 && v.image_url) {
        const colorKey = v.option0.toLowerCase().trim();
        if (!colorImageMap[colorKey]) {
          // Tienda Nube gives protocol-relative URL, make it https
          colorImageMap[colorKey] = "https:" + v.image_url.replace(/^https?:/, "");
        }
      }
    }

    if (Object.keys(colorImageMap).length === 0) {
      console.log(`  - Sin imagen por color: ${doc.data.nombre}`);
      continue;
    }

    // Match stored image URLs to find the index for each color
    const imagenes = doc.data.imagenes ?? [];
    const opciones = doc.data.opciones.map((opcion) => {
      if (opcion.id !== "color") return opcion;
      return {
        ...opcion,
        items: opcion.items.map((item) => {
          const colorKey = item.nombre.toLowerCase().trim();
          const targetUrl = colorImageMap[colorKey];
          if (!targetUrl) return item;

          // Find best matching image index in our stored imagenes
          const targetNorm = normalizeUrl(targetUrl);
          let imgIdx = imagenes.findIndex((img) => normalizeUrl(img) === targetNorm);

          // Fallback: partial match on the filename part
          if (imgIdx === -1) {
            const filename = targetUrl.split("/").pop()?.split("?")[0]?.replace(/-\d+x\d+/, "") ?? "";
            imgIdx = imagenes.findIndex((img) => img.includes(filename.substring(0, 20)));
          }

          return { ...item, imagenIdx: imgIdx >= 0 ? imgIdx : undefined };
        }),
      };
    });

    await doc.ref.update({ opciones, updatedAt: new Date() });

    const colorResults = opciones
      .find((o) => o.id === "color")
      ?.items.map((i) => `${i.nombre}→idx:${i.imagenIdx ?? "?"}`)
      .join(", ");
    console.log(`  ✓ ${doc.data.nombre}: [${colorResults}]`);
    updated++;

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n✓ ${updated} productos actualizados con imagen por color.`);
}

run().catch(console.error);
