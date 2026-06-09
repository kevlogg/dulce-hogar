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
