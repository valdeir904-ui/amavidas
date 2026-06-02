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
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    // Garante que o diretório exista
    await mkdir(uploadsDir, { recursive: true });

    // Gera um nome único mantendo a extensão
    const ext = path.extname(file.name);
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const name = `${uniqueId}${ext}`;
    const filePath = path.join(uploadsDir, name);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (error) {
    console.error("Erro no upload de arquivo:", error);
    return NextResponse.json({ error: "Erro ao salvar arquivo" }, { status: 500 });
  }
}
