"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { 
  Users, Calendar, CheckCircle2, Award, RefreshCw, TrendingUp,
  DollarSign, Percent, Briefcase, MousePointerClick, BarChart3
} from "lucide-react";

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
  };
  planoCounts: Record<string, number>;
  leadsPorDia: { data: string; total: number }[];
  faixaEtaria: { faixa: string; total: number }[];
  orcamento: { faixa: string; total: number }[];
  prioridade: { tipo: string; total: number }[];
  paraQuem: { tipo: string; total: number }[];
  statusContato: { status: string; total: number }[];
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

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  const [periodo, setPeriodo] = useState("7dias");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

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
      
      if (periodo === "hoje") {
        from = now.toISOString().slice(0, 10);
        to = from;
      } else if (periodo === "ontem") {
        const ontem = new Date(now);
        ontem.setDate(now.getDate() - 1);
        from = ontem.toISOString().slice(0, 10);
        to = from;
      } else if (periodo === "7dias") {
        const d = new Date(now);
        d.setDate(now.getDate() - 6);
        from = d.toISOString().slice(0, 10);
        to = now.toISOString().slice(0, 10);
      } else if (periodo === "30dias") {
        const d = new Date(now);
        d.setDate(now.getDate() - 29);
        from = d.toISOString().slice(0, 10);
        to = now.toISOString().slice(0, 10);
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
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto">
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 cursor-pointer"
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="personalizado">Personalizado</option>
          </select>

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
    </main>
  );
}
