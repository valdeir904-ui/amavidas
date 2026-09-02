import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";

// ── GET — Retorna o investimento do mês ou lista de meses ─────────────────────
export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mesAno = searchParams.get("mesAno");

  if (mesAno) {
    const investimento = await prisma.investimentoMarketing.findUnique({
      where: { mesAno },
    });
    return Response.json({ investimento });
  }

  const investimentos = await prisma.investimentoMarketing.findMany({
    orderBy: { mesAno: "desc" },
  });

  return Response.json({ investimentos });
}

// ── POST / PATCH — Cria ou atualiza investimento mensal (Agência / Master) ──
export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session || (session.perfil !== "AGENCIA" && session.perfil !== "MASTER")) {
    return Response.json(
      { error: "Apenas o perfil Agência ou Master pode alterar os investimentos." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { mesAno, investimentoLeads, investimentoBranding, observacoes } = body;

    if (!mesAno || typeof mesAno !== "string" || !/^\d{4}-\d{2}$/.test(mesAno)) {
      return Response.json(
        { error: "Mês/Ano inválido. Use o formato YYYY-MM (ex: 2026-09)." },
        { status: 400 }
      );
    }

    const leadsVal = Math.max(0, parseFloat(investimentoLeads) || 0);
    const brandingVal = Math.max(0, parseFloat(investimentoBranding) || 0);

    const investimento = await prisma.investimentoMarketing.upsert({
      where: { mesAno },
      update: {
        investimentoLeads: leadsVal,
        investimentoBranding: brandingVal,
        observacoes: observacoes ?? null,
      },
      create: {
        mesAno,
        investimentoLeads: leadsVal,
        investimentoBranding: brandingVal,
        observacoes: observacoes ?? null,
      },
    });

    return Response.json({ ok: true, investimento });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Erro ao salvar investimento" },
      { status: 500 }
    );
  }
}
