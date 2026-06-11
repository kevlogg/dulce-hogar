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

const BASE = "https://dulcehogardisenoyestilo2.mitiendanube.com/productos";
const PAGES = 8;

function norm(str) {
  return str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordScore(needle, haystack) {
  const nw = needle.split(" ").filter((w) => w.length > 2);
  if (!nw.length) return 0;
  const hw = new Set(haystack.split(" "));
  return nw.filter((w) => hw.has(w)).length / nw.length;
}

function extractJsonLd(html) {
  const results = [];
  // parse all ld+json blocks from the page
  const tag = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let found;
  while ((found = tag.exec(html)) !== null) {
    try { results.push(JSON.parse(found[1])); } catch {}
  }
  return results;
}

function parseVariantLabel(offerName, productName) {
  const cleaned = offerName.replace(productName, "").trim();
  const paren = cleaned.match(/\(([^)]+)\)/);
  return paren ? paren[1].trim() : cleaned.replace(/[()]/g, "").trim();
}

async function scrapeVariants() {
  const found = [];

  for (let page = 1; page <= PAGES; page++) {
    const url = page === 1 ? `${BASE}/` : `${BASE}/page/${page}/`;
    console.log(`Fetching page ${page}...`);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
    });
    const html = await res.text();
    const blocks = extractJsonLd(html);

    for (const ld of blocks) {
      if (ld["@type"] !== "Product") continue;
      const offers = ld.offers;
      if (!offers || offers["@type"] !== "AggregateOffer") continue;
      if (!offers.offers || offers.offers.length < 2) continue;

      const variants = offers.offers
        .map((o) => parseVariantLabel(o.name, ld.name))
        .filter(Boolean);

      if (variants.length > 0) {
        found.push({ name: ld.name, variants });
      }
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  return found;
}

async function run() {
  const scraped = await scrapeVariants();
  console.log(`\nProductos con variantes: ${scraped.length}`);
  scraped.forEach((p) => console.log(`  ${p.name}: [${p.variants.join(", ")}]`));

  const snap = await db.collection("productos").get();
  const docs = snap.docs.map((d) => ({
    id: d.id,
    ref: d.ref,
    nombre: d.data().nombre,
  }));

  let updated = 0;
  const notFound = [];

  for (const { name, variants } of scraped) {
    const targetNorm = norm(name);

    let match = docs.find((d) => norm(d.nombre) === targetNorm);
    if (!match) {
      match = docs.find(
        (d) =>
          norm(d.nombre).includes(targetNorm) ||
          targetNorm.includes(norm(d.nombre))
      );
    }
    if (!match) {
      let best = null, bestScore = 0;
      for (const d of docs) {
        const s = wordScore(targetNorm, norm(d.nombre));
        if (s > bestScore) { bestScore = s; best = d; }
      }
      if (bestScore >= 0.6) match = best;
    }

    if (!match) {
      notFound.push(name);
      continue;
    }

    const opcion = {
      id: "color",
      nombre: "Color",
      tipo: "select",
      items: variants.map((v) => ({
        id: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        nombre: v,
        precioAdicional: 0,
      })),
    };

    await match.ref.update({ opciones: [opcion], updatedAt: new Date() });
    console.log(`  ✓ ${match.nombre} → [${variants.join(", ")}]`);
    updated++;
  }

  console.log(`\n✓ ${updated} productos actualizados.`);
  if (notFound.length) {
    console.log(`⚠ No encontrados: ${notFound.join(", ")}`);
  }
}

run().catch(console.error);
