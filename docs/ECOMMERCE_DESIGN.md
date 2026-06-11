# Dulce Hogar Ecommerce - Diseño y Especificación

**Fecha:** 2026-06-09  
**Proyecto:** Dulce Hogar | Diseño & Estilo  
**Objetivo:** Transformar sitio estático en plataforma de ecommerce con carrito, checkout y pagos

---

## 1. VISIÓN GENERAL

Convertir dulce-hogar.com de un sitio presentacional estático a una plataforma ecommerce completa que permita:
- Listar y vender productos con variantes/opciones
- Carrito de compras persistente
- Checkout profesional con recolección de datos de envío
- Integración con Mercado Pago para pagos
- Admin privado para Flor y Esteban: gestionar productos, categorías, ver órdenes
- Notificaciones automáticas por email (cliente + dueños)

---

## 2. STACK TÉCNICO

**Frontend/Backend:** Next.js 15 (App Router) con React 18  
**Base de Datos:** Firestore (Firebase)  
**Autenticación:** Firebase Auth  
**Formularios:** React Hook Form + Zod  
**UI:** Radix UI + Tailwind CSS + Lucide React  
**Pagos:** Mercado Pago SDK  
**Email:** Resend  
**Hosting:** Vercel  

**Base:** Copiar estructura de `client-admin-template` (existe en workspace)

---

## 3. MODELO DE DATOS

