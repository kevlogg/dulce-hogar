# Envíopack Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Envíopack API to automatically create Vía Cargo shipments when a Mercado Pago payment is confirmed, with real-time cost calculation and branch selection at checkout.

**Architecture:** A new `lib/enviopack.ts` server-side client wraps all Envíopack API calls. Two new API routes (`/api/envios/sucursales`, `/api/envios/cotizar`) serve the checkout. The existing `pagos/confirmar` route is completed to wire MP verification → Envíopack shipment creation → Resend email. The checkout page gains a delivery type selector with real-time cost. The admin productos form gains peso/dimensions fields.

**Tech Stack:** Next.js App Router, Firebase Firestore Admin SDK, TypeScript, Resend (`resend` package), Envíopack REST API (`https://api.enviopack.com`), Mercado Pago SDK

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `lib/types.ts` | Add shipping fields to `Producto`, `DireccionEnvio`, `Orden` |
| Create | `lib/enviopack.ts` | Server-side Envíopack API client |
| Create | `lib/email.ts` | Resend email utilities (tracking + admin alert) |
| Create | `app/api/envios/sucursales/route.ts` | GET Vía Cargo branches by CP |
| Create | `app/api/envios/cotizar/route.ts` | POST real-time shipping quote |
| Modify | `app/api/pagos/confirmar/route.ts` | Wire MP + Envíopack + email |
| Modify | `app/admin/(dashboard/)/productos/page.tsx` | Add peso/dimensions fields |
| Modify | `app/(tienda)/checkout/page.tsx` | Delivery type selector + real-time cost |
| Modify | `app/(tienda)/confirmacion/ConfirmacionContent.tsx` | Show tracking number |

---

## Task 1: Update `lib/types.ts`

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add shipping fields to `Producto`**

Open `lib/types.ts`. Replace the `Producto` interface with:

