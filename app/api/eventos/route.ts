import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tipo,
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

    if (!["visita", "simulacao_iniciada", "whatsapp_clicado", "clique_obito", "clique_telefone", "iniciou_scroll", "chegou_ao_fim"].includes(tipo)) {
      return Response.json({ error: "Tipo inválido" }, { status: 400 });
    }

    await prisma.evento.create({
      data: {
        tipo,
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
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Erro ao registrar evento:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
