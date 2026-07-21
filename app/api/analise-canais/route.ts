import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mes = searchParams.get("mes") || new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const startDate = new Date(`${mes}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 1. Buscar todas as simulações do mês
    const leads = await prisma.simulacao.findMany({
      where: {
        criadoEm: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        id: true,
        origem: true,
        utmSource: true,
        gclid: true,
        fbclid: true,
        referrer: true,
        status: true,
      },
    });

    // 2. Buscar visitas do mês
    const visitas = await prisma.evento.findMany({
      where: {
        tipo: "visita",
        criadoEm: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        utmSource: true,
        gclid: true,
        fbclid: true,
        referrer: true,
      },
    });

    // 3. Buscar investimentos configurados
    const configInvestimentos = await prisma.configuracao.findUnique({
      where: { chave: "investimentos_marketing" },
    });

    const investimentos = configInvestimentos ? JSON.parse(configInvestimentos.valor) : {};
    const investimentoMes = investimentos[mes] || { google: 0, meta: 0 };

    // 4. Consolidar métricas
    const canais = {
      google: { visitas: 0, leads: 0, leadsQualificados: 0, investimento: investimentoMes.google || 0 },
      meta: { visitas: 0, leads: 0, leadsQualificados: 0, investimento: investimentoMes.meta || 0 },
      whatsapp: { visitas: 0, leads: 0, leadsQualificados: 0, investimento: 0 },
      organico: { visitas: 0, leads: 0, leadsQualificados: 0, investimento: 0 },
      manual: { visitas: 0, leads: 0, leadsQualificados: 0, investimento: 0 },
    };

    function categorizarCanal(utmSource?: string | null, gclid?: string | null, fbclid?: string | null, referrer?: string | null) {
      const src = (utmSource || "").toLowerCase();
      const ref = (referrer || "").toLowerCase();
      if (gclid || src.includes("google") || src.includes("gads") || src.includes("cpc") || ref.includes("google")) {
        return "google";
      }
      if (fbclid || src.includes("meta") || src.includes("facebook") || src.includes("instagram") || src.includes("fb") || src.includes("ig") || ref.includes("facebook") || ref.includes("instagram")) {
        return "meta";
      }
      return "organico";
    }

    // Agregar visitas
    visitas.forEach((v) => {
      const canal = categorizarCanal(v.utmSource, v.gclid, v.fbclid, v.referrer);
      if (canal === "google") canais.google.visitas++;
      else if (canal === "meta") canais.meta.visitas++;
      else canais.organico.visitas++;
    });

    // Agregar leads
    leads.forEach((l) => {
      const qualificado = l.status !== "perdido";

      if (l.origem === "whatsapp_direto") {
        canais.whatsapp.leads++;
        if (qualificado) canais.whatsapp.leadsQualificados++;
      } else if (l.origem === "manual") {
        canais.manual.leads++;
        if (qualificado) canais.manual.leadsQualificados++;
      } else {
        const canal = categorizarCanal(l.utmSource, l.gclid, l.fbclid, l.referrer);
        if (canal === "google") {
          canais.google.leads++;
          if (qualificado) canais.google.leadsQualificados++;
        } else if (canal === "meta") {
          canais.meta.leads++;
          if (qualificado) canais.meta.leadsQualificados++;
        } else {
          canais.organico.leads++;
          if (qualificado) canais.organico.leadsQualificados++;
        }
      }
    });

    return Response.json({
      mes,
      canais,
    });
  } catch (err: any) {
    console.error("Erro na rota analise-canais:", err);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mes, google, meta } = body;

    if (!mes || google === undefined || meta === undefined) {
      return Response.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const config = await prisma.configuracao.findUnique({
      where: { chave: "investimentos_marketing" },
    });

    const investimentos = config ? JSON.parse(config.valor) : {};
    investimentos[mes] = {
      google: Number(google),
      meta: Number(meta),
    };

    await prisma.configuracao.upsert({
      where: { chave: "investimentos_marketing" },
      create: {
        chave: "investimentos_marketing",
        valor: JSON.stringify(investimentos),
      },
      update: {
        valor: JSON.stringify(investimentos),
      },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao salvar investimentos:", err);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
