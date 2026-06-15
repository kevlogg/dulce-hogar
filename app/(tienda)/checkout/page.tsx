"use client";
import { useCart } from "@/components/shop/CartProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
}

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<Record<string, any>>({});
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "cuotas">("efectivo");
  const [formData, setFormData] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    calle: "", numero: "", depto: "", ciudad: "", codigoPostal: "", provincia: "",
  });

  // Shipping state
  const [zona, setZona] = useState<"caba_amba" | "resto_pais" | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<"domicilio" | "sucursal">("domicilio");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal | null>(null);
  const [costoEnvio, setCostoEnvio] = useState<number | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [cargandoSucursales, setCargandoSucursales] = useState(false);

  const MECEDORA_ID = "zD0UV9Xa7V5LgpvJgFvd";
  const PROMO_ENDS = new Date("2026-06-21T02:59:00Z");
  const mecedoraGratis = items.some((i) => i.productoId === MECEDORA_ID) && Date.now() < PROMO_ENDS.getTime();
  const UMBRAL_ENVIO_GRATIS = 299000;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    const ids = items.map((i) => i.productoId).filter((id) => !productos[id]);
    if (!ids.length) return;
    Promise.all(ids.map((id) => fetch(`/api/productos/${id}`).then((r) => (r.ok ? r.json() : null)))).then(
      (results) => {
        const map: Record<string, any> = {};
        results.forEach((p, i) => { if (p) map[ids[i]] = p; });
        setProductos((prev) => ({ ...prev, ...map }));
      }
    );
  }, [mounted, items]);

  // Fetch Vía Cargo branches when CP changes in sucursal mode
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

  // Calculate shipping cost with debounce
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

  const totalEfectivo = items.reduce((s, i) => {
    const p = productos[i.productoId];
    return s + (p ? (p.precioEfectivo ?? Math.round(p.precio * 0.75)) * i.cantidad : 0);
  }, 0);
  const totalCuotas = items.reduce((s, i) => {
    const p = productos[i.productoId];
    return s + (p ? p.precio * i.cantidad : 0);
  }, 0);

  const envioGratisUmbral = totalEfectivo >= UMBRAL_ENVIO_GRATIS;
  const costoEnvioFinal = mecedoraGratis || zona === "caba_amba" || envioGratisUmbral ? 0 : costoEnvio;
  const subtotal = metodoPago === "efectivo" ? totalEfectivo : totalCuotas;
  const totalFinal = subtotal + (costoEnvioFinal ?? 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productoId: i.productoId,
            nombre: productos[i.productoId]?.nombre ?? i.productoId,
            cantidad: i.cantidad,
            precioUnitario: metodoPago === "efectivo"
              ? (productos[i.productoId]?.precioEfectivo ?? Math.round((productos[i.productoId]?.precio ?? 0) * 0.75))
              : (productos[i.productoId]?.precio ?? 0),
            opcionesSeleccionadas: i.opcionesSeleccionadas,
          })),
          clienteInfo: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
          },
          direccionEnvio: {
            calle: tipoEntrega === "domicilio" ? formData.calle : "",
            numero: tipoEntrega === "domicilio" ? formData.numero : "",
            depto: formData.depto,
            ciudad: tipoEntrega === "domicilio" ? formData.ciudad : (sucursalSeleccionada?.localidad ?? ""),
            codigoPostal: formData.codigoPostal,
            provincia: tipoEntrega === "domicilio" ? formData.provincia : "",
            tipoEntrega,
            sucursalId: sucursalSeleccionada?.id,
            sucursalNombre: sucursalSeleccionada?.nombre,
            sucursalDireccion: sucursalSeleccionada?.direccion,
          },
          montoEnvio: costoEnvioFinal ?? 0,
          montoTotal: totalFinal,
          metodoPago,
        }),
      });
      if (res.ok) {
        const { init_point } = await res.json();
        clear();
        window.location.href = init_point;
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "No se pudo procesar el pedido. Intentá de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Error de conexión. Verificá tu internet e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-[#A0724A] mb-6">No tenés productos en el carrito.</p>
        <Link href="/productos" className="inline-block bg-[#2C1A10] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-all">
          Ver productos
        </Link>
      </div>
    );
  }

  const inputClass = "w-full border border-[#E0D4C4] bg-white rounded-xl px-4 py-3 text-[#2C1A10] placeholder-[#B0A090] focus:outline-none focus:border-[#C9A87C] transition-colors text-sm";
  const labelClass = "block text-xs font-semibold text-[#A0724A] uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <Link href="/carrito" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">
          ← Volver al carrito
        </Link>
        <h1 className="text-3xl font-bold text-[#2C1A10] mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6">
            <h2 className="font-bold text-[#2C1A10] text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#2C1A10] text-white rounded-full flex items-center justify-center text-xs">1</span>
              Datos personales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input type="text" name="nombre" required placeholder="Florencia" value={formData.nombre} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input type="text" name="apellido" required placeholder="García" value={formData.apellido} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" required placeholder="flor@mail.com" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="tel" name="telefono" required placeholder="+54 9 11 1234-5678" value={formData.telefono} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Envío */}
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6">
            <h2 className="font-bold text-[#2C1A10] text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#2C1A10] text-white rounded-full flex items-center justify-center text-xs">2</span>
              Envío
            </h2>

            {/* Paso 1: Zona */}
            <div className="mb-5">
              <label className={labelClass}>¿Dónde recibís el pedido?</label>
              <div className="flex gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => { setZona("caba_amba"); setTipoEntrega("domicilio"); setSucursalSeleccionada(null); setCostoEnvio(null); }}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    zona === "caba_amba"
                      ? "border-[#2C1A10] bg-[#2C1A10] text-white"
                      : "border-[#E0D4C4] text-[#2C1A10] hover:border-[#C9A87C]"
                  }`}
                >
                  🏙️ CABA / GBA
                </button>
                <button
                  type="button"
                  onClick={() => { setZona("resto_pais"); setSucursalSeleccionada(null); setCostoEnvio(null); }}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    zona === "resto_pais"
                      ? "border-[#2C1A10] bg-[#2C1A10] text-white"
                      : "border-[#E0D4C4] text-[#2C1A10] hover:border-[#C9A87C]"
                  }`}
                >
                  📦 Resto del país
                </button>
              </div>
            </div>

            {/* CABA / GBA: solo domicilio */}
            {zona === "caba_amba" && (
              <>
                <div className="bg-[#F7F3EE] rounded-xl px-4 py-2.5 mb-4 text-xs text-[#A0724A]">
                  🚚 Hacemos flete a domicilio en CABA y GBA. Te coordinamos la entrega por WhatsApp.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Calle</label>
                    <input type="text" name="calle" required placeholder="Av. Corrientes" value={formData.calle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Número</label>
                    <input type="text" name="numero" required placeholder="1234" value={formData.numero} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Depto / Piso (opcional)</label>
                    <input type="text" name="depto" placeholder="3B" value={formData.depto} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ciudad / Localidad</label>
                    <input type="text" name="ciudad" required placeholder="Moreno" value={formData.ciudad} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Código Postal</label>
                    <input type="text" name="codigoPostal" required placeholder="Ej: 1744" value={formData.codigoPostal} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {/* Resto del país */}
            {zona === "resto_pais" && (
              <>
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

                {tipoEntrega === "domicilio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Calle</label>
                      <input type="text" name="calle" required placeholder="Av. Corrientes" value={formData.calle} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Número</label>
                      <input type="text" name="numero" required placeholder="1234" value={formData.numero} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Depto / Piso (opcional)</label>
                      <input type="text" name="depto" placeholder="3B" value={formData.depto} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Ciudad</label>
                      <input type="text" name="ciudad" required placeholder="Buenos Aires" value={formData.ciudad} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Código Postal</label>
                      <input type="text" name="codigoPostal" required placeholder="Ej: 1744" value={formData.codigoPostal} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Provincia</label>
                      <select name="provincia" required value={formData.provincia} onChange={handleChange} className={inputClass}>
                        <option value="">Seleccioná una provincia</option>
                        {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {tipoEntrega === "sucursal" && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Código postal</label>
                      <input type="text" name="codigoPostal" maxLength={5} required placeholder="1425" value={formData.codigoPostal} onChange={handleChange} className={inputClass} />
                    </div>
                    {cargandoSucursales && <p className="text-sm text-[#A0724A]">Buscando sucursales...</p>}
                    {!cargandoSucursales && sucursales.length > 0 && (
                      <div>
                        <label className={labelClass}>Sucursal Vía Cargo</label>
                        <select required value={sucursalSeleccionada?.id ?? ""} onChange={(e) => { const s = sucursales.find((x) => x.id === e.target.value) ?? null; setSucursalSeleccionada(s); }} className={inputClass}>
                          <option value="">Seleccioná una sucursal</option>
                          {sucursales.map((s) => (
                            <option key={s.id} value={s.id}>{s.nombre} — {s.direccion}, {s.localidad}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {!cargandoSucursales && formData.codigoPostal.length >= 4 && sucursales.length === 0 && (
                      <p className="text-sm text-red-500">No hay sucursales de Vía Cargo disponibles para ese código postal.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6">
            <h2 className="font-bold text-[#2C1A10] text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#2C1A10] text-white rounded-full flex items-center justify-center text-xs">3</span>
              Método de pago
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${metodoPago === "efectivo" ? "border-green-500 bg-green-50" : "border-[#E0D4C4] hover:border-[#C9A87C]"}`}
              >
                <p className="font-bold text-[#2C1A10] text-sm mb-1">Efectivo / Transferencia</p>
                <p className="text-xs text-green-700 font-semibold">25% OFF — ${totalEfectivo.toLocaleString("es-AR")}</p>
                <p className="text-xs text-[#A0724A] mt-0.5">Pago al recibir o por transferencia</p>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago("cuotas")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${metodoPago === "cuotas" ? "border-[#2C1A10] bg-[#FAF7F3]" : "border-[#E0D4C4] hover:border-[#C9A87C]"}`}
              >
                <p className="font-bold text-[#2C1A10] text-sm mb-1">Cuotas fijas</p>
                <p className="text-xs text-[#2C1A10] font-semibold">${totalCuotas.toLocaleString("es-AR")}</p>
                <p className="text-xs text-[#A0724A] mt-0.5">3 y 6 cuotas sin interés</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !zona || (zona === "resto_pais" && costoEnvioFinal === null)}
            className="w-full bg-[#2C1A10] text-white py-4 rounded-full font-bold text-base hover:bg-[#A0724A] transition-all disabled:opacity-50"
          >
            {loading
              ? "Procesando..."
              : !zona
              ? "Seleccioná tu zona de envío para continuar"
              : zona === "resto_pais" && costoEnvioFinal === null
              ? "Completá los datos de envío para continuar"
              : `Confirmar pedido — $${totalFinal.toLocaleString("es-AR")}`}
          </button>
          {submitError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}
        </form>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-5 sticky top-20 md:top-32">
            <h2 className="font-bold text-[#2C1A10] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tu pedido
            </h2>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {items.map((item) => {
                const p = productos[item.productoId];
                const precio = metodoPago === "efectivo"
                  ? (p?.precioEfectivo ?? Math.round((p?.precio ?? 0) * 0.75))
                  : (p?.precio ?? 0);
                return (
                  <div key={item.productoId} className="flex gap-2 items-center">
                    {p?.imagenes?.[0] ? (
                      <img src={p.imagenes[0]} alt={p.nombre} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-[#EFEBE3] rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#2C1A10] line-clamp-2 leading-tight">{p?.nombre ?? item.productoId}</p>
                      <p className="text-xs text-[#A0724A]">x{item.cantidad}</p>
                    </div>
                    <p className="text-sm font-bold text-[#2C1A10] shrink-0">${(precio * item.cantidad).toLocaleString("es-AR")}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#E0D4C4] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Subtotal</span>
                <span className="font-semibold text-[#2C1A10]">${subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Envío</span>
                <span className={mecedoraGratis || zona === "caba_amba" || envioGratisUmbral ? "text-green-700 font-semibold" : "text-[#2C1A10]"}>
                  {mecedoraGratis || zona === "caba_amba" || envioGratisUmbral
                    ? "Gratis ✓"
                    : cotizando
                    ? "Calculando..."
                    : costoEnvioFinal !== null
                    ? `$${costoEnvioFinal.toLocaleString("es-AR")}`
                    : "A calcular"}
                </span>
              </div>
              {envioGratisUmbral && (
                <p className="text-xs text-green-600">Tu compra supera $299.000 — envío sin cargo.</p>
              )}
              <div className="flex justify-between font-bold text-[#2C1A10] pt-1 border-t border-[#E0D4C4]">
                <span>Total</span>
                <span className={metodoPago === "efectivo" ? "text-green-700" : ""}>
                  ${totalFinal.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
