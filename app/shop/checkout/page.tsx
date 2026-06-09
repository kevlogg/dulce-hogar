"use client";
import { useCart } from "@/components/shop/CartProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    calle: "",
    numero: "",
    ciudad: "",
    codigoPostal: "",
    provincia: "",
  });

  const total = items.reduce((sum, item) => {
    const opcionesTotal = item.opcionesSeleccionadas.reduce(
      (acc, opt) => acc + opt.precioAdicional,
      0
    );
    return sum + opcionesTotal * item.cantidad;
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          clienteInfo: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
          },
          direccionEnvio: {
            calle: formData.calle,
            numero: formData.numero,
            ciudad: formData.ciudad,
            codigoPostal: formData.codigoPostal,
            provincia: formData.provincia,
          },
          montoTotal: total,
        }),
      });

      if (res.ok) {
        const { id } = await res.json();
        clear();
        router.push(`/shop/confirmacion?orden=${id}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">Datos Personales</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          required
          value={formData.nombre}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          required
          value={formData.apellido}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          required
          value={formData.telefono}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <h2 className="text-2xl font-bold mt-6">Dirección de Envío</h2>
        <input
          type="text"
          name="calle"
          placeholder="Calle"
          required
          value={formData.calle}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="numero"
          placeholder="Número"
          required
          value={formData.numero}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          required
          value={formData.ciudad}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="codigoPostal"
          placeholder="Código Postal"
          required
          value={formData.codigoPostal}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="provincia"
          placeholder="Provincia"
          required
          value={formData.provincia}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2C1A10] text-white py-3 rounded hover:bg-[#A0724A] disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Continuar a Pago"}
        </button>
      </form>

      <div className="bg-white p-6 rounded h-fit">
        <h2 className="text-2xl font-bold mb-4">Resumen</h2>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.productoId} className="flex justify-between text-sm">
              <span>{item.productoId} x{item.cantidad}</span>
              <span>
                $
                {(
                  item.opcionesSeleccionadas.reduce(
                    (acc, opt) => acc + opt.precioAdicional,
                    0
                  ) * item.cantidad
                ).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <p className="text-xl font-bold">
            Total: ${total.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </div>
  );
}
