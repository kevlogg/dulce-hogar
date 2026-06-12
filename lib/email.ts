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
