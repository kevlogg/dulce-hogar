const BASE_URL = "https://api.enviopack.com";

export class EnviopackError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "EnviopackError";
  }
}

// Module-level token cache (survives across requests within the same instance)
let cachedToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiresAt: number = 0;

async function login(): Promise<string> {
  const body = new URLSearchParams({
    "api-key": process.env.ENVIOPACK_API_KEY!,
    "secret-key": process.env.ENVIOPACK_SECRET_KEY!,
  });
  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new EnviopackError(res.status, `Auth failed: ${text}`);
  }
  const data = await res.json();
  cachedToken = data.token as string;
  cachedRefreshToken = data.refresh_token as string;
  // Token expires in 4hs — refresh 10 min before
  tokenExpiresAt = Date.now() + (4 * 60 - 10) * 60 * 1000;
  return cachedToken;
}

async function refreshToken(): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/token/refresh?refresh_token=${cachedRefreshToken}`,
    { method: "POST" }
  );
  if (!res.ok) {
    // Refresh failed — login from scratch
    return login();
  }
  const data = await res.json();
  cachedToken = data.token as string;
  cachedRefreshToken = data.refresh_token as string;
  tokenExpiresAt = Date.now() + (4 * 60 - 10) * 60 * 1000;
  return cachedToken;
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  if (cachedRefreshToken) return refreshToken();
  return login();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken();
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE_URL}${path}${separator}access_token=${token}`, {
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
  provincia: string;
  transportista: string;
}

export async function getSucursales(
  codigoPostal: string
): Promise<Sucursal[]> {
  const data = await request<Array<{
    id: number;
    nombre: string;
    calle: string;
    numero: string;
    localidad: { nombre: string; provincia?: { nombre: string } };
    correo: { nombre: string };
  }>>("GET", `/sucursales?codigo_postal=${codigoPostal}`);

  return data.map((s) => ({
    id: String(s.id),
    nombre: s.nombre,
    direccion: `${s.calle} ${s.numero}`,
    localidad: s.localidad.nombre,
    provincia: s.localidad.provincia?.nombre ?? "",
    transportista: s.correo.nombre,
  }));
}

const PROVINCIA_ZONA: Record<string, string> = {
  "CABA": "CF",
  "Buenos Aires": "BA",
  "Córdoba": "CC",
  "Santa Fe": "PM",
  "Mendoza": "MC",
  "Tucumán": "NO",
  "Salta": "NO",
  "Jujuy": "NO",
  "Catamarca": "NO",
  "La Rioja": "NO",
  "Santiago del Estero": "NO",
  "Chaco": "NE",
  "Corrientes": "NE",
  "Formosa": "NE",
  "Misiones": "NE",
  "Entre Ríos": "NE",
  "La Pampa": "PM",
  "San Luis": "PM",
  "San Juan": "CY",
  "Neuquén": "PA",
  "Río Negro": "PA",
  "Chubut": "PA",
  "Santa Cruz": "PA",
  "Tierra del Fuego": "TF",
};

type PrecioRow = {
  zona: string;
  modalidad: string;
  servicio: string;
  peso_desde: string;
  peso_hasta: string;
  valor: number;
};

export async function cotizarEnvio(params: {
  provincia: string;
  tipoEntrega: "domicilio" | "sucursal";
  peso: number;
}): Promise<number> {
  const zona = PROVINCIA_ZONA[params.provincia] ?? "BA";
  const modalidad = params.tipoEntrega === "domicilio" ? "D" : "S";

  const precios = await request<PrecioRow[]>("GET", "/precios");

  const match = precios.find(
    (p) =>
      p.zona === zona &&
      p.modalidad === modalidad &&
      p.servicio === "N" &&
      params.peso >= parseFloat(p.peso_desde) &&
      params.peso <= parseFloat(p.peso_hasta)
  ) ?? precios.find(
    (p) =>
      p.zona === zona &&
      p.servicio === "N" &&
      params.peso >= parseFloat(p.peso_desde) &&
      params.peso <= parseFloat(p.peso_hasta)
  );

  console.log("[cotizarEnvio] zona:", zona, "modalidad:", modalidad, "peso:", params.peso, "match:", match);

  if (!match) {
    throw new EnviopackError(404, `Sin tarifa para zona ${zona}, peso ${params.peso}kg`);
  }

  return match.valor;
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
