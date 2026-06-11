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

// Parse Argentine price format: "$52.500,00" → 52500
function parsePrice(str) {
  return parseFloat(str.replace(/\$/g, "").replace(/\./g, "").replace(",", "."));
}

// Normalize for fuzzy matching — strips accents, punctuation, and corrupt ? chars
function norm(str) {
  return str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns how many words of needle appear in haystack
function wordScore(needle, haystack) {
  const nw = needle.split(" ").filter((w) => w.length > 2);
  const hw = new Set(haystack.split(" "));
  return nw.filter((w) => hw.has(w)).length / nw.length;
}

const LISTA = [
  ["ALMOHADON GERVASONI", "$52.500,00", "$36.225,00"],
  ["SILLONES GERVASONI X 2", "$295.900,00", "$204.171,00"],
  ["CUCHITA TEJIDA CON ALMOHADON PARA MASCOTAS", "$138.000,00", "$95.220,00"],
  ["BARRA DESAYUNADORA INDIGO CON BANQUETAS BALI", "$710.000,00", "$489.900,00"],
  ["SOFA CHESTERFIELD 3 PLAZAS", "$884.100,00", "$610.029,00"],
  ["SET DE BOTELLAS FRASCO", "$63.800,00", "$44.022,00"],
  ["SET DE ACEITERO BASE BAMBU", "$34.800,00", "$24.012,00"],
  ["MECEDORA VIRAL", "$326.250,00", "$225.112,50"],
  ["SILLONES MARBELLA", "$195.653,00", "$135.000,57"],
  ["MESAS NORDICAS GOTA", "$65.943,00", "$45.500,67"],
  ["RACK TV ALAMO", "$398.551,00", "$275.000,19"],
  ["BIBLIOTECA VARILLADA", "$215.943,00", "$149.000,67"],
  ["CUADROS PINTEREST", "$22.500,00", "$15.525,00"],
  ["ALMOHADON WAFLE", "$46.377,00", "$32.000,13"],
  ["ALMOHADON VOLADOS", "$33.000,00", "$22.770,00"],
  ["SILLONES GERVASONI MADERA TRIPLE", "$268.841,00", "$185.500,29"],
  ["ALMOHADON MATERO 3", "$37.500,00", "$25.875,00"],
  ["ALMOHADON MATERO", "$37.500,00", "$25.875,00"],
  ["ALFOMBRA SEAGRAS", "$112.000,00", "$77.280,00"],
  ["ALFOMBRA YUTE COMBINADA", "$114.000,00", "$78.660,00"],
  ["VAJILLERO ENTELADO", "$471.015,00", "$325.000,35"],
  ["PERCHERO ZAPATERO", "$187.500,00", "$129.375,00"],
  ["PLATOS DE SITIO SOGA", "$19.500,00", "$13.455,00"],
  ["PLATOS DE SITIO FIBRAS", "$21.750,00", "$15.007,50"],
  ["SILLONES GERVASONI MADERA", "$181.200,00", "$125.028,00"],
  ["MESA MATERA", "$22.500,00", "$15.525,00"],
  ["MESA RATONA GRECIA", "$201.500,00", "$139.035,00"],
  ["FLORERO ATLAS", "$37.250,00", "$25.702,50"],
  ["FLORERO PETRA", "$37.300,00", "$25.737,00"],
  ["FLORERO KOS", "$39.280,00", "$27.103,20"],
  ["FLORERO GRECIA", "$44.230,00", "$30.518,70"],
  ["FLORERO NILO", "$67.500,00", "$46.575,00"],
  ["MESA RECIBIDORA DUBAI", "$110.000,00", "$75.900,00"],
  ["MESA DE LUZ RIO", "$137.682,00", "$95.000,58"],
  ["MESA RATONA ROMA", "$242.030,00", "$167.000,70"],
  ["BANQUETA TULUM MAX", "$97.500,00", "$67.275,00"],
  ["BANQUETA MALLORCA", "$97.500,00", "$67.275,00"],
  ["VELADOR CUBO VINTAGE", "$37.500,00", "$25.875,00"],
  ["MESA RATONA GENOVA", "$637.000,00", "$439.530,00"],
  ["ALFOMBRA 110X65", "$38.000,00", "$26.220,00"],
  ["BANQUETA GERVA", "$90.000,00", "$62.100,00"],
  ["BANQUETA TULUM", "$85.600,00", "$59.064,00"],
  ["ALFOMBRA HANDIRA 1 METRO", "$49.445,00", "$34.117,05"],
  ["MANTA WAFLE", "$57.000,00", "$39.330,00"],
  ["CAMINOS DE MESA", "$22.500,00", "$15.525,00"],
  ["CORTINA DE GASA BARRAL ESCONDIDO", "$63.000,00", "$43.470,00"],
  ["VELADOR PLEGABLE", "$52.500,00", "$36.225,00"],
  ["LAMPARA NORDICA PLEGABLE", "$97.500,00", "$67.275,00"],
  ["LAMPARA NORDICA FIJA", "$97.500,00", "$67.275,00"],
  ["LAMPARA MIMBRE CALADA 40X40", "$57.000,00", "$39.330,00"],
  ["LAMPARA MIMBRE CALADA 30X30", "$48.000,00", "$33.120,00"],
];

async function run() {
  const snap = await db.collection("productos").get();
  const docs = snap.docs.map((d) => ({ id: d.id, ref: d.ref, nombre: d.data().nombre }));

  let updated = 0;
  let notFound = [];

  for (const [nombre, precioLista, precioEfectivo] of LISTA) {
    const targetNorm = norm(nombre);

    // Exact match first, then partial, then word-score fuzzy
    let match = docs.find((d) => norm(d.nombre) === targetNorm);
    if (!match) {
      match = docs.find((d) => norm(d.nombre).includes(targetNorm) || targetNorm.includes(norm(d.nombre)));
    }
    if (!match) {
      // Pick doc with highest word overlap (≥ 0.6)
      let best = null, bestScore = 0;
      for (const d of docs) {
        const s = wordScore(targetNorm, norm(d.nombre));
        if (s > bestScore) { bestScore = s; best = d; }
      }
      if (bestScore >= 0.6) match = best;
    }

    if (!match) {
      notFound.push(nombre);
      continue;
    }

    await match.ref.update({
      precio: parsePrice(precioLista),
      precioEfectivo: parsePrice(precioEfectivo),
      updatedAt: new Date(),
    });
    console.log(`  ✓ ${match.nombre} → lista: ${precioLista}  efectivo: ${precioEfectivo}`);
    updated++;
  }

  console.log(`\n✓ ${updated} productos actualizados.`);
  if (notFound.length) {
    console.log(`\n⚠ No encontrados (${notFound.length}):`);
    notFound.forEach((n) => console.log(`  - ${n}`));
  }
}

run().catch(console.error);
