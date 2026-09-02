"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { 
  Users, Calendar, CheckCircle2, Award, RefreshCw, TrendingUp,
  DollarSign, Percent, Briefcase, MousePointerClick, BarChart3,
  Clock, ChevronDown, ChevronUp, FileText, Megaphone, AlertTriangle,
  CalendarCheck, Edit3, Printer, Target, PieChart as PieChartIcon
} from "lucide-react";
import ModalInvestimentoAgencia from "@/components/admin/ModalInvestimentoAgencia";
import RelatorioAgenciaModal from "@/components/admin/RelatorioAgenciaModal";

const PLAN_COLORS: Record<string, string> = {
  essencial: "#00B4C8", // Teal
  familia: "#2B3DA8",   // Royal Blue
  premium: "#111827",   // Zinc 900 for premium
};

const PRIORIDADE_LABEL: Record<string, string> = {
  preco: "Preço acessível",
  cobertura: "Cobertura completa",
  servicos: "Serviços diferenciados",
};

const ORCAMENTO_LABEL: Record<string, string> = {
  "ate-49": "Até R$49",
  "50-99": "R$50–99",
  "100-199": "R$100–199",
  "200+": "R$200+",
};

const TOP_PLANO_LABEL: Record<string, string> = {
  essencial: "Essencial",
  familia: "Família",
  premium: "Premium",
};

export interface AtendentePerformance {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  totalLeads: number;
  leadsParadosCount?: number;
  leadsPorStatus: {
    novo_lead: number;
    contatado: number;
    negociando: number;
    follow_up?: number;
    fechamento?: number;
    ganho: number;
    perdido: number;
  };
  leads: {
    id: string;
    nome: string;
    telefone: string;
    status: string;
    planoRecomendado: string;
    cidade?: string;
    criadoEm: string;
    atribuidoEm: string;
    tempoMinutos: number;
    tempoFormatado: string;
    isParadoMais7Dias?: boolean;
  }[];
}

interface DashData {
  kpi: {
    totalLeads: number;
    leadsThisWeek: number;
    taxaContato: number;
    topPlano: string;
    contatados: number;
    totalVisitas: number;
    totalSims: number;
    totalWhatsapp: number;
    totalObito: number;
    totalIniciouScroll: number;
    totalChegouFim: number;
    totalContratados: number;
    mrr: number;
    ticketMedio: number;
    previsaoReceita: number;
    taxaConversaoGeral: number;
    slaMedioMinutos?: number;
    slaFormatado?: string;
    leadsParados48h?: number;
    leadsParados7dias?: number;
    agendamentosCount?: number;
  };
  agencia?: {
    mesAno: string;
    investimentoLeads: number;
    investimentoBranding: number;
    investimentoTotal: number;
    observacoes: string;
    cplLeads: number;
    cplTotal: number;
    custoPorVenda: number;
    investimentosHistorico?: any[];
  };
  motivosPerda?: { motivo: string; total: number; percentual: number }[];
  planoCounts: Record<string, number>;
  leadsPorDia: { data: string; total: number }[];
  faixaEtaria: { faixa: string; total: number }[];
  orcamento: { faixa: string; total: number }[];
  prioridade: { tipo: string; total: number }[];
  paraQuem: { tipo: string; total: number }[];
  statusContato: { status: string; total: number }[];
  atendentesPerformance?: AtendentePerformance[];
}

