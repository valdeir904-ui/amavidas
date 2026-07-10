import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      ultimaEtapa,
      paraQuem,
      quantidadePessoas,
      faixaEtaria,
      cidade,
      prioridade,
      orcamento,
      intencao,
    } = body;

    if (!sessionId || ultimaEtapa === undefined) {
      return Response.json(
        { error: "sessionId e ultimaEtapa são obrigatórios." },
        { status: 400 }
      );
    }

    const incompleta = await prisma.simulacaoIncompleta.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ultimaEtapa,
        paraQuem: paraQuem ?? null,
        quantidadePessoas: quantidadePessoas ?? null,
        faixaEtaria: faixaEtaria ?? null,
        cidade: cidade ?? null,
        prioridade: prioridade ?? null,
        orcamento: orcamento ?? null,
        intencao: intencao ?? null,
      },
      update: {
        ultimaEtapa,
        paraQuem: paraQuem !== undefined ? paraQuem : undefined,
        quantidadePessoas: quantidadePessoas !== undefined ? quantidadePessoas : undefined,
        faixaEtaria: faixaEtaria !== undefined ? faixaEtaria : undefined,
        cidade: cidade !== undefined ? cidade : undefined,
        prioridade: prioridade !== undefined ? prioridade : undefined,
        orcamento: orcamento !== undefined ? orcamento : undefined,
        intencao: intencao !== undefined ? intencao : undefined,
      },
    });

    return Response.json({ success: true, id: incompleta.id }, { status: 200 });
  } catch (err) {
    console.error("Erro ao registrar simulação incompleta:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
