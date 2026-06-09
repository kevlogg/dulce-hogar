const required = [
  "NEXT_PUBLIC_SITE_URL",
] as const;

const optional = [
  "MP_ACCESS_TOKEN",
  "NEXT_PUBLIC_MP_PUBLIC_KEY",
] as const;

export function getEnv(key: (typeof required)[number]): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export function getEnvOptional(key: (typeof optional)[number]): string | undefined {
  return process.env[key];
}

export const siteUrl = () => getEnv("NEXT_PUBLIC_SITE_URL");