### 3.1 Colección `productos`
```
{
  id: string (generado)
  nombre: string
  descripcion: string
  precio: number
  imagenes: string[] (URLs de Firebase Storage)
  categoriaId: string (referencia a categorías)
  stock: number
  
  opciones: [
    {
      id: string
      nombre: string (ej: "Almohadones", "Color", "Tamaño")
      tipo: "checkbox" | "select" | "radio"
      items: [
        {
          id: string
          nombre: string
          precioAdicional: number (0 si no aplica)
        }
      ]
    }
  ]
  
  especificaciones: {
    [key: string]: string
    // ej: { dimensiones: "120x80x90cm", material: "Madera", ... }
  }
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3.2 Colección `categorias`
```
{
  id: string
  nombre: string
  descripcion: string
  imagen: string (URL Storage)
  orden: number (para ordenar en UI)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3.3 Colección `ordenes`
```
{
  id: string
  
  clienteInfo: {
    nombre: string
    apellido: string
    email: string
    telefono: string
  }
  
  direccionEnvio: {
    calle: string
    numero: string
    depto: string (opcional)
    ciudad: string
    codigoPostal: string
    provincia: string
  }
  
  items: [
    {
      productoId: string
      nombre: string
      cantidad: number
      precioUnitario: number
      opcionesSeleccionadas: [
        {
          opcionId: string
          itemSeleccionadoId: string
          precioAdicional: number
        }
      ]
    }
  ]
  
  montoSubtotal: number
  montoEnvio: number (0 por ahora, se configura manualmente)
  montoTotal: number
  
  estadoPago: "pendiente" | "completado" | "fallido"
  estadoEnvio: "procesando" | "enviado" | "entregado"
  
  metodoPago: "mercadopago"
  mercadopagoPreferenceId: string
  mercadopagoPaymentId: string (después del pago completado)
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 4. ARQUITECTURA DE RUTAS

### 4.1 Rutas Públicas (tienda)
- **`/`** — Home/listado productos (grid por categoría)
- **`/productos/[id]`** — Detalle producto (imágenes, descripción, opciones, agregar carrito)
- **`/carrito`** — Carrito de compras (modificar cantidad, ver resumen)
- **`/checkout`** — Checkout (formulario cliente + envío + resumen final + botón pagar)
- **`/confirmacion`** — Post-pago (resumen orden, número referencia)

### 4.2 Rutas Admin (protegidas con AuthGuard)
- **`/admin`** — Dashboard (stats básicos)
- **`/admin/productos`** — CRUD productos (listar, crear, editar, eliminar)
- **`/admin/categorias`** — CRUD categorías (listar, crear, editar, eliminar)
- **`/admin/ordenes`** — Listar órdenes (ver detalles, cambiar estado envío)
- **`/admin/plan`** — Mantener (adaptada si es necesario)
- **`/admin/academia`** — Mantener (adaptada si es necesario)

### 4.3 Rutas de Autenticación
- **`/admin/login`** — Login (mantener de template)

---

## 5. API ROUTES

### 5.1 Productos
- `POST /api/productos` — crear producto
- `GET /api/productos` — listar todos
- `GET /api/productos/[id]` — obtener detalle
- `PUT /api/productos/[id]` — actualizar
- `DELETE /api/productos/[id]` — eliminar

### 5.2 Categorías
- `POST /api/categorias` — crear
- `GET /api/categorias` — listar
- `PUT /api/categorias/[id]` — actualizar
- `DELETE /api/categorias/[id]` — eliminar

### 5.3 Órdenes
- `POST /api/ordenes` — crear orden (desde checkout)
- `GET /api/ordenes` — listar (admin)
- `PUT /api/ordenes/[id]/estado-envio` — cambiar estado envío

### 5.4 Pagos (Mercado Pago)
- `POST /api/pagos/crear-preferencia` — crear intent de pago con MP
- `POST /api/pagos/confirmar` — confirmar pago después del callback de MP

---

## 6. FLUJO DE COMPRA

```
[Tienda pública]
    ↓
1. User navega productos, ve detalles
2. Selecciona variantes/opciones
3. Hace click "Agregar al carrito"
   → Se guarda en localStorage + estado global (Context/Zustand)
    ↓
[Página carrito]
    ↓
4. User ve items, puede cambiar cantidad
5. Click "Proceder a checkout"
    ↓
[Página checkout]
    ↓
6. Formulario: datos personales (nombre, email, teléfono)
7. Formulario: dirección de envío (calle, ciudad, etc.)
8. Resumen de orden final
9. Click "Proceder a pago"
   → POST /api/pagos/crear-preferencia
   → Backend crea preferencia en Mercado Pago
   → User es redirigido a checkout de Mercado Pago
    ↓
[Mercado Pago]
    ↓
10. User completa pago en plataforma de MP
11. MP redirige a /confirmacion?payment_id=XXX
    ↓
[Página confirmación + Backend]
    ↓
12. Frontend valida que payment_id existe
13. POST /api/pagos/confirmar con payment_id
14. Backend:
    - Verifica estado con API de Mercado Pago
    - Si estado = "approved":
      • Crea orden en Firestore
      • Envía email al cliente (resumen + número referencia)
      • Envía email a Flor/Esteban (nueva orden + detalles)
      • Retorna confirmación
15. User ve resumen, número de orden, "gracias por tu compra"
```

---

## 7. INTEGRACIÓN MERCADO PAGO

### 7.1 Setup
- Instalar: `npm install @mercadopago/sdk-nodejs`
- Variables de entorno:
  ```
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_public_key
  MERCADOPAGO_ACCESS_TOKEN=tu_access_token
  ```

### 7.2 Flujo de Pago
1. **Frontend (`/checkout`):** User completa checkout form
2. **POST `/api/pagos/crear-preferencia`:**
   - Recibe items, montos, datos cliente
   - Crea preferencia en Mercado Pago
   - Retorna URL de checkout
3. **Frontend:** Redirige a URL de Mercado Pago
4. **User paga en Mercado Pago**
5. **Callback:** Mercado Pago redirige a `/confirmacion?payment_id=XXX`
6. **POST `/api/pagos/confirmar`:**
   - Valida payment_id con API de Mercado Pago
   - Si aprobado: crea orden en Firestore
   - Envía notificaciones por email

### 7.3 Variables Ambiente (después, cuando tengas credenciales)
```
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxx
```

---

## 8. NOTIFICACIONES POR EMAIL

### 8.1 Setup
- Instalar: `npm install resend`
- Variable de entorno:
  ```
  RESEND_API_KEY=re_xxxxxxxxxxxxx
  ```

### 8.2 Emails Automáticos

**Email al cliente:**
- Asunto: "Tu orden #12345 fue confirmada - Dulce Hogar"
- Contenido: resumen de items, dirección envío, monto total, número de orden

**Email a dueños (Flor + Esteban):**
- Asunto: "Nueva orden #12345 - Dulce Hogar"
- Contenido: datos cliente, items completos, dirección, monto total, instrucciones de envío

---

## 9. ADMIN PANEL

### 9.1 Sección Productos (`/admin/productos`)
**Funcionalidad:**
- Tabla/grid de productos existentes
- Botón "Nuevo producto"
- Form: nombre, descripción, precio, imágenes, stock, categoría, opciones, especificaciones
- Editar/duplicar/eliminar producto
- Upload de imágenes a Firebase Storage

**Variantes/Opciones:**
- Dentro del form, agregar dinámicamente opciones (ej: "Almohadones")
- Cada opción tiene items con nombre y precio adicional

### 9.2 Sección Categorías (`/admin/categorias`)
**Funcionalidad:**
- Tabla de categorías
- Form crear/editar: nombre, descripción, imagen
- Orden personalizado (drag & drop o numero manual)
- Eliminar

### 9.3 Sección Órdenes (`/admin/ordenes`)
**Funcionalidad:**
- Tabla todas las órdenes
- Filtros: estado pago, estado envío, rango fechas (opcional inicialmente)
- Expandir orden para ver detalles completos
- Cambiar estado envío: "procesando" → "enviado" → "entregado"
- Al cambiar a "enviado": opción de ingresar número de seguimiento
- Cuando cambias estado: se envía email automático al cliente

---

## 10. ACCESO Y AUTENTICACIÓN

### 10.1 Admin
- Solo tú, Flor y Esteban: emails autenticados en Firebase Auth
- Rutas `/admin/*` protegidas con `AuthGuard` (reutilizar de template)

### 10.2 Tienda Pública
- Sin autenticación requerida
- Carrito en localStorage (anónimo)

---

## 11. REUTILIZACIÓN DE `client-admin-template`

**Qué copiamos/mantenemos:**
- ✅ Estructura Next.js + Firebase setup
- ✅ AuthGuard + AdminSidebar
- ✅ Componentes UI (button, EmptyState, LoadingSkeleton, SectionHeader)
- ✅ React Hook Form + Zod para formularios
- ✅ Tailwind + Radix UI styling

**Qué adaptamos:**
- AdminSidebar: renombrar "Sección 1" → "Productos", "Sección 2" → "Categorías", agregar "Órdenes"
- Dashboard admin: mostrar stats básicos (total órdenes, monto últimos 30 días, etc.)
- Secciones "Mi Plan" y "Academia": mantener o adaptar según necesidad

**Qué agregamos:**
- Rutas públicas de tienda (/, /productos/[id], /carrito, /checkout, /confirmacion)
- Componentes de tienda (ProductCard, Cart, CheckoutForm)
- API routes completas
- Integración Mercado Pago
- Servicio de email (Resend)

---

## 12. CONSIDERACIONES ESPECIALES

### 12.1 Envíos (TBD)
- Actualmente: costo de envío fijo o sin cargo durante setup
- Después: integrar transportista (OCA, Correo, etc.) según lo definas con clientes
- Sistema diseñado para agregar múltiples opciones de envío después

### 12.2 Imágenes
- Usar Firebase Storage para almacenar
- Reutilizar componente `ProxiedImage` del template

### 12.3 Carrito Persistente
- localStorage para carrito anónimo
- Si implementas login después, migrar a BD

### 12.4 Moneda
- Asumir ARS (pesos argentinos)
- Integración Mercado Pago maneja ARS por default en Argentina

---

## 13. SCOPE INICIAL vs FUTURO

### Fase 1 (this spec)
- ✅ CRUD productos con variantes
- ✅ CRUD categorías
- ✅ Carrito + checkout
- ✅ Mercado Pago básico
- ✅ Notificaciones email
- ✅ Admin para Flor/Esteban
- ✅ Tienda pública

### Fase 2+ (después)
- Integración transportistas específicas
- Historial de órdenes para clientes
- Reportes/analytics para admin
- Wishlist/favoritos
- Reviews de productos
- Cupones/descuentos

---

## 14. TESTING

No incluido en spec inicial, pero considerar después:
- Unit tests para API routes
- E2E tests para flujo de compra
- Tests de integración Mercado Pago (con sandbox)

---

## SIGUIENTE PASO

Una vez aprobado este diseño, se crea plan de implementación con pasos detallados (crear proyecto, setup Firebase, APIs, componentes, etc.)
