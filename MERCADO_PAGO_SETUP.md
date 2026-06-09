# Integración Mercado Pago - Guía de Activación

Este archivo contiene los pasos para activar Mercado Pago cuando tengas las credenciales.

## Paso 1: Obtener Credenciales

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel)
2. Inicia sesión con tu cuenta
3. En el panel, ve a **Aplicaciones → Crear una aplicación**
4. Selecciona **Checkout Pro** como tipo de integración
5. Copia:
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`

## Paso 2: Configurar Variables de Entorno

Abre `.env.local` y agrega:

```
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxx
```

## Paso 3: Instalar SDK (Si no está)

```bash
npm install mercadopago
```

## Paso 4: Descomenta Código

Los endpoints están listos pero comentados. Descomentalos en:

- `lib/mercadopago-setup.ts` — Implementa `crearPreferenciaMercadoPago()` y `confirmarPagoMercadoPago()`
- `app/api/pagos/crear-preferencia/route.ts` — Descomenta el llamado a `crearPreferenciaMercadoPago()`
- `app/api/pagos/confirmar/route.ts` — Descomenta el llamado a `confirmarPagoMercadoPago()`

## Paso 5: Testing en Sandbox

Mercado Pago tiene un ambiente sandbox para testing:

1. En el panel de Mercado Pago, activa **Modo Test**
2. USA las credenciales de TEST (no production)
3. Para testear pagos rechazados, usa:
   - Tarjeta: `4111 1111 1111 1111`
   - Otros datos: cualquier valor

## Paso 6: Deploy

Una vez testes en sandbox y funcione:

1. Obtén credenciales PRODUCTION desde el panel
2. Actualiza `.env.local` (o env vars en Vercel si ya subiste)
3. Redeploy

## Referencias

- [Mercado Pago SDK Node](https://github.com/mercadopago/sdk-nodejs)
- [Checkout Pro Integration](https://www.mercadopago.com.ar/developers/es/guides/online-payments/checkout-pro/introduction)
- [Sandbox Testing](https://www.mercadopago.com.ar/developers/es/guides/resources/sandbox)

---

**Nota:** Los endpoints retornarán error hasta que descomenentes el código y tengas credenciales configuradas.
