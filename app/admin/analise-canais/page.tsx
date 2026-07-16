"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  RefreshCw, DollarSign, Calendar, Save
} from "lucide-react";

interface CanalInfo {
  visitas: number;
  leads: number;
  leadsQualificados: number;
  investimento: number;
}

interface AnaliseData {
  mes: string;
  canais: {
    google: CanalInfo;
    meta: CanalInfo;
    whatsapp: CanalInfo;
    organico: CanalInfo;
    manual: CanalInfo;
  };
}

export default function AnaliseCanaisPage() {
  const [data, setData] = useState<AnaliseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  
  // States for investment inputs
  const [invGoogle, setInvGoogle] = useState("0");
  const [invMeta, setInvMeta] = useState("0");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const resp = await fetch(`/api/analise-canais?mes=${mes}`);
      if (!resp.ok) throw new Error("Erro de rede");
      const resData = await resp.json();
      setData(resData);
      // Pre-fill inputs with values from database
      setInvGoogle(resData.canais.google.investimento.toString());
      setInvMeta(resData.canais.meta.investimento.toString());
    } catch {
      setErro("Não foi possível carregar os dados de análise de canais.");
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const salvarInvestimentos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);
    try {
      const resp = await fetch("/api/analise-canais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mes,
          google: Number(invGoogle) || 0,
          meta: Number(invMeta) || 0,
        }),
      });

      if (!resp.ok) throw new Error();
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
      fetchData(); // reload
    } catch {
      alert("Falha ao salvar investimentos.");
    } finally {
      setSalvando(false);
    }
  };

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

  const { google, meta, whatsapp, organico, manual } = data.canais;

  const totalLeads = google.leads + meta.leads + whatsapp.leads + organico.leads + manual.leads;
  const totalVisitas = google.visitas + meta.visitas + whatsapp.visitas + organico.visitas + manual.visitas;
  const totalInvestimento = google.investimento + meta.investimento;

  // Calculos auxiliares
  const formatMoney = (val: number) => {
    return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCpl = (investimento: number, leads: number) => {
    if (leads === 0) return investimento > 0 ? "R$ --" : "R$ 0,00";
    return formatMoney(investimento / leads);
  };

  const getCplq = (investimento: number, leadsQualificados: number) => {
    if (leadsQualificados === 0) return investimento > 0 ? "R$ --" : "R$ 0,00";
    return formatMoney(investimento / leadsQualificados);
  };

  const getConv = (leads: number, visitas: number) => {
    if (visitas === 0) return "0,0%";
    return `${((leads / visitas) * 100).toFixed(1)}%`;
  };

  const getQualifRate = (qualificados: number, leads: number) => {
    if (leads === 0) return "0,0%";
    return `${((qualificados / leads) * 100).toFixed(1)}%`;
  };

  return (
    <main className="flex-1 p-6 lg:p-10 bg-[#FAFAFA] min-h-screen font-sans selection:bg-zinc-200">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 lg:pl-0 pl-12">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">Análise por Canal</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Avaliação de ROI, CPL e qualidade dos leads do Google Ads, Meta Ads e outros.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <input 
              type="month" 
              value={mes} 
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-sm text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5`} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="space-y-8 max-w-[1600px] mx-auto">
        
        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Google */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider">
                Google Ads
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Performance</p>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tighter text-zinc-900">{google.leads} Leads</p>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 text-xs">
                <div>
                  <p className="text-zinc-400 font-medium">Investido</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{formatMoney(google.investimento)}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">Visitas</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{google.visitas.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">CPL (Custo/Lead)</p>
                  <p className="font-bold text-blue-600 mt-0.5">{getCpl(google.investimento, google.leads)}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">CPLQ (Qualificado)</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{getCplq(google.investimento, google.leadsQualificados)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Meta */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs uppercase tracking-wider">
                Meta Ads
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Performance</p>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tighter text-zinc-900">{meta.leads} Leads</p>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 text-xs">
                <div>
                  <p className="text-zinc-400 font-medium">Investido</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{formatMoney(meta.investimento)}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">Visitas</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{meta.visitas.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">CPL (Custo/Lead)</p>
                  <p className="font-bold text-purple-600 mt-0.5">{getCpl(meta.investimento, meta.leads)}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">CPLQ (Qualificado)</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{getCplq(meta.investimento, meta.leadsQualificados)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Consolidado */}
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-6 text-white shadow-md flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold text-[10px] uppercase tracking-wider">
                Consolidado
              </div>
              <DollarSign className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Investimento Total do Mês</p>
              <p className="text-4xl font-bold tracking-tighter mb-4">{formatMoney(totalInvestimento)}</p>
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-800 text-xs">
                <div>
                  <p className="text-zinc-400 font-medium">Total Leads</p>
                  <p className="font-semibold text-white mt-0.5">{totalLeads}</p>
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">Total Visitas</p>
                  <p className="font-semibold text-white mt-0.5">{totalVisitas.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INPUT DE INVESTIMENTOS */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Investimento em Anúncios ({mes})</h3>
            <p className="text-zinc-500 text-xs mt-1">Preencha o valor investido nas plataformas no mês selecionado para calcular o CPL real.</p>
          </div>
          <form onSubmit={salvarInvestimentos} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Google Ads (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">R$</span>
                <input 
                  type="number"
                  step="any"
                  value={invGoogle}
                  onChange={(e) => setInvGoogle(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-250 rounded-xl outline-none text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 shadow-sm"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Meta Ads (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">R$</span>
                <input 
                  type="number"
                  step="any"
                  value={invMeta}
                  onChange={(e) => setInvMeta(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-250 rounded-xl outline-none text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 shadow-sm"
                  placeholder="0,00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 h-[38px] rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {salvando ? "Salvando..." : "Salvar Investimentos"}
            </button>
            {sucesso && (
              <span className="text-xs font-bold text-emerald-600 self-center animate-fade-in">✓ Salvo com sucesso!</span>
            )}
          </form>
        </div>

        {/* COMPARATIVE ANALYSIS TABLE */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-150">
            <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Comparativo de Canais</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Canal de Captação</th>
                  <th className="px-6 py-4">Investimento</th>
                  <th className="px-6 py-4">Visitas Únicas</th>
                  <th className="px-6 py-4">Leads</th>
                  <th className="px-6 py-4">Conv. Visita → Lead</th>
                  <th className="px-6 py-4">Leads Qualificados</th>
                  <th className="px-6 py-4">Taxa Qualificação</th>
                  <th className="px-6 py-4">CPL (Custo/Lead)</th>
                  <th className="px-6 py-4">CPLQ (Custo/Lead Q)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                {/* Google Ads */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Google Ads
                  </td>
                  <td className="px-6 py-4 font-medium">{formatMoney(google.investimento)}</td>
                  <td className="px-6 py-4 font-medium">{google.visitas.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold">{google.leads}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getConv(google.leads, google.visitas)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{google.leadsQualificados}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getQualifRate(google.leadsQualificados, google.leads)}</td>
                  <td className="px-6 py-4 font-extrabold text-blue-700">{getCpl(google.investimento, google.leads)}</td>
                  <td className="px-6 py-4 font-extrabold text-emerald-700">{getCplq(google.investimento, google.leadsQualificados)}</td>
                </tr>

                {/* Meta Ads */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Meta Ads
                  </td>
                  <td className="px-6 py-4 font-medium">{formatMoney(meta.investimento)}</td>
                  <td className="px-6 py-4 font-medium">{meta.visitas.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold">{meta.leads}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getConv(meta.leads, meta.visitas)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{meta.leadsQualificados}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getQualifRate(meta.leadsQualificados, meta.leads)}</td>
                  <td className="px-6 py-4 font-extrabold text-purple-700">{getCpl(meta.investimento, meta.leads)}</td>
                  <td className="px-6 py-4 font-extrabold text-emerald-700">{getCplq(meta.investimento, meta.leadsQualificados)}</td>
                </tr>

                {/* WhatsApp Direto */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    WhatsApp Direto
                  </td>
                  <td className="px-6 py-4 text-zinc-400 italic">Gratuito (Orgânico)</td>
                  <td className="px-6 py-4 text-zinc-400 italic">--</td>
                  <td className="px-6 py-4 font-bold">{whatsapp.leads}</td>
                  <td className="px-6 py-4 text-zinc-400 italic">--</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{whatsapp.leadsQualificados}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getQualifRate(whatsapp.leadsQualificados, whatsapp.leads)}</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">Grátis</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">Grátis</td>
                </tr>

                {/* Orgânico/Direto */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    Orgânico / Direto
                  </td>
                  <td className="px-6 py-4 text-zinc-400 italic">Gratuito (Orgânico)</td>
                  <td className="px-6 py-4 font-medium">{organico.visitas.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold">{organico.leads}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getConv(organico.leads, organico.visitas)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{organico.leadsQualificados}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getQualifRate(organico.leadsQualificados, organico.leads)}</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">Grátis</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">Grátis</td>
                </tr>

                {/* Manual */}
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-655" />
                    Cadastro Manual
                  </td>
                  <td className="px-6 py-4 text-zinc-400 italic">Interno</td>
                  <td className="px-6 py-4 text-zinc-400 italic">--</td>
                  <td className="px-6 py-4 font-bold">{manual.leads}</td>
                  <td className="px-6 py-4 text-zinc-400 italic">--</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{manual.leadsQualificados}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{getQualifRate(manual.leadsQualificados, manual.leads)}</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">--</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">--</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
