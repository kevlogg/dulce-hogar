# Envíopack Integration Design

**Date:** 2026-06-12
**Project:** Dulce Hogar
**Status:** Approved

## Context

Dulce Hogar needs a shipping integration for their custom Next.js site. Vía Cargo (their existing carrier from Tiendanube) confirmed they have no API. Envíopack is a logistics aggregator that includes Vía Cargo in their network and offers a REST API for custom integrations.

**Stack:** Next.js + Firebase Firestore + TypeScript  
**Base URL:** `https://api.enviopack.com`  
**Auth:** Bearer token via `ENVIOPACK_ACCESS_TOKEN` env var  
**Constraint:** All API calls must be server-side only — Envíopack blocks client-side requests.

## Architecture

Approach: `lib/enviopack.ts` server-side client + dedicated API routes + changes to existing payment confirmation route.

```
checkout page
  └─ POST /api/envios/cotizar        → lib/enviopack.ts → cotizarEnvio()
  └─ GET  /api/envios/sucursales     → lib/enviopack.ts → getSucursalesViaCargo()

pagos/confirmar (MP webhook)
  └─ payment approved
      └─ update orden estadoPago: "completado"
      └─ lib/enviopack.ts → crearEnvio()
      └─ update orden: enviopackId, trackingNumber
      └─ lib/email.ts → sendTrackingEmail()  (via Resend)
```

## Data Model Changes

### `lib/types.ts` — `Producto`

Add optional shipping fields:

```ts
peso?: number    // kg
alto?: number    // cm
ancho?: number   // cm
largo?: number   // cm
```

Optional so existing products don't break. Admin UI will show a warning for products missing these fields.

### `lib/types.ts` — `DireccionEnvio`

Add delivery type and branch fields:

```ts
tipoEntrega: "domicilio" | "sucursal"
sucursalId?: string
sucursalNombre?: string
sucursalDireccion?: string
```

### `lib/types.ts` — `Orden`

Add tracking fields:

```ts
enviopackId?: string
trackingNumber?: string
```

Extend `estadoEnvio`:

```ts
estadoEnvio: "procesando" | "enviado" | "entregado" | "sin_envio"
```

`montoEnvio` already exists — it will now be populated with the real Envíopack quote instead of `0`.

### Environment Variables

Add to `.env.local`:

```
ENVIOPACK_ACCESS_TOKEN=
```

## New Module: `lib/enviopack.ts`

Four exported server-side functions:

| Function | HTTP call | Purpose |
|---|---|---|
| `getSucursalesViaCargo(cp)` | `GET /sucursales` | Returns list of Vía Cargo branches by postal code |
| `cotizarEnvio(params)` | `POST /cotizacion` | Returns shipping cost given CP, weight, dimensions, delivery type |
| `crearEnvio(orden)` | `POST /envios` | Creates shipment, returns `{ enviopackId, trackingNumber }` |
| `getTracking(enviopackId)` | `GET /envios/:id` | Returns current shipment status |

All functions read `process.env.ENVIOPACK_ACCESS_TOKEN`. Failures throw a typed `EnviopackError` with the status code and message from the API.

`cotizarEnvio` params:
```ts
{
  codigoPostal: string
  tipoEntrega: "domicilio" | "sucursal"
  sucursalId?: string
  peso: number
  alto: number
  ancho: number
  largo: number
}
```

For orders with multiple items, the caller aggregates weight/dimensions before passing them in (sum of weights, max of dimensions or a box-packing heuristic — simplest: use max dimensions + sum weights).

## New API Routes

### `GET /api/envios/sucursales?cp=<codigo_postal>`

- Calls `getSucursalesViaCargo(cp)`
- Returns: `{ sucursales: { id, nombre, direccion, localidad }[] }`
- Called from checkout when user selects "Retiro en sucursal" and enters their postal code

### `POST /api/envios/cotizar`

Body:
```ts
{
  codigoPostal: string
  tipoEntrega: "domicilio" | "sucursal"
  sucursalId?: string
  items: { productoId: string, cantidad: number }[]
}
```

- Fetches each product from Firestore to get weight/dimensions
- Aggregates: `totalPeso = sum(peso * cantidad)`, dimensions = max of all items
- Calls `cotizarEnvio()`
- Returns: `{ costo: number }`
- If any product is missing shipping data, returns `{ error: "missing_dimensions", productos: string[] }`

