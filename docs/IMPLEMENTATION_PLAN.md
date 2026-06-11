# Dulce Hogar Ecommerce - Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar dulce-hogar de sitio estático HTML a plataforma ecommerce completa con Next.js, carrito, checkout y pagos Mercado Pago.

**Architecture:** Copiar client-admin-template como base (Next.js + Firebase). Agregar rutas públicas de tienda, APIs para productos/órdenes/pagos, integración Mercado Pago y Resend. Admin panel reutiliza estructura del template.

**Tech Stack:** Next.js 15, React 18, Firebase/Firestore, Mercado Pago SDK, Resend, Radix UI, Tailwind CSS, React Hook Form, Zod.

---

## Estructura de Archivos

```
dulce-hogar/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── productos/[id]/page.tsx
│   │   ├── carrito/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── confirmacion/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── productos/page.tsx
│   │   │   ├── categorias/page.tsx
│   │   │   ├── ordenes/page.tsx
│   │   │   ├── plan/page.tsx
│   │   │   └── academia/page.tsx
│   └── api/
│       ├── productos/route.ts
│       ├── productos/[id]/route.ts
│       ├── categorias/route.ts
│       ├── categorias/[id]/route.ts
│       ├── ordenes/route.ts
│       ├── ordenes/[id]/route.ts
│       ├── ordenes/[id]/estado-envio/route.ts
│       ├── pagos/crear-preferencia/route.ts
│       └── pagos/confirmar/route.ts
├── components/
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── CartProvider.tsx
│   │   ├── Cart.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── OrderSummary.tsx
│   └── (admin/ y ui/ vienen del template)
├── lib/
│   ├── mercadopago.ts
│   ├── email.ts
│   ├── types.ts
│   └── (resto del template)
└── docs/
    └── (ECOMMERCE_DESIGN.md ya existe)
```

---

## FASE 1: SETUP Y ESTRUCTURA BASE

### Task 1: Crear proyecto Next.js basado en client-admin-template

**Descripción:** Copiar client-admin-template a dulce-hogar, actualizar configuración y dependencias.

**Files:**
- Modify: copiar estructura completa de client-admin-template
- Modify: `.env.local` con credenciales adecuadas
- Modify: `package.json` — agregar @mercadopago/sdk-nodejs y resend
- Create: `docs/IMPLEMENTATION_PLAN.md` (este archivo)

- [ ] **Step 1: Verificar que client-admin-template existe y está actualizado**

```bash
ls -la c:/development/client-admin-template/
```

Esperado: ver `app/`, `components/`, `lib/`, `package.json`, etc.

- [ ] **Step 2: Copiar estructura base a dulce-hogar**

```bash
cp -r c:/development/client-admin-template/* c:/development/dulce-hogar/
```

(Excepto: .git, .next, node_modules)

- [ ] **Step 3: Actualizar package.json en dulce-hogar**

En `c:/development/dulce-hogar/package.json`, agregar deps:

```json
{
  "dependencies": {
    "@mercadopago/sdk-nodejs": "^2.1.0",
    "resend": "^3.4.0",
    "zustand": "^4.5.0"
  }
}
```

- [ ] **Step 4: Instalar dependencias**

```bash
cd c:/development/dulce-hogar
npm install
```

Esperado: `npm notice` sin errors

- [ ] **Step 5: Verificar que Next.js dev funciona**

```bash
cd c:/development/dulce-hogar
npm run dev
```

Esperado: output "▲ Next.js 15.x started..."

- [ ] **Step 6: Commit**

```bash
cd c:/development/dulce-hogar
git add package.json package-lock.json
git commit -m "feat: initialize Next.js ecommerce from template"
```

---

### Task 2: Definir tipos TypeScript para Firestore

**Descripción:** Crear archivo con tipos para productos, categorías y órdenes.

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Crear lib/types.ts con tipos Firestore**

