import { verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  const h = req.headers.get("authorization");
  return h === `Bearer ${ADMIN_TOKEN}`;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // Validate that a file is sent and it is a File object (not a string) and has arrayBuffer
    if (!file || typeof file === "string" || !file.arrayBuffer) {
      return NextResponse.json({ error: "Nenhum arquivo enviado ou formato inválido" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the main public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Safely extract extension, using MIME type as fallback if not present
    let ext = path.extname(file.name || "");
    if (!ext) {
      const mime = file.type || "";
      if (mime.includes("image/jpeg") || mime.includes("image/jpg")) ext = ".jpg";
      else if (mime.includes("image/png")) ext = ".png";
      else if (mime.includes("image/gif")) ext = ".gif";
      else if (mime.includes("image/svg")) ext = ".svg";
      else if (mime.includes("audio/")) ext = ".mp3";
      else if (mime.includes("video/")) ext = ".mp4";
      else ext = ".bin";
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const name = `${uniqueId}${ext}`;
    
    const filePath = path.join(uploadsDir, name);
    await writeFile(filePath, buffer);

    // If running in standalone server mode, also save to .next/standalone/public/uploads if it exists
    try {
      const standaloneUploadsDir = path.join(process.cwd(), ".next", "standalone", "public", "uploads");
      await mkdir(standaloneUploadsDir, { recursive: true });
      await writeFile(path.join(standaloneUploadsDir, name), buffer);
    } catch (err) {
      // Ignore directory not found or permission errors for standalone path in development
    }

    // If process.cwd() is inside the standalone folder, also try to save to the parent public/uploads
    if (process.cwd().includes(path.join(".next", "standalone"))) {
      try {
        const parentUploadsDir = path.join(process.cwd(), "..", "..", "public", "uploads");
        await mkdir(parentUploadsDir, { recursive: true });
        await writeFile(path.join(parentUploadsDir, name), buffer);
      } catch (err) {
        // Ignore silently
      }
    }

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (error) {
    console.error("Erro no upload de arquivo:", error);
    return NextResponse.json({ error: "Erro ao salvar arquivo" }, { status: 500 });
  }
}
