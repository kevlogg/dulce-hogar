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

// All products scraped from https://dulcehogardisenoyestilo2.mitiendanube.com/productos/
// Price 0 means the product has no price set on the live store — skip those
const SCRAPED = [
  // Page 1
  ["ALMOHADON GERVASONI", 52500],
  ["SILLONES GERVASONI X 2", 295900],
  ["Cuchita tejida con almohadón para mascotas", 138000],
  ["Barra Desayunadora Índigo con Banquetas Bali", 710000],
  ["Sofá Chesterfield 3 plazas", 884100],
  ["SET DE BOTELLAS FRASCO", 63800],
  ["SET DE ACEITERO BASE BAMBÚ", 34800],
  ["MECEDORA VIRAL", 326250],
  ["SILLONES MARBELLA", 195653],
  ["MESAS NÓRDICAS GOTA", 65943],
  ["RACK TV ÁLAMO", 398551],
  ["BIBLIOTECA VARILLADA", 215943],
  ["CUADROS PINTEREST", 22500],
  ["ALMOHADON WAFLE", 46377],
  ["ALMOHADON VOLADOS", 33000],
  ["SILLONES GERVASONI MADERA TRIPLE", 268841],
  // Page 2
  ["ALMOHADON MATERO 3", 37500],
  ["ALMOHADON MATERO", 37500],
  ["ALFOMBRA SEAGRAS", 112000],
  ["ALFOMBRA YUTE COMBINADA", 114000],
  ["VAJILLERO ENTELADO", 471015],
  ["PERCHERO ZAPATERO", 187500],
  ["PLATOS DE SITIO SOGA", 19500],
  ["PLATOS DE SITIO FIBRAS", 21750],
  ["SILLONES GERVASONI MADERA", 181200],
  ["MESA MATERA", 22500],
  ["MESA RATONA GRECIA", 201500],
  ["FLORERO ATLAS", 37250],
  ["FLORERO PETRA", 37300],
  ["FLORERO KOS", 39280],
  ["FLORERO GRECIA", 44230],
  ["FLORERO NILO", 67500],
  // Page 3
  ["MESA RECIBIDORA DUBAI", 110000],
  ["MESA DE LUZ RIO", 137682],
  ["MESA RATONA ROMA", 242030],
  ["BANQUETA TULUM MAX", 97500],
  ["BANQUETA MALLORCA", 97500],
  ["VELADOR CUBO VINTAGE", 37500],
  ["MESA RATONA GENOVA", 637000],
  ["ALFOMBRA 110X65", 38000],
  ["BANQUETA GERVA", 90000],
  ["BANQUETA TULUM", 85600],
  ["ALFOMBRA HANDIRA 1 METRO", 49445],
  ["MANTA WAFLE", 57000],
  ["CAMINOS DE MESA", 22500],
  ["CORTINA DE GASA BARRAL ESCONDIDO", 63000],
  ["VELADOR PLEGABLE", 52500],
  ["LAMPARA NORDICA PLEGABLE", 97500],
  // Page 4
  ["LAMPARA NORDICA FIJA", 97500],
  ["LAMPARA MIMBRE CALADA 40X40", 57000],
  ["LAMPARA MIMBRE CALADA 30X30", 48000],
  ["LAMPARA MIMBRE 30X30", 46255],
  ["LAMPARA MIMBRE 40X40", 47850],
  ["CESTO CALADO CON MANIJAS", 51000],
  ["CESTO CUADRADO CHICO", 39000],
  ["ALFOMBRA FIBRAS 1.20 LISA", 130065],
  ["CAJON MIMBRE GRANDE", 27200],
  ["CAJON MIMBRE MEDIANO", 23950],
  ["CAJON MIMBRE CHICO", 20800],
  ["MACETA MIMBRE GRANDE", 23950],
  ["MACETA MIMBRE MEDIANA", 20780],
  ["MACETA MIMBRE CHICA", 17545],
  ["LEÑERO CHICO CON MANIJA", 35090],
  ["LEÑERO GRANDE CON MANIJA", 39875],
  // Page 5 (RACK TV 3 CAJONES = 0, skipped)
  ["LEÑERO CALADO CON MANIJA", 30305],
  ["ESPEJO 180x60", 217500],
  ["ESPEJO 180x80", 274000],
  ["ESPEJO CIRCULAR 80 CM", 105800],
  ["ESPEJO CIRCULAR 70 CM", 94300],
  ["ESPEJO CIRCULAR 60 CM", 79800],
  ["ESPEJO CIRCULAR 50 CM", 71000],
  ["ESPEJO REPARTIDO 180X80", 315000],
  ["ESPEJO CIRCULAR 1 METRO", 137700],
  ["HAMACA JAMAICA COMPLETA", 337500],
  ["GUARDARROPA CIRCULAR CHICO", 78000],
  ["ALMOHADON 50X70", 40500],
  ["ALMOHADON 50X50 WAFLE", 36000],
  ["ALMOHADON 50X50 TUSSOR", 36000],
  ["PERCHERO ESCALERA TRONCO", 52500],
  // Page 6 (prices 0 skipped: MESA CIRCULAR VARILLADA, MESA COMEDOR 1.2M, MESA COMEDOR 1M, MADERA INDUSTRIAL, LISBOA, TULUM COMUN, TULUM)
  ["MINI BAR RECTANGULAR", 172500],
  ["MINI BAR CIRCULAR", 147000],
  ["BARRA INDUSTRIAL", 195700],
  ["MESA RECIBIDOR HIERRO", 67500],
  ["MESA ALTA YUTE", 73500],
  ["RATONA YUTE", 67500],
  ["SILLA TULUM RESPALDO ALTO", 88500],
  ["SILLONES MILAN CON ALMOHADON", 555060],
  ["SILLON HERRADURA", 480000],
  // Page 7 (CESTOS DOBLE TELA = 0, skipped)
  ["SILLONES ASUNCION", 223300],
  ["SILLONES GERVASONI TRIPLE", 462550],
  ["SILLONES ACAPULCO TRIPLE", 430650],
  ["SILLONES ACAPULCO CON MESA", 198000],
  ["SOPORTE DE HAMACA", 185000],
  ["HAMACA GOTA TEJIDA", 286780],
  ["ALFOMBRA FIBRAS 1.20 DISEÑO", 121000],
  ["MANTA RUSTICA", 47850],
  ["MANTEL TUSSOR DISEÑO", 52000],
  ["CESTO VIETNAMITA", 39875],
  ["PORTA MACETA GRANDE", 19938],
  ["PORTA MACETA MEDIANO", 18400],
  ["PORTA MACETA CHICO", 15950],
  ["LEÑERO OVAL MINI CON MANIJAS", 27915],
  ["ESPEJO CIRCULAR 60 CM TEJIDO", 93000],
  // Page 8 (prices 0 skipped: GUARDARROPA CIRCULAR GRANDE, ALMOHADON 45X45, INDUSTRIAL ESPEJADA, MESA RATONA MILAN, MESA RATONA APPLE, MESA RATONA RECTANGULAR YUTE)
  ["GUARDARROPA CUADRADO", 95700],
  ["CAJONERA FINA 3 CAJ MIMBRE", 95700],
  ["CAJONERA 4 CAJONES", 79750],
  ["CAJONERA CON ESTANTE", 81125],
  ["PERCHERO CON ESTANTE 60 CM", 108000],
  ["PERCHERO CON ESTANTE 40 CM", 92510],
  ["MESA RECIBIDOR 1 CAJON", 115600],
  ["MESA RECIBIDOR 2 CAJONES", 129600],
  ["SILLONES POLTRONA X 2", 303050],
  ["SILLONES CAPRI", 462550],
];

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