## Changes to Existing Routes

### `POST /api/pagos/confirmar`

Current state: fully commented out. Changes:

1. Uncomment and complete the Mercado Pago payment verification
2. On `status === "approved"`:
   a. Fetch the full `Orden` document from Firestore (needed for address + items)
   b. Fetch product details for each item (needed for weight/dimensions)
   c. Call `crearEnvio(orden)`
   d. Update Firestore orden with `enviopackId`, `trackingNumber`, `estadoPago: "completado"`
3. If `crearEnvio()` throws: log the error, update `estadoPago: "completado"` anyway (payment succeeded), set `estadoEnvio: "sin_envio"` so the admin can see it needs manual retry. Do NOT return a 500 — the payment is already charged.
4. On `crearEnvio()` success: call `sendTrackingEmail(orden, trackingNumber)` via Resend. If email fails, log and continue — it is non-blocking.

### `GET /api/ordenes/[id]`

No structural changes. Already returns the full document — `enviopackId` and `trackingNumber` will appear once populated.

## Frontend Changes

### Checkout (`app/(tienda)/checkout/page.tsx`)

Shipping step becomes two sub-steps:

**Step 1 — Delivery type selector:**
- "Envio a domicilio" radio
- "Retiro en sucursal Vía Cargo" radio

**Step 2a — Domicilio:**
- Existing address form fields (unchanged)
- CP field triggers cost calculation

**Step 2b — Sucursal:**
- CP input field
- On CP entered (5+ digits): call `GET /api/envios/sucursales?cp=...` and show a `<select>` with results
- On sucursal selected: call `POST /api/envios/cotizar` and update the order summary with the shipping cost

**Cost display:**
- Shipping cost line in order summary updates in real-time
- "Calculando..." skeleton while awaiting response
- "No disponible para esta zona" if Envíopack returns no options

### Admin — Products (`app/admin/(dashboard/)/productos/page.tsx`)

Add four numeric fields to the product create/edit form:

- Peso (kg)
- Alto (cm)
- Ancho (cm)
- Largo (cm)

Products missing any of these fields show a yellow badge "Faltan datos de envio" in the product list.

### Confirmation Page (`app/(tienda)/confirmacion/ConfirmacionContent.tsx`)

- If `trackingNumber` exists: show "Tu numero de seguimiento: XXXXXX" with a link to the Vía Cargo tracking page
- If `trackingNumber` is missing (shipment pending or failed): show "Tu envio esta siendo procesado, te notificaremos por email"

## Email Notifications (`lib/email.ts`)

Resend is already configured (`RESEND_API_KEY` in env). A new function `sendTrackingEmail` is added to the existing email module (or created if it doesn't exist yet).

**`sendTrackingEmail(orden, trackingNumber)`**

Sends to `orden.clienteInfo.email`. Content:
- Salutation with buyer's first name
- Order summary (items + total)
- Tracking number + link to Vía Cargo tracking page
- Delivery method: domicilio address or branch name/address

If `trackingNumber` is unavailable (shipment failed): send a fallback email with "Tu pedido fue confirmado. Te enviaremos el numero de seguimiento en breve." This fallback is triggered from `pagos/confirmar` when `crearEnvio()` fails.

Admin notification: the existing `ADMIN_EMAILS` env var is already used for admin alerts. On `estadoEnvio: "sin_envio"`, also send an internal alert email to admin so they can manually process the shipment.

## Error Handling

| Scenario | Behavior |
|---|---|
| Envíopack down during checkout cotizacion | Show "No podemos calcular el envio en este momento. Intentalo de nuevo." — block payment until resolved |
| Envíopack down during payment confirmation | Log error, mark order `estadoEnvio: "sin_envio"`, payment goes through, send fallback email to buyer + alert to admin |
| Product missing weight/dimensions at cotizacion | Return 422 with list of affected products — admin must fix before order can proceed |
| No branches found for postal code | Show "No hay sucursales de Vía Cargo disponibles para ese codigo postal" |

## Prerequisites (Client-side)

Before development can start against the real API:
1. Client creates account at enviopack.com.ar
2. In panel: Configuracion de cuenta > Integraciones > copy access token
3. Token is added to `.env.local` as `ENVIOPACK_ACCESS_TOKEN`

Until then, development can proceed with a mock `lib/enviopack.ts` that returns hardcoded responses matching the expected shape.
