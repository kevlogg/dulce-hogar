import { getAdminStorage, getStorageBucketName } from "@/lib/firebase/admin";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const storage = getAdminStorage();
    const bucketName = getStorageBucketName();
    if (!bucketName) throw new Error("Storage bucket not configured");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `productos/${Date.now()}-${safeName}`;
    const fileRef = storage.bucket(bucketName).file(filename);

    // Generate a permanent download token (works with Uniform Bucket Level Access)
    const token = randomUUID();

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const encodedPath = encodeURIComponent(filename);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;
    return Response.json({ url: publicUrl });
  } catch (error: any) {
    const msg = error?.message ?? String(error);
    console.error("Upload error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