```ts
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  categoria: string;
  categoriaId: string;
  precioEfectivo?: number;
  stock: number;
  opciones: OpcionProducto[];
  especificaciones: Record<string, string>;
  peso?: number;
  alto?: number;
  ancho?: number;
  largo?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 2: Update `DireccionEnvio`**

Replace the `DireccionEnvio` interface with:

```ts
export interface DireccionEnvio {
  calle: string;
  numero: string;
  depto?: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  tipoEntrega: "domicilio" | "sucursal";
  sucursalId?: string;
  sucursalNombre?: string;
  sucursalDireccion?: string;
}
```

- [ ] **Step 3: Update `Orden`**

Replace the `Orden` interface with:

```ts
export interface Orden {
  id: string;
  clienteInfo: ClienteInfo;
  direccionEnvio: DireccionEnvio;
  items: ItemOrden[];
  montoSubtotal: number;
  montoEnvio: number;
  montoTotal: number;
  estadoPago: "pendiente" | "completado" | "fallido";
  estadoEnvio: "procesando" | "enviado" | "entregado" | "sin_envio";
  metodoPago: "mercadopago";
  mercadopagoPreferenceId: string;
  mercadopagoPaymentId?: string;
  enviopackId?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shipping fields to Producto, DireccionEnvio, Orden types"
```

---

## Task 2: Create `lib/enviopack.ts`

**Files:**
- Create: `lib/enviopack.ts`

> **IMPORTANT:** The Envíopack API endpoint paths and request/response field names below are based on the spec description and reasonable conventions. Before going live, verify every endpoint path, query param name, and JSON field name against the official Envíopack API docs (Central de ayuda > "Integra tu tienda propia o Software"). The function signatures and internal logic are correct; only the HTTP contract needs verification.

- [ ] **Step 1: Create `lib/enviopack.ts`**

```ts
const BASE_URL = "https://api.enviopack.com";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ENVIOPACK_ACCESS_TOKEN}`,
  };
}

export class EnviopackError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "EnviopackError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new EnviopackError(res.status, text);
  }
  return res.json() as Promise<T>;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
}

export async function getSucursalesViaCargo(
  codigoPostal: string
): Promise<Sucursal[]> {
  // Verify: check actual query param names in Envíopack docs
  const data = await request<{ sucursales: Sucursal[] }>(
    "GET",
    `/sucursales?transportista=viacargo&codigo_postal=${codigoPostal}`
  );
  return data.sucursales;
}

export interface CotizarParams {
  codigoPostal: string;
  tipoEntrega: "domicilio" | "sucursal";
  sucursalId?: string;
  peso: number;
  alto: number;
  ancho: number;
  largo: number;
}

export async function cotizarEnvio(params: CotizarParams): Promise<number> {
  // Verify: check actual request body field names in Envíopack docs
  const data = await request<{ precio: number }>("POST", "/cotizaciones", {
    transportista: "viacargo",
    codigo_postal_destino: params.codigoPostal,
    tipo_entrega: params.tipoEntrega,
    ...(params.sucursalId ? { sucursal_id: params.sucursalId } : {}),
    peso: params.peso,
    alto: params.alto,
    ancho: params.ancho,
    largo: params.largo,
  });
  return data.precio;
}

export interface DimensionesItem {
  peso: number;
  alto: number;
  ancho: number;
  largo: number;
  cantidad: number;
}

export interface CrearEnvioParams {
  ordenId: string;
  clienteInfo: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  direccionEnvio: {
    calle: string;
    numero: string;
    depto?: string;
    ciudad: string;
    codigoPostal: string;
    provincia: string;
    tipoEntrega: "domicilio" | "sucursal";
    sucursalId?: string;
  };
  dimensiones: DimensionesItem[];
}

export interface CrearEnvioResult {
  enviopackId: string;
  trackingNumber: string;
}

export async function crearEnvio(
  params: CrearEnvioParams
): Promise<CrearEnvioResult> {
  const pesoTotal = params.dimensiones.reduce(
    (acc, d) => acc + d.peso * d.cantidad,
    0
  );
  const alto = Math.max(...params.dimensiones.map((d) => d.alto));
  const ancho = Math.max(...params.dimensiones.map((d) => d.ancho));
  const largo = Math.max(...params.dimensiones.map((d) => d.largo));

  // Verify: check actual request body field names in Envíopack docs
  const data = await request<{ id: string; numero_seguimiento: string }>(
    "POST",
    "/envios",
    {
      transportista: "viacargo",
      tipo_entrega: params.direccionEnvio.tipoEntrega,
      ...(params.direccionEnvio.tipoEntrega === "sucursal"
        ? { sucursal_id: params.direccionEnvio.sucursalId }
        : {}),
      destinatario: {
        nombre: `${params.clienteInfo.nombre} ${params.clienteInfo.apellido}`,
        email: params.clienteInfo.email,
        telefono: params.clienteInfo.telefono,
        calle: params.direccionEnvio.calle,
        numero: params.direccionEnvio.numero,
        piso_depto: params.direccionEnvio.depto ?? "",
        localidad: params.direccionEnvio.ciudad,
        codigo_postal: params.direccionEnvio.codigoPostal,
        provincia: params.direccionEnvio.provincia,
      },
      paquete: { peso: pesoTotal, alto, ancho, largo },
      referencia: params.ordenId,
    }
  );
  return { enviopackId: data.id, trackingNumber: data.numero_seguimiento };
}

export async function getTracking(enviopackId: string): Promise<unknown> {
  return request("GET", `/envios/${enviopackId}`);
}
```

- [ ] **Step 2: Add `ENVIOPACK_ACCESS_TOKEN` to `.env.local`**

Open `.env.local` and add at the end:

```
# Envíopack
ENVIOPACK_ACCESS_TOKEN=
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd c:/development/dulce-hogar && npx tsc --noEmit
```

Expected: no errors related to `lib/enviopack.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/enviopack.ts .env.local
git commit -m "feat: add Envíopack server-side API client"
```

---

## Task 3: Create `lib/email.ts`

**Files:**
- Create: `lib/email.ts`

The `resend` package should already be installed (the `RESEND_API_KEY` env var is present). If not: `npm install resend`.

- [ ] **Step 1: Create `lib/email.ts`**

```ts
import { Resend } from "resend";
import type { Orden } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);
// Must match a domain verified in the Resend dashboard
const FROM = "Dulce Hogar <noreply@dulcehogar.com.ar>";

export async function sendTrackingEmail(orden: Orden): Promise<void> {
  const itemsList = orden.items
    .map((i) => `- ${i.nombre} x${i.cantidad}`)
    .join("\n");

  const entregaInfo =
    orden.direccionEnvio.tipoEntrega === "sucursal"
      ? `Retiro en sucursal: ${orden.direccionEnvio.sucursalNombre ?? ""} — ${orden.direccionEnvio.sucursalDireccion ?? ""}`
      : `Envío a: ${orden.direccionEnvio.calle} ${orden.direccionEnvio.numero}, ${orden.direccionEnvio.ciudad}`;

  await resend.emails.send({
    from: FROM,
    to: orden.clienteInfo.email,
    subject: `Tu pedido está en camino — #${orden.id.slice(-6).toUpperCase()}`,
    text: [
      `Hola ${orden.clienteInfo.nombre},`,
      "",
      "¡Tu pedido fue confirmado y el envío está listo!",
      "",
      `Número de seguimiento: ${orden.trackingNumber}`,
      `Rastrealo en: https://www.viacargo.com.ar/seguimiento?guia=${orden.trackingNumber}`,
      "",
      entregaInfo,
      "",
      "Productos:",
      itemsList,
      "",
      `Total: $${orden.montoTotal.toLocaleString("es-AR")}`,
      "",
      "Gracias por tu compra.",
      "Dulce Hogar",
    ].join("\n"),
  });
}

