import { type NextRequest } from "next/server";
import { Resend } from "resend";

const FROM = "Dulce Hogar <onboarding@resend.dev>";
const DEST = "dulcehogar.dye@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, negocio, telefono, email, monto, mensaje } = body;

    if (!nombre || !telefono || !email) {
      return Response.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: FROM,
      to: DEST,
      reply_to: email,
      subject: `Nueva solicitud mayorista — ${nombre}`,
      text: [
        "Nueva solicitud de compra mayorista:",
        "",
        `Nombre:          ${nombre}`,
        `Negocio/Local:   ${negocio || "—"}`,
        `Teléfono:        ${telefono}`,
        `Email:           ${email}`,
        `Monto estimado:  ${monto || "—"}`,
        "",
        "Mensaje:",
        mensaje || "—",
      ].join("\n"),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error enviando solicitud mayorista:", err);
    return Response.json({ error: "No se pudo enviar la solicitud." }, { status: 500 });
  }
}
