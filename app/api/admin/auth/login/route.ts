import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
    }

    const hashB64 = process.env.ADMIN_PASSWORD_HASH;
    if (!hashB64) {
      return NextResponse.json({ error: "Admin no configurado" }, { status: 500 });
    }

    const hash = Buffer.from(hashB64, "base64").toString("utf8");
    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const token = await signToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
