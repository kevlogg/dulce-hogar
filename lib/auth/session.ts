import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

function getSecret() {
  const secret = process.env.JWT_SECRET ?? "fallback-dev-secret";
  return new TextEncoder().encode(secret);
}

export async function signToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