export async function sendTrackingPendingEmail(orden: Orden): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: orden.clienteInfo.email,
    subject: `Tu pedido fue confirmado — #${orden.id.slice(-6).toUpperCase()}`,
    text: [
      `Hola ${orden.clienteInfo.nombre},`,
      "",
      "¡Tu pago fue confirmado!",
      "",
      "Tu envío está siendo procesado. Te enviaremos el número de seguimiento en breve.",
      "",
      "Gracias por tu compra.",
      "Dulce Hogar",
    ].join("\n"),
  });
}

export async function sendShipmentFailedAlert(
  orden: Orden,
  errorMsg: string
): Promise<void> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  await resend.emails.send({
    from: FROM,
    to: adminEmails,
    subject: `[ACCIÓN REQUERIDA] Envío pendiente — Orden #${orden.id.slice(-6).toUpperCase()}`,
    text: [
      `La orden ${orden.id} fue pagada pero la creación del envío en Envíopack falló.`,
      "",
      `Error: ${errorMsg}`,
      "",
      `Cliente: ${orden.clienteInfo.nombre} ${orden.clienteInfo.apellido} (${orden.clienteInfo.email})`,
      `Teléfono: ${orden.clienteInfo.telefono}`,
      "",
      "Procesar manualmente desde el panel de Envíopack.",
    ].join("\n"),
  });
}
```

- [ ] **Step 2: Check resend is installed**

```bash
cd c:/development/dulce-hogar && node -e "require('resend')" 2>&1
```

If output contains "Cannot find module 'resend'", run: `npm install resend`

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts
git commit -m "feat: add email utilities for tracking and shipment alerts (Resend)"
```

---

## Task 4: Create `app/api/envios/sucursales/route.ts`

**Files:**
- Create: `app/api/envios/sucursales/route.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p "c:/development/dulce-hogar/app/api/envios/sucursales"
mkdir -p "c:/development/dulce-hogar/app/api/envios/cotizar"
```

- [ ] **Step 2: Write `app/api/envios/sucursales/route.ts`**

```ts
import { getSucursalesViaCargo, EnviopackError } from "@/lib/enviopack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cp = searchParams.get("cp");

  if (!cp || cp.length < 4) {
    return Response.json(
      { error: "Código postal inválido" },
      { status: 400 }
    );
  }

  try {
    const sucursales = await getSucursalesViaCargo(cp);
    return Response.json({ sucursales });
  } catch (err) {
    if (err instanceof EnviopackError) {
      return Response.json(
        { error: "No se pudieron obtener las sucursales" },
        { status: 502 }
      );
    }
    console.error("Error fetching sucursales:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Manual verification (requires ENVIOPACK_ACCESS_TOKEN set)**

```bash
curl "http://localhost:3000/api/envios/sucursales?cp=1425"
```

Expected: `{ "sucursales": [...] }` or a structured error if token is not yet configured.

- [ ] **Step 4: Commit**

```bash
git add app/api/envios/sucursales/route.ts
git commit -m "feat: add GET /api/envios/sucursales route"
```

---

## Task 5: Create `app/api/envios/cotizar/route.ts`

**Files:**
- Create: `app/api/envios/cotizar/route.ts`

- [ ] **Step 1: Write `app/api/envios/cotizar/route.ts`**

```ts
import { cotizarEnvio, EnviopackError } from "@/lib/enviopack";
import { getAdminFirestore } from "@/lib/firebase/admin";

interface CotizarBody {
  codigoPostal: string;
  tipoEntrega: "domicilio" | "sucursal";
  sucursalId?: string;
  items: { productoId: string; cantidad: number }[];
}

