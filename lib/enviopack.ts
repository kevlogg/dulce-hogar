const BASE_URL = "https://api.enviopack.com";

function authParams() {
  return `api_key=${process.env.ENVIOPACK_API_KEY}&secret_key=${process.env.ENVIOPACK_SECRET_KEY}`;
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
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE_URL}${path}${separator}${authParams()}`, {
    method,
    headers: { "Content-Type": "application/json" },
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