```typescript
// lib/types.ts

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpcionItem {
  id: string;
  nombre: string;
  precioAdicional: number;
}

export interface OpcionProducto {
  id: string;
  nombre: string;
  tipo: "checkbox" | "select" | "radio";
  items: OpcionItem[];
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  categoriaId: string;
  stock: number;
  opciones: OpcionProducto[];
  especificaciones: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteInfo {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface DireccionEnvio {
  calle: string;
  numero: string;
  depto?: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
}

export interface ItemOrden {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  opcionesSeleccionadas: {
    opcionId: string;
    itemSeleccionadoId: string;
    precioAdicional: number;
  }[];
}

export interface Orden {
  id: string;
  clienteInfo: ClienteInfo;
  direccionEnvio: DireccionEnvio;
  items: ItemOrden[];
  montoSubtotal: number;
  montoEnvio: number;
  montoTotal: number;
  estadoPago: "pendiente" | "completado" | "fallido";
  estadoEnvio: "procesando" | "enviado" | "entregado";
  metodoPago: "mercadopago";
  mercadopagoPreferenceId: string;
  mercadopagoPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productoId: string;
  cantidad: number;
  opcionesSeleccionadas: {
    opcionId: string;
    itemSeleccionadoId: string;
    precioAdicional: number;
  }[];
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/development/dulce-hogar
git add lib/types.ts
git commit -m "feat: define TypeScript types for products, orders, cart"
```

---

### Task 3: Configurar variables de entorno

**Descripción:** Actualizar .env.local y .env.example con nuevas variables.

**Files:**
- Modify: `.env.local`
- Modify: `.env.example`

- [ ] **Step 1: Actualizar .env.example**

```bash
cat > c:/development/dulce-hogar/.env.example << 'EOF'
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=

# Email (Resend)
RESEND_API_KEY=

# Admin emails (para notificaciones)
ADMIN_EMAILS=flor@dulcehogar.com,esteban@dulcehogar.com
EOF
```

- [ ] **Step 2: Verificar que .env.local tiene todas las vars**

Abrir `.env.local` y confirmar:
- ✅ Firebase vars (ya debería tener del template)
- ✅ NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
- ✅ MERCADOPAGO_ACCESS_TOKEN=
- ✅ RESEND_API_KEY=
- ✅ ADMIN_EMAILS=

(Dejar vacías por ahora, se llenan cuando cliente proporciona credenciales)

- [ ] **Step 3: Commit**

```bash
cd c:/development/dulce-hogar
git add .env.example
git commit -m "feat: add environment variables for Mercado Pago and Resend"
```

---

## FASE 2: APIs DE PRODUCTOS Y CATEGORÍAS

### Task 4: API GET productos

**Descripción:** Crear endpoint para listar todos los productos.

**Files:**
- Create: `app/api/productos/route.ts`

- [ ] **Step 1: Crear route.ts para GET productos**

```typescript
// app/api/productos/route.ts

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Producto } from "@/lib/types";

export async function GET() {
  try {
    const q = query(collection(db, "productos"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Producto[];

    return Response.json(productos);
  } catch (error) {
    console.error("Error fetching productos:", error);
    return Response.json(
      { error: "Failed to fetch productos" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/development/dulce-hogar
git add app/api/productos/route.ts
git commit -m "feat: add GET /api/productos endpoint"
```

---

### Task 5: API POST productos (admin)

**Descripción:** Crear endpoint para crear producto (protegido).

**Files:**
- Modify: `app/api/productos/route.ts`

- [ ] **Step 1: Agregar POST a route.ts**

```typescript
// Agregar a app/api/productos/route.ts después del GET

import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";

// Inicializar Firebase Admin si no está
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}")),
  });
}

export async function POST(req: Request) {
  try {
    // Verificar autenticación
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    await getAuth().verifyIdToken(token);

    const body = await req.json();
    const {
      nombre,
      descripcion,
      precio,
      imagenes,
      categoriaId,
      stock,
      opciones,
      especificaciones,
    } = body;

    // Validar campos requeridos
    if (!nombre || !precio || !categoriaId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = await db.collection("productos").add({
      nombre,
      descripcion,
      precio,
      imagenes: imagenes || [],
      categoriaId,
      stock: stock || 0,
      opciones: opciones || [],
      especificaciones: especificaciones || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating producto:", error);
    return Response.json(
      { error: "Failed to create producto" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/development/dulce-hogar
git add app/api/productos/route.ts
git commit -m "feat: add POST /api/productos endpoint (admin)"
```

---

### Task 6: API CRUD individual producto [id]

**Descripción:** GET, PUT, DELETE para producto específico.

**Files:**
- Create: `app/api/productos/[id]/route.ts`

- [ ] **Step 1: Crear [id]/route.ts**

```typescript
// app/api/productos/[id]/route.ts

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp, cert } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}")),
  });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, "productos", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching producto:", error);
    return Response.json(
      { error: "Failed to fetch producto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    await getAuth().verifyIdToken(token);

    const body = await req.json();
    const docRef = doc(db, "productos", params.id);

    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id: params.id });
  } catch (error) {
    console.error("Error updating producto:", error);
    return Response.json(
      { error: "Failed to update producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    await getAuth().verifyIdToken(token);

    const docRef = doc(db, "productos", params.id);
    await deleteDoc(docRef);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting producto:", error);
    return Response.json(
      { error: "Failed to delete producto" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/development/dulce-hogar
git add app/api/productos/[id]/route.ts
git commit -m "feat: add GET/PUT/DELETE /api/productos/[id] endpoints"
```

