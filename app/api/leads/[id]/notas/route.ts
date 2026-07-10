import { verifySession } from "@/lib/session";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [notas, historico] = await Promise.all([
      prisma.simulacaoNota.findMany({
        where: { simulacaoId: id },
        orderBy: { criadoEm: "desc" },
      }),
      prisma.leadHistorico.findMany({
        where: { simulacaoId: id },
        orderBy: { criadoEm: "desc" },
        include: {
          usuario: {
            select: { nome: true }
          }
        }
      })
    ]);

    return Response.json({ notas, historico });
  } catch (err) {
    console.error("Erro ao buscar notas/histórico do lead:", err);
    return Response.json({ error: "Erro interno ao buscar notas e histórico" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { conteudo, autor } = body;

    if (!conteudo || !conteudo.trim()) {
      return Response.json({ error: "O conteúdo da nota é obrigatório." }, { status: 400 });
    }

    const nota = await prisma.simulacaoNota.create({
      data: {
        simulacaoId: id,
        conteudo: conteudo.trim(),
        autor: (autor ?? "Administrador").trim(),
      },
    });

    return Response.json({ success: true, nota }, { status: 201 });
  } catch (err) {
    console.error("Erro ao cadastrar nota do lead:", err);
    return Response.json({ error: "Erro interno ao cadastrar nota" }, { status: 500 });
  }
}
