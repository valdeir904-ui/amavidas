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
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      gclid,
      fbclid,
      referrer,
      landingPage,
      dispositivo,
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
        utmSource: utmSource ?? null,
        utmMedium: utmMedium ?? null,
        utmCampaign: utmCampaign ?? null,
        utmTerm: utmTerm ?? null,
        utmContent: utmContent ?? null,
        gclid: gclid ?? null,
        fbclid: fbclid ?? null,
        referrer: referrer ?? null,
        landingPage: landingPage ?? null,
        dispositivo: dispositivo ?? null,
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
        utmSource: utmSource !== undefined ? utmSource : undefined,
        utmMedium: utmMedium !== undefined ? utmMedium : undefined,
        utmCampaign: utmCampaign !== undefined ? utmCampaign : undefined,
        utmTerm: utmTerm !== undefined ? utmTerm : undefined,
        utmContent: utmContent !== undefined ? utmContent : undefined,
        gclid: gclid !== undefined ? gclid : undefined,
        fbclid: fbclid !== undefined ? fbclid : undefined,
        referrer: referrer !== undefined ? referrer : undefined,
        landingPage: landingPage !== undefined ? landingPage : undefined,
        dispositivo: dispositivo !== undefined ? dispositivo : undefined,
      },
    });

    return Response.json({ success: true, id: incompleta.id }, { status: 200 });
  } catch (err) {
    console.error("Erro ao registrar simulação incompleta:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