export async function POST(req: Request) {
  let body: CotizarBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const { codigoPostal, tipoEntrega, sucursalId, items } = body;

  if (!codigoPostal || !tipoEntrega || !items?.length) {
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const db = getAdminFirestore();

  // Fetch product dimensions from Firestore
  const productosDocs = await Promise.all(
    items.map(({ productoId }) =>
      db.collection("productos").doc(productoId).get()
    )
  );

  const sinDimensiones: string[] = [];
  const dimensiones = productosDocs.map((snap, idx) => {
    const data = snap.data();
    if (!data?.peso || !data?.alto || !data?.ancho || !data?.largo) {
      sinDimensiones.push(data?.nombre ?? items[idx].productoId);
    }
    return {
      peso: data?.peso ?? 0,
      alto: data?.alto ?? 0,
      ancho: data?.ancho ?? 0,
      largo: data?.largo ?? 0,
      cantidad: items[idx].cantidad,
    };
  });

  if (sinDimensiones.length > 0) {
    return Response.json(
      { error: "missing_dimensions", productos: sinDimensiones },
      { status: 422 }
    );
  }

  const pesoTotal = dimensiones.reduce(
    (acc, d) => acc + d.peso * d.cantidad,
    0
  );
  const alto = Math.max(...dimensiones.map((d) => d.alto));
  const ancho = Math.max(...dimensiones.map((d) => d.ancho));
  const largo = Math.max(...dimensiones.map((d) => d.largo));

  try {
    const costo = await cotizarEnvio({
      codigoPostal,
      tipoEntrega,
      sucursalId,
      peso: pesoTotal,
      alto,
      ancho,
      largo,
    });
    return Response.json({ costo });
  } catch (err) {
    if (err instanceof EnviopackError) {
      return Response.json(
        { error: "No disponible para esta zona" },
        { status: 502 }
      );
    }
    console.error("Error cotizando envío:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Manual verification**

```bash
curl -X POST http://localhost:3000/api/envios/cotizar \
  -H "Content-Type: application/json" \
  -d '{"codigoPostal":"1425","tipoEntrega":"domicilio","items":[{"productoId":"<id-real>","cantidad":1}]}'
```

Expected: `{ "costo": 12500 }` (or similar), or `{ "error": "missing_dimensions", "productos": [...] }` if the product doesn't have peso/dimensions yet.

- [ ] **Step 3: Commit**

```bash
git add app/api/envios/cotizar/route.ts
git commit -m "feat: add POST /api/envios/cotizar route"
```

---

## Task 6: Update admin productos form

**Files:**
- Modify: `app/admin/(dashboard/)/productos/page.tsx`

Four changes: `EMPTY` constant, local `Producto` type, `openEdit` mapper, `save` body, and the form JSX.

- [ ] **Step 1: Update `EMPTY` constant**

Find and replace the `EMPTY` constant:

```ts
// Before
const EMPTY: any = {
  nombre: "",
  descripcion: "",
  precio: "",
  precioEfectivo: "",
  categoria: "MUEBLES",
  stock: "0",
  imagenes: "",
  opciones: "[]",
};

// After
const EMPTY: any = {
  nombre: "",
  descripcion: "",
  precio: "",
  precioEfectivo: "",
  categoria: "MUEBLES",
  stock: "0",
  imagenes: "",
  opciones: "[]",
  peso: "",
  alto: "",
  ancho: "",
  largo: "",
};
```

- [ ] **Step 2: Update the local `Producto` type**

Find and replace:

```ts
// Before
type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioEfectivo?: number;
  categoria: string;
  stock: number;
  imagenes?: string[];
  opciones?: any[];
  especificaciones?: Record<string, string>;
};

// After
type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioEfectivo?: number;
  categoria: string;
  stock: number;
  imagenes?: string[];
  opciones?: any[];
  especificaciones?: Record<string, string>;
  peso?: number;
  alto?: number;
  ancho?: number;
  largo?: number;
};
```

- [ ] **Step 3: Update `openEdit` to map shipping fields**

In the `openEdit` function (where `setForm` is called with existing product data), add the four fields:

```ts
// Find the setForm call in openEdit and add after opciones line:
peso: String(p.peso ?? ""),
alto: String(p.alto ?? ""),
ancho: String(p.ancho ?? ""),
largo: String(p.largo ?? ""),
```

- [ ] **Step 4: Update `save` to include shipping fields in the body**

In the `save` function, add to the `body` object:

```ts
// Add after especificaciones: {}
...(form.peso ? { peso: Number(form.peso) } : {}),
...(form.alto ? { alto: Number(form.alto) } : {}),
...(form.ancho ? { ancho: Number(form.ancho) } : {}),
...(form.largo ? { largo: Number(form.largo) } : {}),
```

- [ ] **Step 5: Add form fields to the modal JSX**

After the existing "Opciones / variantes" textarea block, add:

```tsx
{/* Datos de envío */}
<div className="sm:col-span-2">
  <p className={labelCls + " mb-3"}>Datos de envío (requeridos por Envíopack)</p>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div>
      <label className={labelCls}>Peso (kg)</label>
      <input
        type="number"
        min="0"
        step="0.1"
        value={form.peso}
        onChange={(e) => set("peso", e.target.value)}
        className={inputCls}
        placeholder="5.5"
      />
    </div>
    <div>
      <label className={labelCls}>Alto (cm)</label>
      <input
        type="number"
        min="0"
        value={form.alto}
        onChange={(e) => set("alto", e.target.value)}
        className={inputCls}
        placeholder="80"
      />
    </div>
    <div>
      <label className={labelCls}>Ancho (cm)</label>
      <input
        type="number"
        min="0"
        value={form.ancho}
        onChange={(e) => set("ancho", e.target.value)}
        className={inputCls}
        placeholder="90"
      />
    </div>
    <div>
      <label className={labelCls}>Largo (cm)</label>
      <input
        type="number"
        min="0"
        value={form.largo}
        onChange={(e) => set("largo", e.target.value)}
        className={inputCls}
        placeholder="100"
      />
    </div>
  </div>
</div>
```

- [ ] **Step 6: Add "Faltan datos de envío" badge to product list**

In the product list row JSX, after the product name, add:

```tsx
{(!p.peso || !p.alto || !p.ancho || !p.largo) && (
  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
    Faltan datos de envío
  </span>
)}
```

- [ ] **Step 7: Verify in browser**

Start dev server (`npm run dev`), go to `/admin/productos`, open a product to edit. Confirm the four new fields appear. Save a product with peso/dimensions and confirm no console errors.

- [ ] **Step 8: Commit**

```bash
git add "app/admin/(dashboard/)/productos/page.tsx"
git commit -m "feat: add peso and dimensions fields to admin product form"
```

---

## Task 7: Update `app/api/pagos/confirmar/route.ts`

**Files:**
- Modify: `app/api/pagos/confirmar/route.ts`

This route currently uses the client-side Firebase SDK (bug) and has all logic commented out. We replace it completely.

> **Note:** `lib/mercadopago-setup.ts` exports `confirmarPagoMercadoPago` as a stub that throws. Before this route works end-to-end, that function must be implemented with real credentials. The plan below wires the structure correctly so that when MP credentials are added, everything connects automatically.

- [ ] **Step 1: Replace `app/api/pagos/confirmar/route.ts` entirely**

```ts
import { confirmarPagoMercadoPago } from "@/lib/mercadopago-setup";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { crearEnvio, EnviopackError } from "@/lib/enviopack";
import {
  sendTrackingEmail,
  sendTrackingPendingEmail,
  sendShipmentFailedAlert,
} from "@/lib/email";
import type { Orden } from "@/lib/types";

export async function POST(req: Request) {
  let paymentId: string;
  let ordenId: string;

  try {
    const body = await req.json();
    paymentId = body.paymentId;
    ordenId = body.ordenId;
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!paymentId || !ordenId) {
    return Response.json({ error: "Missing paymentId or ordenId" }, { status: 400 });
  }

  // 1. Verify payment with Mercado Pago
  let paymentStatus: { status: string };
  try {
    paymentStatus = await confirmarPagoMercadoPago(paymentId);
  } catch (err) {
    console.error("MP verification error:", err);
    return Response.json({ error: "Error verificando pago" }, { status: 502 });
  }

  if (paymentStatus.status !== "approved") {
    return Response.json({ approved: false, status: paymentStatus.status });
  }

  const db = getAdminFirestore();
  const ordenRef = db.collection("ordenes").doc(ordenId);

  // 2. Fetch full order
  const ordenSnap = await ordenRef.get();
  if (!ordenSnap.exists) {
    return Response.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  const orden = { id: ordenSnap.id, ...ordenSnap.data() } as Orden;

  // 3. Mark payment as completed
  await ordenRef.update({
    estadoPago: "completado",
    mercadopagoPaymentId: paymentId,
    updatedAt: new Date(),
  });

  // 4. Fetch product dimensions
  const productosSnaps = await Promise.all(
    orden.items.map((item) =>
      db.collection("productos").doc(item.productoId).get()
    )
  );
  const dimensiones = productosSnaps.map((snap, idx) => ({
    peso: snap.data()?.peso ?? 1,
    alto: snap.data()?.alto ?? 10,
    ancho: snap.data()?.ancho ?? 10,
    largo: snap.data()?.largo ?? 10,
    cantidad: orden.items[idx].cantidad,
  }));

  // 5. Create shipment in Envíopack
  try {
    const { enviopackId, trackingNumber } = await crearEnvio({
      ordenId: orden.id,
      clienteInfo: orden.clienteInfo,
      direccionEnvio: orden.direccionEnvio,
      dimensiones,
    });

    await ordenRef.update({ enviopackId, trackingNumber, updatedAt: new Date() });

    const ordenConTracking = { ...orden, trackingNumber, enviopackId };
    try {
      await sendTrackingEmail(ordenConTracking as Orden);
    } catch (emailErr) {
      console.error("Tracking email failed (non-blocking):", emailErr);
    }

    return Response.json({ success: true, trackingNumber });
  } catch (err) {
    // Shipment failed — payment already confirmed, log and alert admin
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Envíopack crearEnvio failed:", errorMsg);

    await ordenRef.update({ estadoEnvio: "sin_envio", updatedAt: new Date() });

    try {
      await sendTrackingPendingEmail(orden);
      await sendShipmentFailedAlert(orden, errorMsg);
    } catch (emailErr) {
      console.error("Alert email failed (non-blocking):", emailErr);
    }

    // Return success because the payment went through — shipment is handled manually
    return Response.json({ success: true, trackingNumber: null });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/pagos/confirmar/route.ts
git commit -m "feat: wire MP confirmation + Envíopack shipment + email in pagos/confirmar"
```

---

## Task 8: Update checkout page

**Files:**
- Modify: `app/(tienda)/checkout/page.tsx`

Four changes: new state variables, delivery type selector UI, sucursales fetching, real-time cost calculation, and updated submit payload.

- [ ] **Step 1: Add new state variables**

In the checkout component, after the existing `useState` calls, add:

```tsx
const [tipoEntrega, setTipoEntrega] = useState<"domicilio" | "sucursal">("domicilio");
const [sucursales, setSucursales] = useState<{ id: string; nombre: string; direccion: string; localidad: string }[]>([]);
const [sucursalSeleccionada, setSucursalSeleccionada] = useState<{ id: string; nombre: string; direccion: string } | null>(null);
const [costoEnvio, setCostoEnvio] = useState<number | null>(null);
const [cotizando, setCotizando] = useState(false);
const [cargandoSucursales, setCargandoSucursales] = useState(false);
```

- [ ] **Step 2: Add shipping cost calculation effect**

After the existing `useEffect` blocks, add:

```tsx
useEffect(() => {
  const cp = formData.codigoPostal;
  if (cp.length < 4 || items.length === 0) {
    setCostoEnvio(null);
    return;
  }
  if (tipoEntrega === "sucursal" && !sucursalSeleccionada) return;

  const timer = setTimeout(async () => {
    setCotizando(true);
    try {
      const res = await fetch("/api/envios/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoPostal: cp,
          tipoEntrega,
          sucursalId: sucursalSeleccionada?.id,
          items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        }),
      });
      const data = await res.json();
      if (res.ok) setCostoEnvio(data.costo);
      else setCostoEnvio(null);
    } catch {
      setCostoEnvio(null);
    } finally {
      setCotizando(false);
    }
  }, 600);

  return () => clearTimeout(timer);
}, [formData.codigoPostal, tipoEntrega, sucursalSeleccionada, items]);
```

- [ ] **Step 3: Add sucursales fetching effect**

```tsx
useEffect(() => {
  const cp = formData.codigoPostal;
  if (tipoEntrega !== "sucursal" || cp.length < 4) {
    setSucursales([]);
    setSucursalSeleccionada(null);
    return;
  }
  setCargandoSucursales(true);
  fetch(`/api/envios/sucursales?cp=${cp}`)
    .then((r) => r.json())
    .then((data) => setSucursales(data.sucursales ?? []))
    .catch(() => setSucursales([]))
    .finally(() => setCargandoSucursales(false));
}, [formData.codigoPostal, tipoEntrega]);
```

- [ ] **Step 4: Add delivery type selector to the address section JSX**

In the address section (`<div>` with the heading "Dirección de envío" or equivalent), add BEFORE the existing address fields:

```tsx
{/* Tipo de entrega */}
<div className="mb-5">
  <label className={labelClass}>Tipo de entrega</label>
  <div className="flex gap-3 mt-1.5">
    <button
      type="button"
      onClick={() => { setTipoEntrega("domicilio"); setSucursalSeleccionada(null); }}
      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
        tipoEntrega === "domicilio"
          ? "border-[#2C1A10] bg-[#2C1A10] text-white"
          : "border-[#E0D4C4] text-[#2C1A10] hover:border-[#C9A87C]"
      }`}
    >
      Envío a domicilio
    </button>
    <button
      type="button"
      onClick={() => setTipoEntrega("sucursal")}
      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
        tipoEntrega === "sucursal"
          ? "border-[#2C1A10] bg-[#2C1A10] text-white"
          : "border-[#E0D4C4] text-[#2C1A10] hover:border-[#C9A87C]"
      }`}
    >
      Retiro en sucursal Vía Cargo
    </button>
  </div>
</div>
```

- [ ] **Step 5: Conditionally show address or sucursal fields**

Wrap the existing address fields (calle, numero, depto, ciudad, provincia) in a conditional:

```tsx
{tipoEntrega === "domicilio" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* ... existing calle, numero, depto, ciudad, provincia fields unchanged ... */}
  </div>
)}
```

After that conditional, add the sucursal picker (only shown when tipoEntrega === "sucursal"):

```tsx
{tipoEntrega === "sucursal" && (
  <div className="space-y-4">
    <div>
      <label className={labelClass}>Código postal</label>
      <input
        type="text"
        name="codigoPostal"
        maxLength={5}
        required
        placeholder="1425"
        value={formData.codigoPostal}
        onChange={handleChange}
        className={inputClass}
      />
    </div>
    {cargandoSucursales && (
      <p className="text-sm text-[#A0724A]">Buscando sucursales...</p>
    )}
    {!cargandoSucursales && sucursales.length > 0 && (
      <div>
        <label className={labelClass}>Sucursal Vía Cargo</label>
        <select
          required
          value={sucursalSeleccionada?.id ?? ""}
          onChange={(e) => {
            const s = sucursales.find((x) => x.id === e.target.value) ?? null;
            setSucursalSeleccionada(s);
          }}
          className={inputClass}
        >
          <option value="">Seleccioná una sucursal</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} — {s.direccion}, {s.localidad}
            </option>
          ))}
        </select>
      </div>
    )}
    {!cargandoSucursales && formData.codigoPostal.length >= 4 && sucursales.length === 0 && (
      <p className="text-sm text-red-500">
        No hay sucursales de Vía Cargo disponibles para ese código postal.
      </p>
    )}
  </div>
)}
```

- [ ] **Step 6: Update the order summary shipping cost line**

Find the existing "Envío" row in the summary panel and replace "A calcular" with:

```tsx
<div className="flex justify-between text-sm">
  <span className="text-[#A0724A]">Envío</span>
  <span className="text-[#2C1A10]">
    {cotizando
      ? "Calculando..."
      : costoEnvio !== null
      ? `$${costoEnvio.toLocaleString("es-AR")}`
      : "A calcular"}
  </span>
</div>
```

And update the Total row to include shipping:

```tsx
<div className="flex justify-between font-bold text-[#2C1A10] pt-1 border-t border-[#E0D4C4]">
  <span>Total</span>
  <span>${(total + (costoEnvio ?? 0)).toLocaleString("es-AR")}</span>
</div>
```

- [ ] **Step 7: Update the confirm button to show total with shipping**

Find the submit button that shows `$${total.toLocaleString("es-AR")}` and replace with:

```tsx
{loading ? "Procesando..." : `Confirmar pedido — $${(total + (costoEnvio ?? 0)).toLocaleString("es-AR")}`}
```

Also disable the button if costoEnvio is null (shipping not calculated yet):

```tsx
disabled={loading || costoEnvio === null}
```

- [ ] **Step 8: Update `handleSubmit` to include shipping data**

In `handleSubmit`, update the `direccionEnvio` payload:

```tsx
// Replace existing direccionEnvio: { ... } with:
direccionEnvio: {
  calle: tipoEntrega === "domicilio" ? formData.calle : "",
  numero: tipoEntrega === "domicilio" ? formData.numero : "",
  depto: formData.depto,
  ciudad: tipoEntrega === "domicilio" ? formData.ciudad : sucursalSeleccionada?.localidad ?? "",
  codigoPostal: formData.codigoPostal,
  provincia: tipoEntrega === "domicilio" ? formData.provincia : "",
  tipoEntrega,
  sucursalId: sucursalSeleccionada?.id,
  sucursalNombre: sucursalSeleccionada?.nombre,
  sucursalDireccion: sucursalSeleccionada?.direccion,
},
montoEnvio: costoEnvio ?? 0,
montoTotal: total + (costoEnvio ?? 0),
```

- [ ] **Step 9: Also update `montoTotal` in the checkout API route**

Open `app/api/checkout/route.ts`. Update the Firestore document creation to read `montoEnvio` from the body:

```ts
// In the POST handler, destructure montoEnvio from body:
const { items, clienteInfo, direccionEnvio, montoTotal, montoEnvio, metodoPago } = body;

// Update the db.collection("ordenes").add() call:
montoSubtotal: montoTotal - (montoEnvio ?? 0),
montoEnvio: montoEnvio ?? 0,
montoTotal,
```

- [ ] **Step 10: Verify in browser**

Start dev server. Go to `/checkout`:
1. Add a product to cart first, then navigate to checkout
2. Select "Retiro en sucursal Vía Cargo", enter a Buenos Aires CP (e.g. 1425), confirm sucursales load
3. Select "Envío a domicilio", fill address + CP, confirm "Calculando..." appears then a cost
4. Confirm the total in the summary and confirm button updates with the shipping cost

- [ ] **Step 11: Commit**

```bash
git add "app/(tienda)/checkout/page.tsx" app/api/checkout/route.ts
git commit -m "feat: add delivery type selector and real-time shipping cost to checkout"
```

---

## Task 9: Update `app/(tienda)/confirmacion/ConfirmacionContent.tsx`

**Files:**
- Modify: `app/(tienda)/confirmacion/ConfirmacionContent.tsx`

Currently the component only reads `ordenId` from search params and shows a static message. We need to fetch the order and display the tracking number.

- [ ] **Step 1: Replace `ConfirmacionContent.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Orden } from "@/lib/types";

export function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get("orden");
  const [orden, setOrden] = useState<Orden | null>(null);

  useEffect(() => {
    if (!ordenId) return;
    fetch(`/api/ordenes/${ordenId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOrden(data))
      .catch(() => null);
  }, [ordenId]);

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      <h1
        className="text-4xl font-bold text-[#2C1A10] mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        ¡Gracias por tu compra!
      </h1>
      <p className="text-gray-600 mb-6">Tu orden ha sido recibida.</p>

      {ordenId && (
        <div className="bg-white p-4 rounded-xl border border-[#E0D4C4] mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Número de orden
          </p>
          <p className="font-bold text-lg break-all text-[#2C1A10]">
            #{ordenId.slice(-6).toUpperCase()}
          </p>
        </div>
      )}

      {orden?.trackingNumber ? (
        <div className="bg-[#F9F5F0] p-5 rounded-xl border border-[#E0D4C4] mb-6 text-left">
          <p className="text-xs font-semibold text-[#A0724A] uppercase tracking-wide mb-1">
            Número de seguimiento
          </p>
          <p className="font-bold text-xl text-[#2C1A10] mb-3">
            {orden.trackingNumber}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {orden.direccionEnvio.tipoEntrega === "sucursal"
              ? `Retiro en sucursal: ${orden.direccionEnvio.sucursalNombre}`
              : `Envío a: ${orden.direccionEnvio.calle} ${orden.direccionEnvio.numero}, ${orden.direccionEnvio.ciudad}`}
          </p>
          <a
            href={`https://www.viacargo.com.ar/seguimiento?guia=${orden.trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#A0724A] underline hover:text-[#2C1A10]"
          >
            Rastrear mi envío →
          </a>
        </div>
      ) : (
        <p className="text-gray-600 mb-6">
          Te enviaremos un email con los detalles de tu compra y el número de
          seguimiento en cuanto el envío esté listo.
        </p>
      )}

      <Link
        href="/"
        className="inline-block bg-[#2C1A10] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify `GET /api/ordenes/[id]` exists**

```bash
ls "c:/development/dulce-hogar/app/api/ordenes/[id]/"
```

Expected: `route.ts` exists. If not, create it:

```ts
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("ordenes").doc(params.id).get();
    if (!snap.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Error fetching orden:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Verify in browser**

After a test checkout (or manually creating a Firestore document with a `trackingNumber` field), navigate to `/confirmacion?orden=<id>` and confirm the tracking section renders.

- [ ] **Step 5: Commit**

```bash
git add "app/(tienda)/confirmacion/ConfirmacionContent.tsx"
git commit -m "feat: show tracking number on confirmation page"
```

---

## Pre-launch Checklist

Before enabling live traffic:

- [ ] Envíopack account created at enviopack.com.ar
- [ ] Access token obtained from Configuración > Integraciones and added to `.env.local` (and Vercel env vars for production)
- [ ] Verify Envíopack API endpoint paths and field names in `lib/enviopack.ts` against the official docs
- [ ] Mercado Pago credentials added and `lib/mercadopago-setup.ts` stubs implemented
- [ ] Resend sender domain verified in Resend dashboard (matches `FROM` address in `lib/email.ts`)
- [ ] All products in Firestore have `peso`, `alto`, `ancho`, `largo` filled in via the admin panel
- [ ] End-to-end test: complete a checkout, confirm a payment, verify shipment appears in Envíopack panel and tracking email received
