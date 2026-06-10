import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return Response.json({ error: "URL parameter required" }, { status: 400 });
    }

    // Validar que sea una URL de Firebase Storage
    if (!url.includes("firebasestorage.googleapis.com")) {
      return Response.json({ error: "Invalid image source" }, { status: 403 });
    }

    // Fetchear la imagen desde Firebase Storage
    const response = await fetch(url);

    if (!response.ok) {
      return Response.json({ error: "Image not found" }, { status: 404 });
    }

    // Retornar la imagen con los headers correctos
    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return Response.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
