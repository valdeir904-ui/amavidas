import { verifySession } from "@/lib/session";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  const auth = req.headers.get("authorization");
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();

  const formatBRT = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const todayBRT = formatBRT(now);

  let fromStr = fromParam;
  let toStr = toParam;

  if (!fromStr && !toStr) {
    const [y, m, d] = todayBRT.split('-').map(Number);
    const endRef = new Date(y, m - 1, d);
    const startRef = new Date(endRef);
    startRef.setDate(startRef.getDate() - 6);
    fromStr = formatBRT(startRef);
    toStr = todayBRT;
  } else if (!fromStr) {
    fromStr = toStr;
  } else if (!toStr) {
    toStr = fromStr;
  }

  let startDate = new Date(`${fromStr}T00:00:00.000-03:00`);
  let endDate = new Date(`${toStr}T23:59:59.999-03:00`);

  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  const [ey, em, ed] = toStr!.split('-').map(Number);
  const endRef = new Date(ey, em - 1, ed);
  const startOfWeekRef = new Date(endRef);
  startOfWeekRef.setDate(startOfWeekRef.getDate() - 6);
  const startOfWeekStr = formatBRT(startOfWeekRef);
  const startOfWeek = new Date(`${startOfWeekStr}T00:00:00.000-03:00`);

  const [leads, eventos, planos, usuarios, leadsAtribuidos, investimentosMarketing] = await Promise.all([
    prisma.simulacao.findMany({
      where: { criadoEm: { gte: startDate, lte: endDate } },
      include: {
        historico: {
          orderBy: { criadoEm: "asc" },
          select: { acao: true, criadoEm: true, statusDepois: true }
        }
      },
      orderBy: { criadoEm: "asc" }
    }),
    prisma.evento.findMany({
      where: { criadoEm: { gte: startDate, lte: endDate } },
      orderBy: { criadoEm: "asc" },
    }),
    prisma.plano.findMany(),
    prisma.usuario.findMany({
      where: { ativo: true, perfil: "ATENDENTE" },
      select: { id: true, nome: true, email: true, perfil: true }
    }),
    prisma.simulacao.findMany({
      where: { responsavelId: { not: null } },
      include: {
        historico: {
          orderBy: { criadoEm: "desc" },
          select: { acao: true, usuarioId: true, criadoEm: true }
        }
      }
    }),
    prisma.investimentoMarketing.findMany({
      orderBy: { mesAno: "desc" }
    })
  ]);

  // Map plan prices
  const planoPrices = Object.fromEntries(planos.map((p) => [p.slug.toLowerCase(), p.preco]));
  const PLAN_FALLBACK_PRICES: Record<string, number> = {
    essencial: 49,
    familia: 99,
    premium: 149,
  };
  const getPrecoPlano = (slug: string) => {
    if (!slug) return 0;
    const s = slug.toLowerCase();
    return planoPrices[s] ?? PLAN_FALLBACK_PRICES[s] ?? 0;
  };

  // KPI cards
  const totalLeads = leads.length;
  const leadsThisWeek = leads.filter((l) => l.criadoEm >= startOfWeek).length;
  const contatados = leads.filter((l) => l.contatado).length;
  const taxaContato = totalLeads > 0 ? Math.round((contatados / totalLeads) * 100) : 0;
  const totalContratados = leads.filter((l) => l.status === "ganho").length;

  // Helper para calcular minutos no horário comercial (08:00 às 17:30)
  const calcularMinutosUteisComercial = (start: Date, end: Date) => {
    if (start >= end) return 0;

    let totalMinutos = 0;
    const curr = new Date(start);

    while (curr < end) {
      const windowStart = new Date(curr);
      windowStart.setHours(8, 0, 0, 0);

      const windowEnd = new Date(curr);
      windowEnd.setHours(17, 30, 0, 0);

      const overlapStart = new Date(Math.max(start.getTime(), windowStart.getTime()));
      const overlapEnd = new Date(Math.min(end.getTime(), windowEnd.getTime()));

      if (overlapStart < overlapEnd) {
        totalMinutos += Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 60000);
      }

      curr.setDate(curr.getDate() + 1);
      curr.setHours(0, 0, 0, 0);
    }

    return totalMinutos;
  };

  // SLA Calculation (Tempo médio útil de primeiro contato em minutos)
  const leadsComContato = leads.filter((l) => {
    if (l.primeiroContatoEm) return true;
    return l.historico.some((h) => h.acao === "primeiro_contato" || h.acao === "mudou_status");
  });

  let totalSlaMinutos = 0;
  let countSla = 0;

  for (const l of leadsComContato) {
    let dataContato = l.primeiroContatoEm;
    if (!dataContato) {
      const hContato = l.historico.find((h) => h.acao === "primeiro_contato" || h.statusDepois === "contatado");
      if (hContato) dataContato = hContato.criadoEm;
    }

    if (dataContato) {
      const mins = calcularMinutosUteisComercial(new Date(l.criadoEm), new Date(dataContato));
      totalSlaMinutos += mins;
      countSla++;
    }
  }

  const slaMedioMinutos = countSla > 0 ? Math.round(totalSlaMinutos / countSla) : 0;
  const formatSlaText = (mins: number) => {
    if (mins === 0) return "Sem dados";
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };
  const slaFormatado = formatSlaText(slaMedioMinutos);

  // Leads Parados (> 48h sem interação) e Agendamentos Futuros
  const leadsAtivos = leads.filter((l) => l.status !== "ganho" && l.status !== "perdido");
  const leadsParados48h = leadsAtivos.filter((l) => {
    const diffMs = now.getTime() - new Date(l.atualizadoEm || l.criadoEm).getTime();
    return diffMs >= 48 * 3600 * 1000;
  }).length;

  const leadsParados7dias = leadsAtivos.filter((l) => {
    const diffMs = now.getTime() - new Date(l.atualizadoEm || l.criadoEm).getTime();
    return diffMs >= 7 * 24 * 3600 * 1000;
  }).length;

  const agendamentosCount = leadsAtivos.filter((l) => l.proximoContatoEm && new Date(l.proximoContatoEm) >= now).length;

  // Breakdown de Motivos de Perda
  const MOTIVOS_MAP: Record<string, string> = {
    numero_errado: "Número incorreto / inexistente",
    nao_atende: "Não atendeu ligações",
    nao_respondeu: "Não respondeu mensagens",
    sem_interesse: "Sem interesse real",
    achou_caro: "Achou caro / sem orçamento",
    vai_pensar: "Vai pensar / avaliar depois",
    ja_tem_plano: "Já possui outro plano",
    fora_area: "Fora da área de cobertura",
    dado_invalido: "Dado inválido / fake",
    outro: "Outro motivo",
  };

  const motivosCounts: Record<string, number> = {};
  const leadsPerdidos = leads.filter((l) => l.status === "perdido");
  for (const l of leadsPerdidos) {
    const rawMotivo = l.motivoPerda || l.motivoDescarte || "outro";
    const label = MOTIVOS_MAP[rawMotivo] || rawMotivo;
    motivosCounts[label] = (motivosCounts[label] ?? 0) + 1;
  }
  const motivosPerdaArr = Object.entries(motivosCounts)
    .map(([motivo, total]) => ({
      motivo,
      total,
      percentual: leadsPerdidos.length > 0 ? Math.round((total / leadsPerdidos.length) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Dados da Agência (Investimentos e CPL)
  // Obter o mês de referência a partir da data de início do filtro
  const targetMesAno = (fromStr || todayBRT).slice(0, 7); // Formato "YYYY-MM"
  
  // Buscar o investimento cadastrado especificamente para o mês do filtro
  const invDoMes = investimentosMarketing.find((i) => i.mesAno === targetMesAno);

  const invLeadsEfetivo = invDoMes ? invDoMes.investimentoLeads : 0;
  const invBrandingEfetivo = invDoMes ? invDoMes.investimentoBranding : 0;
  const totalInvestimentoPeriodo = invLeadsEfetivo + invBrandingEfetivo;
  const observacoesAgencia = invDoMes ? (invDoMes.observacoes || "") : "";

  const cplLeads = totalLeads > 0 ? (invLeadsEfetivo / totalLeads) : 0;
  const cplTotal = totalLeads > 0 ? (totalInvestimentoPeriodo / totalLeads) : 0;
  const custoPorVenda = totalContratados > 0 ? (totalInvestimentoPeriodo / totalContratados) : 0;

  // Financial calculations
  const mrr = leads.filter((l) => l.status === "ganho").reduce((acc, l) => acc + getPrecoPlano(l.planoRecomendado), 0);
  const ticketMedio = totalContratados > 0 ? Math.round(mrr / totalContratados) : 0;
  const previsaoReceita = leads.filter((l) => l.status === "contatado").reduce((acc, l) => acc + getPrecoPlano(l.planoRecomendado), 0);
  const taxaConversaoGeral = totalLeads > 0 ? Math.round((totalContratados / totalLeads) * 100) : 0;

  const planoCounts = { essencial: 0, familia: 0, premium: 0 };
  for (const l of leads) {
    if (l.planoRecomendado in planoCounts) {
      planoCounts[l.planoRecomendado as keyof typeof planoCounts]++;
    }
  }
  const topPlano = Object.entries(planoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Leads por dia (dinâmico)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const leadsPorDia: Record<string, number> = {};
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(startDate.getTime() + i * 86400000);
    const key = formatBRT(d);
    leadsPorDia[key] = 0;
  }
  for (const l of leads) {
    const key = formatBRT(l.criadoEm);
    if (key in leadsPorDia) leadsPorDia[key]++;
  }
  const leadsPorDiaArr = Object.entries(leadsPorDia).map(([data, total]) => ({
    data: data.slice(5), // MM-DD
    total,
  }));

  // Eventos por dia
  const visitasPorDia: Record<string, number> = {};
  const simsPorDia: Record<string, number> = {};
  const whatsappPorDia: Record<string, number> = {};
  for (const key of Object.keys(leadsPorDia)) {
    visitasPorDia[key] = 0;
    simsPorDia[key] = 0;
    whatsappPorDia[key] = 0;
  }
  for (const e of eventos) {
    const key = formatBRT(e.criadoEm);
    if (!(key in visitasPorDia)) continue;
    if (e.tipo === "visita") visitasPorDia[key]++;
    if (e.tipo === "simulacao_iniciada") simsPorDia[key]++;
    if (e.tipo === "whatsapp_clicado") whatsappPorDia[key]++;
  }

  // Totais de eventos
  const totalVisitas = eventos.filter((e) => e.tipo === "visita").length;
  const totalSims = eventos.filter((e) => e.tipo === "simulacao_iniciada").length;
  const totalWhatsapp = eventos.filter((e) => e.tipo === "whatsapp_clicado").length;
  const totalObito = eventos.filter((e) => e.tipo === "clique_obito").length;
  const totalIniciouScroll = eventos.filter((e) => e.tipo === "iniciou_scroll").length;
  const totalChegouFim = eventos.filter((e) => e.tipo === "chegou_ao_fim").length;

  // Perfil dos leads
  const faixaEtaria: Record<string, number> = {};
  const orcamento: Record<string, number> = {};
  const prioridade: Record<string, number> = {};
  const paraQuem: Record<string, number> = { individual: 0, familia: 0 };

  for (const l of leads) {
    faixaEtaria[l.faixaEtaria] = (faixaEtaria[l.faixaEtaria] ?? 0) + 1;
    orcamento[l.orcamento] = (orcamento[l.orcamento] ?? 0) + 1;
    prioridade[l.prioridade] = (prioridade[l.prioridade] ?? 0) + 1;
    if (l.paraQuem === "familia") paraQuem.familia++;
    else paraQuem.individual++;
  }

  // Cálculo da Performance e Tempo com cada Atendente
  const formatDuration = (start: Date, end: Date) => {
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const minutes = Math.floor(diffMs / (1000 * 60));
    
    if (minutes < 1) return { minutes, text: "Agora mesmo" };
    if (minutes < 60) return { minutes, text: `${minutes} min` };
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) {
      return {
        minutes,
        text: remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
      };
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return {
      minutes,
      text: remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
    };
  };

  const atendentesPerformance = usuarios.map((u) => {
    const userLeads = leadsAtribuidos.filter((l) => l.responsavelId === u.id);
    
    const leadsPorStatus = {
      novo_lead: 0,
      contatado: 0,
      negociando: 0,
      follow_up: 0,
      fechamento: 0,
      ganho: 0,
      perdido: 0,
    };

    const formattedLeads = userLeads.map((l) => {
      if (l.status in leadsPorStatus) {
        leadsPorStatus[l.status as keyof typeof leadsPorStatus]++;
      }

      const atribLog = l.historico.find(
        (h) => h.acao === "atribuiu" && h.usuarioId === u.id
      ) || l.historico.find((h) => h.acao === "atribuiu");

      const atribuidoEm = atribLog ? atribLog.criadoEm : (l.atualizadoEm || l.criadoEm);
      const { minutes, text } = formatDuration(new Date(atribuidoEm), now);
      const isParadoMais7Dias = l.status !== "ganho" && l.status !== "perdido" && minutes >= 10080;

      return {
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        status: l.status,
        planoRecomendado: l.planoRecomendado,
        cidade: l.cidade,
        criadoEm: l.criadoEm,
        atribuidoEm,
        tempoMinutos: minutes,
        tempoFormatado: text,
        isParadoMais7Dias,
      };
    });

    formattedLeads.sort((a, b) => b.tempoMinutos - a.tempoMinutos);

    const leadsParadosCount = formattedLeads.filter((l) => l.isParadoMais7Dias).length;

    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      totalLeads: userLeads.length,
      leadsParadosCount,
      leadsPorStatus,
      leads: formattedLeads,
    };
  });

  atendentesPerformance.sort((a, b) => b.totalLeads - a.totalLeads);

  return Response.json({
    kpi: {
      totalLeads,
      leadsThisWeek,
      taxaContato,
      topPlano,
      contatados,
      totalVisitas,
      totalSims,
      totalWhatsapp,
      totalObito,
      totalIniciouScroll,
      totalChegouFim,
      totalContratados,
      mrr,
      ticketMedio,
      previsaoReceita,
      taxaConversaoGeral,
      // Novas métricas ricas
      slaMedioMinutos,
      slaFormatado,
      leadsParados48h,
      leadsParados7dias,
      agendamentosCount,
    },
    agencia: {
      mesAno: targetMesAno,
      investimentoLeads: invLeadsEfetivo,
      investimentoBranding: invBrandingEfetivo,
      investimentoTotal: totalInvestimentoPeriodo,
      observacoes: observacoesAgencia,
      cplLeads,
      cplTotal,
      custoPorVenda,
      investimentosHistorico: investimentosMarketing,
    },
    motivosPerda: motivosPerdaArr,
    planoCounts,
    leadsPorDia: leadsPorDiaArr,
    faixaEtaria: Object.entries(faixaEtaria).map(([k, v]) => ({ faixa: k, total: v })),
    orcamento: Object.entries(orcamento).map(([k, v]) => ({ faixa: k, total: v })),
    prioridade: Object.entries(prioridade).map(([k, v]) => ({ tipo: k, total: v })),
    paraQuem: [
      { tipo: "Individual", total: paraQuem.individual },
      { tipo: "Família", total: paraQuem.familia },
    ],
    statusContato: [
      { status: "Contatados", total: contatados },
      { status: "Pendentes", total: totalLeads - contatados },
    ],
    atendentesPerformance,
  });
}

