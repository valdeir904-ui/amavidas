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
  
  let startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 6);
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

  const startOfWeek = new Date(endDate);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const [leads, eventos, planos, usuarios, leadsAtribuidos] = await Promise.all([
    prisma.simulacao.findMany({
      where: { criadoEm: { gte: startDate, lte: endDate } },
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
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(d.getUTCDate()).padStart(2, '0');
    const key = `${d.getUTCFullYear()}-${mes}-${dia}`;
    
    leadsPorDia[key] = 0;
  }
  for (const l of leads) {
    const key = l.criadoEm.toISOString().slice(0, 10);
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
    const key = e.criadoEm.toISOString().slice(0, 10);
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
      proposta_enviada: 0,
      negociando: 0,
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
    },
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
