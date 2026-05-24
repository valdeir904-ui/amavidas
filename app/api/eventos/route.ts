import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { tipo } = await req.json();
  if (!["visita", "simulacao_iniciada", "whatsapp_clicado"].includes(tipo)) {
    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  }
  await prisma.evento.create({ data: { tipo } });
  return Response.json({ ok: true });
}