---

### Task 7: API CRUD categorías

**Descripción:** Endpoints GET, POST, PUT, DELETE para categorías.

**Files:**
- Create: `app/api/categorias/route.ts`
- Create: `app/api/categorias/[id]/route.ts`

- [ ] **Step 1: Crear route.ts para categorías**

```typescript
// app/api/categorias/route.ts

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { Categoria } from "@/lib/types";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}")),
  });
}

export async function GET() {
  try {
    const q = query(collection(db, "categorias"), orderBy("orden", "asc"));
    const snapshot = await getDocs(q);
    const categorias = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Categoria[];

    return Response.json(categorias);
  } catch (error) {
    console.error("Error fetching categorias:", error);
    return Response.json(
      { error: "Failed to fetch categorias" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    await getAuth().verifyIdToken(token);

    const body = await req.json();
    const { nombre, descripcion, imagen, orden } = body;

    if (!nombre) {
      return Response.json(
        { error: "Nombre is required" },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "categorias"), {
      nombre,
      descripcion: descripcion || "",
      imagen: imagen || "",
      orden: orden || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating categoria:", error);
    return Response.json(
      { error: "Failed to create categoria" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Crear [id]/route.ts para categorías**

```typescript
// app/api/categorias/[id]/route.ts

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp, cert } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}")),
  });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, "categorias", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching categoria:", error);
    return Response.json(
      { error: "Failed to fetch categoria" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    await getAuth().verifyIdToken(token);

    const body = await req.json();
    const docRef = doc(db, "categorias", params.id);

    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date(),
    });

    return Response.json({ id: params.id });
  } catch (error) {
    console.error("Error updating categoria:", error);
    return Response.json(
      { error: "Failed to update categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    await getAuth().verifyIdToken(token);

    const docRef = doc(db, "categorias", params.id);
    await deleteDoc(docRef);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting categoria:", error);
    return Response.json(
      { error: "Failed to delete categoria" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd c:/development/dulce-hogar
git add app/api/categorias/route.ts app/api/categorias/[id]/route.ts
git commit -m "feat: add CRUD endpoints for categories"
```

---

## FASE 3: CARRITO Y CHECKOUT

### Task 8: Crear CartProvider (Context + localStorage)

**Descripción:** Context para manejar carrito persistente en localStorage.

**Files:**
- Create: `components/shop/CartProvider.tsx`

- [ ] **Step 1: Crear CartProvider**

```typescript
// components/shop/CartProvider.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("dulce-hogar-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
      }
    }
    setMounted(true);
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("dulce-hogar-cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productoId === newItem.productoId);
      if (existing) {
        return prev.map((item) =>
          item.productoId === newItem.productoId
            ? { ...item, cantidad: item.cantidad + newItem.cantidad }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productoId: string) => {
    setItems((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.productoId === productoId
            ? { ...item, cantidad }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((sum, item) => {
    const opcionesTotal = item.opcionesSeleccionadas.reduce(
      (acc, opt) => acc + opt.precioAdicional,
      0
    );
    return sum + (item.cantidad * opcionesTotal); // Nota: precio base se suma en checkout
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/development/dulce-hogar
git add components/shop/CartProvider.tsx
git commit -m "feat: add CartProvider with localStorage persistence"
```

---

### Task 9: Crear Layout público para tienda

**Descripción:** Layout wrapper para rutas públicas (/), con CartProvider.

**Files:**
- Create: `app/(public)/layout.tsx`

- [ ] **Step 1: Crear layout público**

```typescript
// app/(public)/layout.tsx

import { CartProvider } from "@/components/shop/CartProvider";

export const metadata = {
  title: "Dulce Hogar | Diseño & Estilo",
  description: "Tienda de muebles y decoración premium",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F3EE]">
        {/* Header simple */}
        <header className="bg-white border-b border-[#E0D4C4]">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-serif text-[#2C1A10]">
              Dulce Hogar
            </a>
            <nav className="flex gap-6 items-center">
              <a href="/" className="text-sm text-[#2C1A10]">
                Tienda
              </a>
              <a href="/carrito" className="text-sm text-[#C9A87C]">
                Carrito
              </a>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

        {/* Footer simple */}
        <footer className="bg-[#2C1A10] text-white text-center py-4 mt-12">
          <p className="text-sm">© 2025 Dulce Hogar | Diseño & Estilo</p>
        </footer>
      </div>
    </CartProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd c:/development/dulce-hogar
git add app/\(public\)/layout.tsx
git commit -m "feat: add public layout with CartProvider"
```

---

### Task 10: Crear página Home (listado productos)

**Descripción:** Página inicial que lista todos los productos por categoría.

**Files:**
- Create: `app/(public)/page.tsx`
- Create: `components/shop/ProductCard.tsx`

- [ ] **Step 1: Crear ProductCard**

```typescript
// components/shop/ProductCard.tsx

import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
}

export function ProductCard({
  id,
  nombre,
  precio,
  imagenes,
}: ProductCardProps) {
  const imagen = imagenes && imagenes[0] ? imagenes[0] : "/placeholder.png";

  return (
    <Link href={`/productos/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={imagen}
            alt={nombre}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg text-[#2C1A10] line-clamp-2">
            {nombre}
          </h3>
          <p className="text-[#C9A87C] font-semibold mt-2">
            ${precio.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Crear página Home**

```typescript
// app/(public)/page.tsx

import { Producto } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";

async function getProductos() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/productos`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Failed to fetch productos");
    return await res.json();
  } catch (e) {
    console.error("Error fetching productos:", e);
    return [];
  }
}

export default async function HomePage() {
  const productos = (await getProductos()) as Producto[];

  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-serif text-[#2C1A10] mb-8">
        Nuestros Productos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            id={producto.id}
            nombre={producto.nombre}
            precio={producto.precio}
            imagenes={producto.imagenes}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd c:/development/dulce-hogar
git add app/\(public\)/page.tsx components/shop/ProductCard.tsx
git commit -m "feat: add home page with product listing"
```

---

## FASE 4: DETALLE PRODUCTO, CARRITO Y CHECKOUT

### Task 11: Página detalle producto

**Files:** Create `app/(public)/productos/[id]/page.tsx`, `components/shop/ProductDetail.tsx`

- [ ] **Crear ProductDetail component y página**
  - Mostrar imágenes, descripción, precio
  - Selector de opciones/variantes
  - Botón "Agregar al carrito"
  - Redirigir a /carrito después de agregar

*(Implementación similar a ProductCard pero con más detalles, form para opciones)*

---

### Task 12: Página carrito

**Files:** Create `app/(public)/carrito/page.tsx`, `components/shop/Cart.tsx`

- [ ] **Crear componente Cart y página**
  - Listar items del carrito
  - Cambiar cantidad
  - Eliminar items
  - Mostrar subtotal
  - Botón "Proceder a checkout"

---

### Task 13: Página checkout

**Files:** Create `app/(public)/checkout/page.tsx`, `components/shop/CheckoutForm.tsx`, `components/shop/OrderSummary.tsx`

- [ ] **Crear CheckoutForm**
  - Form: nombre, apellido, email, teléfono
  - Form: dirección envío
  - Validación con Zod
  - POST /api/ordenes para crear orden
  - Redirect a Mercado Pago

- [ ] **Crear OrderSummary**
  - Mostrar items del carrito
  - Total con opciones incluidas
  - Monto envío (por ahora $0 o fijo)

---

## FASE 5: MERCADO PAGO E INTEGRACIÓN PAGOS

### Task 14: Crear servicio Mercado Pago

**Files:** Create `lib/mercadopago.ts`

- [ ] **Crear función para crear preferencia de pago**
  ```typescript
  export async function crearPreferenciaMercadoPago(orden: Orden) {
    // Usar SDK MercadoPago
    // Crear preferencia con items, montos
    // Retornar preference_id y init_point
  }
  ```

- [ ] **Crear función para confirmar pago**
  ```typescript
  export async function confirmarPagoMercadoPago(paymentId: string) {
    // Consultar estado en API MP
    // Retornar estado
  }
  ```

---

### Task 15: API crear preferencia pago

**Files:** Create `app/api/pagos/crear-preferencia/route.ts`

- [ ] **POST /api/pagos/crear-preferencia**
  - Recibir items de carrito + cliente info
  - Crear orden en Firestore (estado: pendiente)
  - Llamar crearPreferenciaMercadoPago()
  - Retornar URL checkout MP

---

### Task 16: API confirmar pago

**Files:** Create `app/api/pagos/confirmar/route.ts`

- [ ] **POST /api/pagos/confirmar**
  - Recibir payment_id
  - Validar con confirmarPagoMercadoPago()
  - Si aprobado: actualizar orden estado "completado"
  - Enviar emails notificación
  - Retornar confirmación

---

## FASE 6: EMAIL Y NOTIFICACIONES

### Task 17: Crear servicio email

**Files:** Create `lib/email.ts`

- [ ] **Crear funciones**
  ```typescript
  export async function enviarConfirmacionCliente(orden: Orden) { }
  export async function enviarNotificacionAdmin(orden: Orden) { }
  ```
  - Usar Resend SDK
  - Templates HTML para emails
  - Incluir detalles orden, número referencia

---

### Task 18: Página confirmación post-pago

**Files:** Create `app/(public)/confirmacion/page.tsx`

- [ ] **Crear página confirmacion**
  - Query params: payment_id
  - Validar pago
  - Mostrar resumen orden
  - Mensaje "Gracias por tu compra"
  - Link a home

---

## FASE 7: ADMIN PANEL

### Task 19: Actualizar AdminSidebar para incluir secciones nuevas

**Files:** Modify `components/admin/AdminSidebar.tsx`

- [ ] **Agregar links**
  ```javascript
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Folder },
  { href: "/admin/ordenes", label: "Órdenes", icon: ShoppingCart },
  ```

---

### Task 20: Página admin productos (CRUD)

**Files:** Create `app/admin/(dashboard)/productos/page.tsx`

- [ ] **Crear tabla de productos**
  - Listar todos
  - Botón "Nuevo"
  - Form crear/editar con React Hook Form
  - Upload imágenes a Storage
  - Botones editar/eliminar

---

### Task 21: Página admin categorías

**Files:** Create `app/admin/(dashboard)/categorias/page.tsx`

- [ ] **Crear tabla de categorías**
  - CRUD categorías
  - Orden personalizado
  - Imagen por categoría

---

### Task 22: Página admin órdenes

**Files:** Create `app/admin/(dashboard)/ordenes/page.tsx`

- [ ] **Crear tabla órdenes**
  - Listar todas
  - Expandir para ver detalles
  - Cambiar estado envío (procesando → enviado → entregado)
  - Opción ingresar número seguimiento
  - Enviar email auto al cambiar estado

---

## FASE 8: APIS ÓRDENES

### Task 23: API CRUD órdenes

**Files:** Create `app/api/ordenes/route.ts`, `app/api/ordenes/[id]/route.ts`, `app/api/ordenes/[id]/estado-envio/route.ts`

- [ ] **POST /api/ordenes** — crear orden (desde checkout)
- [ ] **GET /api/ordenes** — listar (admin)
- [ ] **GET /api/ordenes/[id]** — detalle orden
- [ ] **PUT /api/ordenes/[id]/estado-envio** — cambiar estado + enviar email

---

## FASE 9: AJUSTES FINALES

### Task 24: Agregar Firestore indexes

**Files:** Modify `firestore.indexes.json`

- [ ] **Agregar índices para queries complejas**
  - Productos por categoría
  - Órdenes por fecha

---

### Task 25: Testing manual de flujo completo

**Files:** Manual testing

- [ ] **Flujo de compra end-to-end**
  - Agregar producto al carrito
  - Proceder a checkout
  - Llenar formulario
  - Verificar que se crea orden en Firestore
  - Verificar emails enviados

- [ ] **Testing admin**
  - Login admin
  - Crear producto
  - Crear categoría
  - Ver órdenes
  - Cambiar estado envío

- [ ] **Verificar Mercado Pago**
  - Usar sandbox de MP
  - Test pago exitoso
  - Test pago rechazado
  - Verificar callback

---

### Task 26: Deploy a Vercel

**Files:** Vercel

- [ ] **Agregar variables de entorno en Vercel**
  - NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
  - MERCADOPAGO_ACCESS_TOKEN
  - RESEND_API_KEY
  - ADMIN_EMAILS
  - Firebase vars

- [ ] **Deploy**
  ```bash
  git push origin main
  ```
  Vercel auto-deploya

---

## RESUMEN

**Total Tasks:** 26  
**Fases:** 9  
**Estimado:** 2-3 semanas (con agente/subagents) o 4-6 semanas (solo)

**Blockers conocidos:**
- Credenciales Mercado Pago (cliente debe proporcionar)
- Credenciales Resend para email
- Decisión sobre transportistas de envío

**Next Steps después de implementación:**
- Integración transportistas específicas
- Sistema de cupones/descuentos
- Historial órdenes para clientes
- Analytics y reportes

