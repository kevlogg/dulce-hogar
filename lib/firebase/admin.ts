/**
 * Firebase Admin SDK para uso en API routes y Server Components.
 * Requiere FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) o archivo en
 * GOOGLE_APPLICATION_CREDENTIALS.
 */
import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

let adminApp: any | null = null;

function getAdminApp(): any {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }
  let json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const path = require("path");
      const fs = require("fs");
      const filePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(filePath)) {
        json = fs.readFileSync(filePath, "utf8");
      }
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT_PATH read error:", e);
    }
  }
  if (!json) {
    try {
      const path = require("path");
      const fs = require("fs");
      const defaultPath = path.resolve(process.cwd(), ".firebase-service-account.json");
      if (fs.existsSync(defaultPath)) {
        json = fs.readFileSync(defaultPath, "utf8");
      }
    } catch {
      // ignore
    }
  }
  if (json) {
    try {
      const credentials = JSON.parse(json) as Record<string, unknown>;
      const projectId = credentials.project_id as string | undefined;
      const storageBucket =
        process.env.FIREBASE_STORAGE_BUCKET ||
        (projectId ? `${projectId}.firebasestorage.app` : undefined);
      adminApp = initializeApp({
        credential: cert(credentials),
        ...(storageBucket && { storageBucket }),
      });
      return adminApp;
    } catch (e) {
      console.error("Firebase service account JSON invalid:", e);
    }
  }
  // Sin credenciales (ej. build en Vercel sin env): no llamar a initializeApp()
  // para evitar "Unable to detect a Project Id". Los datos se obtendrán en runtime
  // o las funciones que usan Firestore deben capturar y devolver fallback.
  throw new Error("Firebase not configured");
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}

/**
 * Genera una signed URL pública para una imagen de Firebase Storage.
 * Válida por 6 días. Útil para compartir en WhatsApp u otros servicios externos.
 */
export async function getSignedImageUrl(storageUrl: string): Promise<string | null> {
  try {
    const u = new URL(storageUrl);
    const match = u.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    if (!match) return null;
    const bucketName = decodeURIComponent(match[1]);
    const filePath = decodeURIComponent(match[2].split("?")[0]);
    const storage = getAdminStorage();
    const file = storage.bucket(bucketName).file(filePath);
    const expires = Date.now() + 6 * 24 * 60 * 60 * 1000; // 6 días
    const [signedUrl] = await file.getSignedUrl({ action: "read", expires });
    return signedUrl;
  } catch {
    return null;
  }
}

/** Nombre del bucket de Storage (para usar en storage.bucket(nombre)). */
export function getStorageBucketName(): string | undefined {
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    return process.env.FIREBASE_STORAGE_BUCKET;
  }
  let json: string | undefined = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const path = require("path");
      const fs = require("fs");
      const filePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(filePath)) json = fs.readFileSync(filePath, "utf8");
    } catch {
      // ignore
    }
  }
  if (!json) {
    try {
      const path = require("path");
      const fs = require("fs");
      const defaultPath = path.resolve(process.cwd(), ".firebase-service-account.json");
      if (fs.existsSync(defaultPath)) json = fs.readFileSync(defaultPath, "utf8");
    } catch {
      // ignore
    }
  }
  if (json) {
    try {
      const credentials = JSON.parse(json) as { project_id?: string };
      if (credentials.project_id) {
        // Proyectos nuevos usan .firebasestorage.app; antiguos .appspot.com
        return `${credentials.project_id}.firebasestorage.app`;
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}