function KpiCard({
  label,
  value,
  sub,
  icon: IconComponent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0px_8px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-900">
          <IconComponent className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
      </div>
      <div className="mt-auto">
        <p className="text-3xl font-semibold tracking-tighter text-zinc-900">{value}</p>
        {sub && (
          <p className="text-sm font-medium text-zinc-500 mt-2 tracking-tight">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 mt-2">
      <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ 
  title, 
  children, 
  className = "", 
}: { 
  title: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] ${className}`}>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h3>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 p-4 rounded-xl shadow-xl border border-zinc-800 text-white">
        <p className="text-[11px] uppercase font-semibold tracking-widest text-zinc-400 mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mt-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.payload.color || "#00B4C8" }} />
            <span className="text-sm font-medium text-zinc-300">{item.name}:</span>
            <span className="text-sm font-semibold text-white ml-auto">
              {typeof item.value === "number" && (item.name.toLowerCase().includes("mrr") || item.name.toLowerCase().includes("receita") || item.name.toLowerCase().includes("ticket"))
                ? `R$ ${item.value.toLocaleString("pt-BR")}`
                : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function AtendentesPerformanceSection({
  atendentes,
}: {
  atendentes: AtendentePerformance[];
}) {
  const [expandedAtendentes, setExpandedAtendentes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedAtendentes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "novo_lead":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">⏳ Novo Lead</span>;
      case "contatado":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">📞 Em Contato</span>;
      case "negociando":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">💬 Negociando</span>;
      case "ganho":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">🤝 Ganho</span>;
      case "perdido":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">❌ Perdido</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getTimeBadge = (minutes: number, text: string) => {
    if (minutes < 120) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Atribuído recentemente (menos de 2h)">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          {text} com atendente
        </span>
      );
    } else if (minutes < 1440) { // < 24h
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Com atendente entre 2h e 24h">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {text} com atendente
        </span>
      );
    } else { // > 24h
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse" title="Mais de 24h com atendente">
          <Clock className="w-3.5 h-3.5 text-red-600" />
          {text} com atendente
        </span>
      );
    }
  };

  return (
    <section className="mt-8">
      <SectionTitle 
        title="Gestão de Atendentes & Tempo por Lead" 
        subtitle="Quantidade de leads atribuídos e tempo de permanência com cada atendente (Visão Master)." 
      />

      <div className="grid grid-cols-1 gap-5">
        {atendentes.map((atendente) => {
          const isExpanded = !!expandedAtendentes[atendente.id];
          return (
            <div 
              key={atendente.id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] overflow-hidden transition-all"
            >
              {/* Header do Atendente */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                    {atendente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-900 tracking-tight">{atendente.nome}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {atendente.perfil}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{atendente.email}</p>
                  </div>
                </div>

                {/* Métricas e Botão de Expandir */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl">
                    <Users className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-bold text-zinc-800">
                      Total: <span className="text-zinc-900 text-sm font-black">{atendente.totalLeads}</span> lead(s)
                    </span>
                  </div>

                  {(atendente.leadsParadosCount ?? 0) > 0 && (
                    <span className="px-3 py-1.5 bg-red-500 text-white font-black text-xs rounded-xl shadow-sm animate-pulse flex items-center gap-1">
                      🚨 {atendente.leadsParadosCount} parado(s) &gt; 7 dias
                    </span>
                  )}

                  {/* Badges de Status */}
                  <div className="hidden xl:flex items-center gap-1.5 text-xs">
                    {atendente.leadsPorStatus.novo_lead > 0 && (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold">
                        ⏳ {atendente.leadsPorStatus.novo_lead} novo(s)
                      </span>
                    )}
                    {atendente.leadsPorStatus.contatado > 0 && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold">
                        📞 {atendente.leadsPorStatus.contatado} contato
                      </span>
                    )}
                    {atendente.leadsPorStatus.negociando > 0 && (
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold">
                        💬 {atendente.leadsPorStatus.negociando} negoc.
                      </span>
                    )}
                    {(atendente.leadsPorStatus.follow_up ?? 0) > 0 && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold">
                        🔔 {atendente.leadsPorStatus.follow_up} follow-up
                      </span>
                    )}
                    {(atendente.leadsPorStatus.fechamento ?? 0) > 0 && (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold">
                        ✍️ {atendente.leadsPorStatus.fechamento} fecham.
                      </span>
                    )}
                    {atendente.leadsPorStatus.ganho > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">
                        🤝 {atendente.leadsPorStatus.ganho} ganho(s)
                      </span>
                    )}
                    {atendente.leadsPorStatus.perdido > 0 && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-bold">
                        ❌ {atendente.leadsPorStatus.perdido} perd.
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(atendente.id)}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer ml-auto"
                  >
                    <span>{isExpanded ? "Ocultar Leads" : `Ver Leads (${atendente.totalLeads})`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Lista Detalhada de Leads */}
              {isExpanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-6">
                  {atendente.leads.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic text-center py-4">Nenhum lead atribuído a este atendente.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {atendente.leads.map((lead) => (
                        <div 
                          key={lead.id} 
                          className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 ${
                            lead.isParadoMais7Dias || lead.tempoMinutos >= 10080
                              ? "bg-red-50/40 border-2 border-red-500/80 shadow-red-100"
                              : "bg-white border border-zinc-200/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h4 className="font-bold text-zinc-900 text-sm truncate flex items-center gap-1.5" title={lead.nome}>
                                {(lead.isParadoMais7Dias || lead.tempoMinutos >= 10080) && (
                                  <span className="text-red-600 font-extrabold animate-pulse" title="Lead parado a mais de 7 dias">🚨</span>
                                )}
                                <span className="truncate">{lead.nome}</span>
                              </h4>
                              {getStatusBadge(lead.status)}
                            </div>

                            <p className="text-xs text-zinc-600 flex items-center gap-1.5 font-medium">
                              📞 {lead.telefone}
                            </p>
                            {lead.cidade && (
                              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                📍 {lead.cidade}
                              </p>
                            )}
                            <p className="text-[11px] text-zinc-400 mt-1">
                              Plano: <span className="font-semibold text-zinc-700 capitalize">{lead.planoRecomendado}</span>
                            </p>
                          </div>

                          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                            {getTimeBadge(lead.tempoMinutos, lead.tempoFormatado)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; perfil: string } | null>(null);
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isAgenciaModalOpen, setIsAgenciaModalOpen] = useState(false);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const resp = await fetch("/api/admin/me");
        if (resp.ok) {
          const d = await resp.json();
          setCurrentUser(d.user);
        }
      } catch (e) {}
    };
    fetchMe();
  }, []);
  
  const [periodo, setPeriodo] = useState("7dias");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      let url = "/api/dashboard";
      let from = "";
      let to = "";
      const now = new Date();
      
      const getLocalDateStr = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      if (periodo === "hoje") {
        from = getLocalDateStr(now);
        to = from;
      } else if (periodo === "ontem") {
        const ontem = new Date(now);
        ontem.setDate(now.getDate() - 1);
        from = getLocalDateStr(ontem);
        to = from;
      } else if (periodo === "7dias") {
        const d = new Date(now);
        d.setDate(now.getDate() - 6);
        from = getLocalDateStr(d);
        to = getLocalDateStr(now);
      } else if (periodo === "30dias") {
        const d = new Date(now);
        d.setDate(now.getDate() - 29);
        from = getLocalDateStr(d);
        to = getLocalDateStr(now);
      } else if (periodo === "mes_atual") {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        from = getLocalDateStr(firstDay);
        to = getLocalDateStr(lastDay);
      } else if (periodo === "mes_passado") {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        from = getLocalDateStr(firstDay);
        to = getLocalDateStr(lastDay);
      } else if (periodo === "selecionar_mes" && mesSelecionado) {
        const [y, m] = mesSelecionado.split("-").map(Number);
        const firstDay = new Date(y, m - 1, 1);
        const lastDay = new Date(y, m, 0);
        from = getLocalDateStr(firstDay);
        to = getLocalDateStr(lastDay);
      } else if (periodo === "personalizado" && dataInicio && dataFim) {
        from = dataInicio;
        to = dataFim;
      }

      if (from && to) {
        url += `?from=${from}&to=${to}`;
      }

      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Erro");
      setData(await resp.json());
    } catch {
      setErro("Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }, [periodo, dataInicio, dataFim]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <main className="flex-1 p-6 lg:p-10 flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Sincronizando...</p>
        </div>
      </main>
    );
  }

  if (erro || !data) {
    return (
      <main className="flex-1 p-6 lg:p-10 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-sm shadow-xl">
          <p className="text-red-600 text-sm font-medium">{erro || "Não foi possível carregar os dados"}</p>
          <button onClick={fetchData} className="mt-6 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all">
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  const { kpi, planoCounts, leadsPorDia, faixaEtaria, orcamento, prioridade, paraQuem, statusContato } = data;

  const totalLeads = kpi.totalLeads;
  const planosArr = Object.entries(planoCounts).map(([name, value]) => ({
    name: TOP_PLANO_LABEL[name] ?? name,
    value,
    color: PLAN_COLORS[name] ?? "#d4d4d8",
  }));

  const orcamentoArr = orcamento.map((o) => ({
    faixa: ORCAMENTO_LABEL[o.faixa] ?? o.faixa,
    total: o.total,
  }));

  const prioridadeArr = prioridade.map((p) => ({
    tipo: PRIORIDADE_LABEL[p.tipo] ?? p.tipo,
    total: p.total,
  }));

  const visitas = kpi.totalVisitas || 0;
  const sims = kpi.totalSims || 0;
  const whatsapp = kpi.totalWhatsapp || 0;
  const contratados = kpi.totalContratados || 0;
  
  const convSims = visitas > 0 ? Math.round((sims / visitas) * 100) : 0;
  const convWhats = sims > 0 ? Math.round((whatsapp / sims) * 100) : 0;
  const convGanhos = whatsapp > 0 ? Math.round((contratados / whatsapp) * 100) : 0;
  const convTotal = visitas > 0 ? Math.round((contratados / visitas) * 100) : 0;

  const totalParaQuem = paraQuem.reduce((acc, p) => acc + p.total, 0) || 1;
  const individualTotal = paraQuem.find((p) => p.tipo === "Individual" || p.tipo === "individual")?.total || 0;
  const familiaTotal = paraQuem.find((p) => p.tipo === "Família" || p.tipo === "familia" || p.tipo === "Famila")?.total || 0;
  const individualPct = Math.round((individualTotal / totalParaQuem) * 100);
  const familiaPct = 100 - individualPct;

  return (
    <main className="flex-1 p-6 lg:p-10 bg-[#FAFAFA] min-h-screen font-sans selection:bg-zinc-200">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 lg:pl-0 pl-12">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Métricas financeiras e de conversão em tempo real.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto flex-wrap">
          {(currentUser?.perfil === "AGENCIA" || currentUser?.perfil === "MASTER") && (
            <button
              onClick={() => setIsAgenciaModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md text-xs font-bold cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              Lançar Anúncios (Agência)
            </button>
          )}

          <button
            onClick={() => setIsRelatorioModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 transition-all shadow-sm text-xs font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            Relatório da Agência (PDF)
          </button>

          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 cursor-pointer"
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="mes_atual">Mês Atual</option>
            <option value="mes_passado">Mês Passado</option>
            <option value="selecionar_mes">Selecionar Mês...</option>
            <option value="personalizado">Personalizado</option>
          </select>

          {periodo === "selecionar_mes" && (
            <input 
              type="month" 
              value={mesSelecionado} 
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
            />
          )}

          {periodo === "personalizado" && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
              <span className="text-zinc-400 text-xs">até</span>
              <input 
                type="date" 
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
            </div>
          )}

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-sm text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
        </div>
      </div>

      <div className="space-y-12 max-w-[1600px] mx-auto">
        
        {/* SEÇÃO 1: GERENCIADOR DE ANÚNCIOS & TRÁFEGO PAGO (MENSAL DA AGÊNCIA) */}
        <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white p-8 rounded-3xl shadow-xl border border-zinc-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Gerenciador de Anúncios da Agência
                </span>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                  Ref: {
                    (() => {
                      const m = data.agencia?.mesAno || "2026-09";
                      const [y, mm] = m.split("-");
                      const mName = new Date(parseInt(y), parseInt(mm) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                      if (periodo === "7dias") return `Últimos 7 dias (${mName})`;
                      if (periodo === "30dias") return `Últimos 30 dias (${mName})`;
                      if (periodo === "hoje") return `Hoje (${mName})`;
                      if (periodo === "ontem") return `Ontem (${mName})`;
                      if (periodo === "mes_atual") return `Mês Atual (${mName})`;
                      if (periodo === "mes_passado") return `Mês Passado (${mName})`;
                      if (periodo === "selecionar_mes") return `Mês de ${mName}`;
                      return `Período (${mName})`;
                    })()
                  }
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Performance dos Investimentos em Tráfego</h2>
            </div>
            {(currentUser?.perfil === "AGENCIA" || currentUser?.perfil === "MASTER") && (
              <button
                onClick={() => setIsAgenciaModalOpen(true)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer self-start md:self-auto"
              >
                <Edit3 className="w-4 h-4" />
                Lançar / Editar Anúncios do Mês
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card Campanha 1: Geração de Leads */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                🚀 Geração de Leads
              </p>
              <p className="text-2xl font-black text-white">
                R$ {(data.agencia?.investimentoLeads || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-zinc-400 mt-2 flex justify-between">
                <span>CPL Efetivo:</span>
                <strong className="text-teal-300">R$ {(data.agencia?.cplLeads || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>

            {/* Card Campanha 2: Fortalecimento da Marca */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                ✨ Fortalecimento da Marca
              </p>
              <p className="text-2xl font-black text-white">
                R$ {(data.agencia?.investimentoBranding || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                Tráfego direcionado para visitar o Instagram
              </p>
            </div>

            {/* Total Investido */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                💰 Investimento Total
              </p>
              <p className="text-2xl font-black text-white">
                R$ {(data.agencia?.investimentoTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-zinc-400 mt-2 flex justify-between">
                <span>CPL Global:</span>
                <strong className="text-amber-300">R$ {(data.agencia?.cplTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>

            {/* CAC / Custo por Venda */}
            <div className="bg-gradient-to-br from-teal-600/30 to-emerald-600/30 border border-teal-500/30 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                🏆 Custo por Contrato Fechado
              </p>
              <p className="text-2xl font-black text-white">
                R$ {(data.agencia?.custoPorVenda || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-emerald-200 mt-2">
                Investimento necessário por venda realizada
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: OPERACIONAL COMERCIAL, SLA & LEADS PARADOS */}
        <section>
          <SectionTitle title="Eficiência Comercial e SLA de Atendimento" subtitle="Controle do tempo de resposta comercial e leads com ação pendente." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SLA Médio */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-100 flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4" />
                  SLA de Resposta
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  (kpi.slaMedioMinutos || 0) <= 30
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : (kpi.slaMedioMinutos || 0) <= 120
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}>
                  {(kpi.slaMedioMinutos || 0) <= 30 ? "⚡ Ótimo" : (kpi.slaMedioMinutos || 0) <= 120 ? "⚠️ Atenção" : "🚨 Crítico"}
                </span>
              </div>
              <div>
                <p className="text-4xl font-black text-zinc-900 tracking-tight">{kpi.slaFormatado || "0 min"}</p>
                <p className="text-xs text-zinc-500 font-medium mt-2">
                  Tempo médio entre o recebimento do lead e o primeiro contato comercial.
                </p>
              </div>
            </div>

            {/* Leads Parados */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-red-50 text-red-700 font-bold border border-red-100 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  Leads Parados
                </span>
                {(kpi.leadsParados48h || 0) > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500 text-white animate-pulse">
                    Ação Necessária
                  </span>
                )}
              </div>
              <div>
                <p className="text-4xl font-black text-red-600 tracking-tight">{kpi.leadsParados48h || 0}</p>
                <p className="text-xs text-zinc-500 font-medium mt-2">
                  Leads no funil ativo sem qualquer atualização há mais de 48 horas.
                </p>
              </div>
            </div>

            {/* Agendamentos Pendentes */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-100 flex items-center gap-1.5 text-xs">
                  <CalendarCheck className="w-4 h-4" />
                  Follow-ups Programados
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Próximos Contatos
                </span>
              </div>
              <div>
                <p className="text-4xl font-black text-amber-600 tracking-tight">{kpi.agendamentosCount || 0}</p>
                <p className="text-xs text-zinc-500 font-medium mt-2">
                  Leads com data e horário definidos para novo contato comercial.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SEÇÃO 3: ANÁLISE DE MOTIVOS DE PERDA (BREAKDOWN DE DESCARTE) */}
        {data.motivosPerda && data.motivosPerda.length > 0 && (
          <section className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm">
            <SectionTitle
              title="Análise de Motivos de Perda"
              subtitle="Principais objeções e razões informadas no descarte de oportunidades."
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                {data.motivosPerda.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-zinc-800">
                      <span>{item.motivo}</span>
                      <span className="text-zinc-500">{item.total} lead(s) ({item.percentual}%)</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-zinc-900 h-full rounded-full transition-all"
                        style={{ width: `${Math.max(5, item.percentual)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 bg-zinc-50 p-6 rounded-2xl border border-zinc-200/80 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-zinc-900 font-bold text-sm">
                  <PieChartIcon className="w-4 h-4 text-teal-600" />
                  <span>Insight Comercial</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  {data.motivosPerda[0]
                    ? `A principal causa de descarte no período é "${data.motivosPerda[0].motivo}", representando ${data.motivosPerda[0].percentual}% de todas as oportunidades perdidas.`
                    : "Analise as objeções para ajustar a abordagem de vendas e scripts de atendimento."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* MARKETING ROW (NEW HERO METRICS) */}
        <section>
          <SectionTitle title="Captação e Engajamento" subtitle="Métricas principais de atração e geração de contatos." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#00B4C8] to-[#008ba3] rounded-3xl p-8 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Users className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-100 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
                  Contatos via WhatsApp
                </p>
                <p className="text-6xl font-bold tracking-tighter mb-4">{whatsapp.toLocaleString()}</p>
                <p className="text-sm font-medium text-teal-50">Total de cliques diretos para atendimento</p>
              </div>
            </div>
            
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-[0px_8px_24px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <MousePointerClick className="w-24 h-24 text-zinc-900" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Simulações Iniciadas</p>
                <p className="text-6xl font-bold tracking-tighter text-zinc-900 mb-4">{sims.toLocaleString()}</p>
                <p className="text-sm font-medium text-zinc-500">Pessoas que começaram a simulação</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 text-white shadow-xl shadow-black/10 relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <CheckCircle2 className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Leads Gerados</p>
                <p className="text-6xl font-bold tracking-tighter mb-4">{totalLeads.toLocaleString()}</p>
                <p className="text-sm font-medium text-zinc-400">Simulações concluídas (oportunidades)</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINANCIAL ROW */}
        <section>
          <SectionTitle title="Receita e Conversão" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              label="MRR Atual"
              value={`R$ ${kpi.mrr?.toLocaleString("pt-BR") || 0}`}
              icon={DollarSign}
              sub="Receita recorrente ganha"
            />
            <KpiCard
              label="Ticket Médio"
              value={`R$ ${kpi.ticketMedio?.toLocaleString("pt-BR") || 0}`}
              icon={TrendingUp}
              sub="Valor médio por contrato"
            />
            <KpiCard
              label="Pipeline Ativo"
              value={`R$ ${kpi.previsaoReceita?.toLocaleString("pt-BR") || 0}`}
              icon={Briefcase}
              sub="Potencial em negociação"
            />
            <KpiCard
              label="Conversão Global"
              value={`${kpi.taxaConversaoGeral || 0}%`}
              icon={Percent}
              sub="Leads para contratos"
            />
          </div>
        </section>

        {/* ATENDENTES & TEMPO DOS LEADS (EXCLUSIVO MASTER) */}
        {(currentUser?.perfil === "MASTER" || !currentUser) && data.atendentesPerformance && data.atendentesPerformance.length > 0 && (
          <AtendentesPerformanceSection atendentes={data.atendentesPerformance} />
        )}

        {/* FUNNEL BENTO GRID */}
        <section>
          <SectionTitle title="Funil de Aquisição" subtitle="Evolução do usuário da visita inicial até a assinatura do contrato." />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Graphic Funnel */}
            <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-[0px_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center h-full">
                
                <div className="flex-1 w-full relative">
                  <div className="absolute top-0 left-6 bottom-0 w-[2px] bg-zinc-100 z-0 hidden md:block" />
                  
                  <div className="space-y-8 relative z-10">
                    {/* Step 1 */}
                    <div className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 transition-colors group-hover:border-zinc-300">
                        <MousePointerClick className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Acessos à Página</p>
                          <p className="text-[13px] text-zinc-500 font-medium">Tráfego único</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold tracking-tighter text-zinc-900">{visitas.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-center shrink-0 transition-colors group-hover:border-blue-200">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Simulações</p>
                          <p className="text-[13px] text-zinc-500 font-medium">Leads capturados</p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{convSims}% conv.</span>
                          <p className="text-xl font-semibold tracking-tighter text-zinc-900">{sims.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-center shrink-0 transition-colors group-hover:border-teal-200">
                        <Users className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Contatos</p>
                          <p className="text-[13px] text-zinc-500 font-medium">Acionamento de equipe</p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{convWhats}% conv.</span>
                          <p className="text-xl font-semibold tracking-tighter text-zinc-900">{whatsapp.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 transition-colors group-hover:bg-black">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Contratos</p>
                          <p className="text-[13px] text-zinc-500 font-medium">Vendas fechadas</p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <span className="text-[11px] font-semibold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">{convGanhos}% conv.</span>
                          <p className="text-xl font-semibold tracking-tighter text-zinc-900">{contratados.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Right: Operations metrics */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 flex-1 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-center">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Volume Operacional</p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-zinc-900">Total de Leads Base</span>
                      <span className="text-lg font-semibold tracking-tighter text-zinc-900">{kpi.totalLeads}</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-zinc-900 h-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-zinc-900">Leads Esta Semana</span>
                      <span className="text-lg font-semibold tracking-tighter text-zinc-900">{kpi.leadsThisWeek}</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${Math.min((kpi.leadsThisWeek / (kpi.totalLeads || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-zinc-900">Plano Destaque</span>
                      <span className="text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">{TOP_PLANO_LABEL[kpi.topPlano] ?? kpi.topPlano}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-zinc-900">Plantão / Óbito</span>
                      <span className="text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">{kpi.totalObito}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-zinc-900">Engajamento da Página</span>
                      <span className="text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md text-right">
                        {kpi.totalIniciouScroll} rolaram <br/> 
                        <span className="text-xs text-zinc-500 font-medium">({kpi.totalIniciouScroll > 0 ? Math.round((kpi.totalChegouFim / kpi.totalIniciouScroll) * 100) : 0}% chegaram ao fim)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CHARTS GRID */}
        <section>
          <SectionTitle title="Análise Detalhada" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <ChartCard title="Crescimento de Leads (30 dias)">
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leadsPorDia} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis
                      dataKey="data"
                      tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      dy={12}
                      interval={isMobile ? 5 : 3}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 500 }} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="total" name="Leads" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Distribuição de Planos">
              <div className="h-[280px] w-full flex items-center justify-center relative mt-4">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-semibold tracking-tighter text-zinc-900">{totalLeads}</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">Total Leads</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planosArr}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {planosArr.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      verticalAlign="bottom"
                      formatter={(value) => <span className="text-xs font-medium text-zinc-600 ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ChartCard title="Demografia Etária">
              <div className="h-[200px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faixaEtaria} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="faixa" tick={{ fontSize: 11, fill: "#71717a", fontWeight: 500 }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                    <Bar dataKey="total" name="Leads" fill="#00B4C8" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Orçamento Mensal">
              <div className="h-[200px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orcamentoArr} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="faixa" tick={{ fontSize: 11, fill: "#71717a", fontWeight: 500 }} tickLine={false} axisLine={false} width={75} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                    <Bar dataKey="total" name="Leads" fill="#2B3DA8" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Tipo de Proteção">
              <div className="flex flex-col justify-center h-[200px] mt-2">
                <div className="space-y-6 w-full">
                  <div className="h-4 w-full rounded-full bg-zinc-100 overflow-hidden flex border border-zinc-200/50">
                    <div style={{ width: `${individualPct}%` }} className="bg-zinc-900 transition-all duration-500" />
                    <div style={{ width: `${familiaPct}%` }} className="bg-zinc-300 transition-all duration-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-zinc-900" />
                        <span className="font-medium text-zinc-700">Individual</span>
                      </div>
                      <span className="font-semibold text-zinc-900">{individualPct}% <span className="text-zinc-400 font-normal ml-1">({individualTotal})</span></span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-zinc-300" />
                        <span className="font-medium text-zinc-700">Familiar</span>
                      </div>
                      <span className="font-semibold text-zinc-900">{familiaPct}% <span className="text-zinc-400 font-normal ml-1">({familiaTotal})</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </section>

      </div>

      {/* Modais da Agência */}
      <ModalInvestimentoAgencia
        isOpen={isAgenciaModalOpen}
        onClose={() => setIsAgenciaModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        currentMesAno={data?.agencia?.mesAno}
        initialInvestimentoLeads={data?.agencia?.investimentoLeads || 0}
        initialInvestimentoBranding={data?.agencia?.investimentoBranding || 0}
        initialObservacoes={data?.agencia?.observacoes || ""}
      />

      {data?.agencia && (
        <RelatorioAgenciaModal
          isOpen={isRelatorioModalOpen}
          onClose={() => setIsRelatorioModalOpen(false)}
          agenciaData={{
            mesAno: data.agencia.mesAno,
            investimentoLeads: data.agencia.investimentoLeads,
            investimentoBranding: data.agencia.investimentoBranding,
            investimentoTotal: data.agencia.investimentoTotal,
            observacoes: data.agencia.observacoes,
            cplLeads: data.agencia.cplLeads,
            cplTotal: data.agencia.cplTotal,
            custoPorVenda: data.agencia.custoPorVenda,
          }}
          kpiData={{
            totalLeads: kpi.totalLeads,
            leadsThisWeek: kpi.leadsThisWeek || 0,
            totalContratados: kpi.totalContratados,
            mrr: kpi.mrr,
            ticketMedio: kpi.ticketMedio || 0,
            previsaoReceita: kpi.previsaoReceita || 0,
            taxaConversaoGeral: kpi.taxaConversaoGeral,
            slaFormatado: kpi.slaFormatado || "0 min",
            slaMedioMinutos: kpi.slaMedioMinutos || 0,
            leadsParados48h: kpi.leadsParados48h || 0,
            agendamentosCount: kpi.agendamentosCount || 0,
            totalVisitas: kpi.totalVisitas || 0,
            totalSims: kpi.totalSims || 0,
            totalWhatsapp: kpi.totalWhatsapp || 0,
            totalIniciouScroll: kpi.totalIniciouScroll || 0,
            totalChegouFim: kpi.totalChegouFim || 0,
            topPlano: kpi.topPlano || "essencial",
            totalObito: kpi.totalObito || 0,
          }}
          motivosPerda={data.motivosPerda}
          leadsPorDia={data.leadsPorDia}
          faixaEtaria={data.faixaEtaria}
          orcamento={data.orcamento}
          paraQuem={data.paraQuem}
          atendentesPerformance={data.atendentesPerformance}
        />
      )}
    </main>
  );
}
