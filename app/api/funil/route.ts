import { verifySession } from "@/lib/session";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  
  let startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 29); // padrão: últimos 30 dias
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  if (fromParam) {
    const [y, m, d] = fromParam.split("-").map(Number);
    if (y && m && d) startDate = new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  if (toParam) {
    const [y, m, d] = toParam.split("-").map(Number);
    if (y && m && d) endDate = new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  try {
    // 1. Carregar investimento
    const configInvestimento = await prisma.configuracao.findUnique({
      where: { chave: "investimento_anuncios" },
    });
    const adSpend = configInvestimento ? parseFloat(configInvestimento.valor) : 580.79;

    // 2. Buscar Dados
    const [leads, abandonos, historico, usuarios] = await Promise.all([
      prisma.simulacao.findMany({
        where: { criadoEm: { gte: startDate, lte: endDate } },
        include: { responsavel: { select: { id: true, nome: true } } },
      }),
      prisma.simulacaoIncompleta.findMany({
        where: { criadoEm: { gte: startDate, lte: endDate } },
      }),
      prisma.leadHistorico.findMany({
        where: { criadoEm: { gte: startDate, lte: endDate } },
        orderBy: { criadoEm: "asc" },
      }),
      prisma.usuario.findMany({
        select: { id: true, nome: true },
      }),
    ]);

    const totalLeads = leads.length;

    // ── MÉTRIAS DE QUALIDADE ──
    const intencaoCounts = { contratar_agora: 0, entender_melhor: 0, pesquisando: 0, anterior: 0 };
    const intencaoGanhos = { contratar_agora: 0, entender_melhor: 0, pesquisando: 0, anterior: 0 };

    let invalidosCount = 0;

    for (const l of leads) {
      const intentKey = (l.intencao as keyof typeof intencaoCounts) || "anterior";
      intencaoCounts[intentKey]++;
      if (l.status === "ganho") {
        intencaoGanhos[intentKey]++;
      }
      if (l.motivoDescarte === "dado_invalido") {
        invalidosCount++;
      }
    }

    const pctInvalidos = totalLeads > 0 ? parseFloat(((invalidosCount / totalLeads) * 100).toFixed(1)) : 0;

    const convPorIntencao = {
      contratar_agora: intencaoCounts.contratar_agora > 0 ? Math.round((intencaoGanhos.contratar_agora / intencaoCounts.contratar_agora) * 100) : 0,
      entender_melhor: intencaoCounts.entender_melhor > 0 ? Math.round((intencaoGanhos.entender_melhor / intencaoCounts.entender_melhor) * 100) : 0,
      pesquisando: intencaoCounts.pesquisando > 0 ? Math.round((intencaoGanhos.pesquisando / intencaoCounts.pesquisando) * 100) : 0,
    };

    // ── PERFORMANCE COMERCIAL: SLA ──
    const contatadosComSLA = leads.filter(l => l.primeiroContatoEm !== null);
    let totalSlaMinutos = 0;
    for (const l of contatadosComSLA) {
      const diff = new Date(l.primeiroContatoEm!).getTime() - new Date(l.criadoEm).getTime();
      totalSlaMinutos += Math.max(0, diff / 60000);
    }
    const slaMedioMinutos = contatadosComSLA.length > 0 ? Math.round(totalSlaMinutos / contatadosComSLA.length) : 0;

    // ── PERFORMANCE COMERCIAL: TEMPO NAS ETAPAS ──
    const tempoEtapas = {
      novo_lead: { somaMinutos: 0, count: 0 },
      em_contato: { somaMinutos: 0, count: 0 },
      negociando: { somaMinutos: 0, count: 0 },
    };

    // Para cada lead, calcular quanto tempo ele ficou em cada etapa
    for (const lead of leads) {
      const leadHist = historico.filter(h => h.simulacaoId === lead.id && h.acao === "mudou_status");
      
      let currentStage = "novo_lead";
      let entryTime = new Date(lead.criadoEm).getTime();

      for (const h of leadHist) {
        const exitTime = new Date(h.criadoEm).getTime();
        const diffMinutos = Math.max(0, (exitTime - entryTime) / 60000);

        if (currentStage in tempoEtapas) {
          const key = currentStage as keyof typeof tempoEtapas;
          tempoEtapas[key].somaMinutos += diffMinutos;
          tempoEtapas[key].count++;
        }

        currentStage = h.statusDepois || "novo_lead";
        entryTime = exitTime;
      }

      // Tempo no estado atual até hoje (se o lead não estiver finalizado e a data final for agora)
      const finalTime = Math.min(new Date().getTime(), endDate.getTime());
      if (lead.status !== "ganho" && lead.status !== "perdido") {
        const diffMinutos = Math.max(0, (finalTime - entryTime) / 60000);
        if (currentStage in tempoEtapas) {
          const key = currentStage as keyof typeof tempoEtapas;
          tempoEtapas[key].somaMinutos += diffMinutos;
          tempoEtapas[key].count++;
        }
      }
    }

    const tempoMedioEtapasHoras = {
      novo_lead: tempoEtapas.novo_lead.count > 0 ? parseFloat((tempoEtapas.novo_lead.somaMinutos / tempoEtapas.novo_lead.count / 60).toFixed(1)) : 0,
      em_contato: tempoEtapas.em_contato.count > 0 ? parseFloat((tempoEtapas.em_contato.somaMinutos / tempoEtapas.em_contato.count / 60).toFixed(1)) : 0,
      negociando: tempoEtapas.negociando.count > 0 ? parseFloat((tempoEtapas.negociando.somaMinutos / tempoEtapas.negociando.count / 60).toFixed(1)) : 0,
    };

    // ── PERFORMANCE COMERCIAL: TAXA DE DESCARTE POR VENDEDOR ──
    const descartePorAtendente = usuarios.map(u => {
      const leadsDono = leads.filter(l => l.responsavelId === u.id);
      const totalDono = leadsDono.length;
      const descartadosDono = leadsDono.filter(l => l.status === "perdido").length;
      return {
        id: u.id,
        nome: u.nome,
        total: totalDono,
        descartados: descartadosDono,
        taxaDescarte: totalDono > 0 ? Math.round((descartadosDono / totalDono) * 100) : 0,
      };
    }).filter(a => a.total > 0);

    // ── PERFORMANCE COMERCIAL: MOTIVOS DE DESCARTE ──
    const motivoCounts: Record<string, number> = {};
    for (const l of leads) {
      if (l.status === "perdido" && l.motivoDescarte) {
        motivoCounts[l.motivoDescarte] = (motivoCounts[l.motivoDescarte] ?? 0) + 1;
      }
    }
    const motivoDescarteArr = Object.entries(motivoCounts).map(([key, val]) => ({
      motivo: key,
      total: val,
    })).sort((a, b) => b.total - a.total);

    // ── ABANDONO DO SIMULADOR ──
    const abandonoPorEtapa = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    for (const a of abandonos) {
      const etapa = a.ultimaEtapa as keyof typeof abandonoPorEtapa;
      if (etapa in abandonoPorEtapa) {
        abandonoPorEtapa[etapa]++;
      }
    }

    const totalAbandonos = abandonos.length;
    const taxaConclusao = (totalLeads + totalAbandonos) > 0 ? Math.round((totalLeads / (totalLeads + totalAbandonos)) * 100) : 0;

    // ── CUSTOS ──
    const totalQualificados = intencaoCounts.contratar_agora;
    const totalGanhos = leads.filter(l => l.status === "ganho").length;

    const cpl = totalLeads > 0 ? parseFloat((adSpend / totalLeads).toFixed(2)) : 0;
    const cplq = totalQualificados > 0 ? parseFloat((adSpend / totalQualificados).toFixed(2)) : 0;
    const cac = totalGanhos > 0 ? parseFloat((adSpend / totalGanhos).toFixed(2)) : 0;

    return Response.json({
      adSpend,
      totalLeads,
      totalAbandonos,
      taxaConclusao,
      qualidade: {
        intencaoCounts,
        convPorIntencao,
        pctInvalidos,
      },
      performance: {
        slaMedioMinutos,
        tempoMedioEtapasHoras,
        descartePorAtendente,
        motivoDescarte: motivoDescarteArr,
      },
      abandono: {
        abandonoPorEtapa: Object.entries(abandonoPorEtapa).map(([k, v]) => ({ etapa: parseInt(k), total: v })),
      },
      custos: {
        cpl,
        cplq,
        cac,
        totalGanhos,
        totalQualificados,
      }
    });

  } catch (err) {
    console.error("Erro na API de Funil:", err);
    return Response.json({ error: "Erro interno ao processar dados de funil" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { adSpend } = await req.json();

    if (adSpend === undefined || isNaN(parseFloat(adSpend))) {
      return Response.json({ error: "Valor inválido" }, { status: 400 });
    }

    await prisma.configuracao.upsert({
      where: { chave: "investimento_anuncios" },
      create: { chave: "investimento_anuncios", valor: String(adSpend) },
      update: { valor: String(adSpend) },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Erro ao salvar configuração de investimento:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