async function run() {
  const snap = await db.collection("productos").get();
  const docs = snap.docs.map((d) => ({
    id: d.id,
    ref: d.ref,
    nombre: d.data().nombre,
    precioActual: d.data().precio,
  }));

  let updated = 0;
  let noChange = 0;
  const notFound = [];

  for (const [nombre, precioLive] of SCRAPED) {
    const targetNorm = norm(nombre);

    let match = docs.find((d) => norm(d.nombre) === targetNorm);
    if (!match) {
      match = docs.find(
        (d) =>
          norm(d.nombre).includes(targetNorm) ||
          targetNorm.includes(norm(d.nombre))
      );
    }
    if (!match) {
      let best = null,
        bestScore = 0;
      for (const d of docs) {
        const s = wordScore(targetNorm, norm(d.nombre));
        if (s > bestScore) {
          bestScore = s;
          best = d;
        }
      }
      if (bestScore >= 0.6) match = best;
    }

    if (!match) {
      notFound.push(nombre);
      continue;
    }

    if (match.precioActual === precioLive) {
      console.log(`  = ${match.nombre} → $${precioLive} (sin cambios)`);
      noChange++;
      continue;
    }

    await match.ref.update({ precio: precioLive, updatedAt: new Date() });
    console.log(
      `  ✓ ${match.nombre}: $${match.precioActual} → $${precioLive}`
    );
    updated++;
  }

  console.log(`\n✓ ${updated} actualizados, ${noChange} sin cambios.`);
  if (notFound.length) {
    console.log(`\n⚠ No encontrados en Firestore (${notFound.length}):`);
    notFound.forEach((n) => console.log(`  - ${n}`));
  }
}

run().catch(console.error);
