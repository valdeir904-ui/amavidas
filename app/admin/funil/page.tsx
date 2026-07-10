"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, DollarSign, Percent, Award, Users, AlertTriangle, Clock, RefreshCw, Save
} from "lucide-react";

interface FunnelData {
  adSpend: number;
  totalLeads: number;
  totalAbandonos: number;
  taxaConclusao: number;
  qualidade: {
    intencaoCounts: {
      contratar_agora: number;
      entender_melhor: number;
      pesquisando: number;
      anterior: number;
    };
    convPorIntencao: {
      contratar_agora: number;
      entender_melhor: number;
      pesquisando: number;
    };
    pctInvalidos: number;
  };
  performance: {
    slaMedioMinutos: number;
    tempoMedioEtapasHoras: {
      novo_lead: number;
      em_contato: number;
      negociando: number;
    };
    descartePorAtendente: {
      id: string;
      nome: string;
      total: number;
      descartados: number;
      taxaDescarte: number;
    }[];
    motivoDescarte: {
      motivo: string;
      total: number;
    }[];
  };
  abandono: {
    abandonoPorEtapa: { etapa: number; total: number }[];
  };
  custos: {
    cpl: number;
    cplq: number;
    cac: number;
    totalGanhos: number;
    totalQualificados: number;
  };
}

const ETAPAS_LABELS: Record<number, { title: string; desc: string }> = {
  1: { title: "Etapa 1: Para quem", desc: "Quem será protegido pelo plano" },
  2: { title: "Etapa 2: Quantidade de pessoas", desc: "Número de vidas" },
  3: { title: "Etapa 3: Faixa etária", desc: "Idade do mais velho" },
  4: { title: "Etapa 4: Cidade", desc: "Localidade do usuário" },
  5: { title: "Etapa 5: Prioridade", desc: "Foco (Preço ou Cobertura)" },
  6: { title: "Etapa 6: Orçamento", desc: "Valor mensal que planeja pagar" },
  7: { title: "Etapa 7: Intenção", desc: "Estágio de compra (Pesquisando/Contratar)" },
  8: { title: "Etapa 8: Contato", desc: "Tentativa de envio de Nome/Whatsapp" },
};

const MOTIVOS_LABELS: Record<string, string> = {
  numero_errado: "Número errado / não existe",
  nao_atende: "Não atende as ligações",
  nao_respondeu: "Não respondeu as mensagens",
  sem_interesse: "Sem interesse real",
  achou_caro: "Achou caro",
  vai_pensar: "Vai pensar / retornar depois",
  ja_tem_plano: "Já tem plano funerário",
  fora_area: "Fora da área de atendimento",
  dado_invalido: "Dado inválido (falso)",
  outro: "Outro motivo especificado",
};

export default function FunilPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSpend, setSavingSpend] = useState(false);
  const [inputSpend, setInputSpend] = useState("");
  const [erro, setErro] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Definir data inicial padrão (últimos 30 dias)
  useEffect(() => {
    const agora = new Date();
    const trintaDiasAtras = new Date(agora);
    trintaDiasAtras.setDate(agora.getDate() - 29);

    setDataInicio(trintaDiasAtras.toISOString().slice(0, 10));
    setDataFim(agora.toISOString().slice(0, 10));
  }, []);

  const fetchData = useCallback(async () => {
    if (!dataInicio || !dataFim) return;
    setLoading(true);
    setErro("");
    try {
      const resp = await fetch(`/api/funil?from=${dataInicio}&to=${dataFim}`);
      if (!resp.ok) throw new Error("Falha ao buscar dados.");
      const json = await resp.json();
      setData(json);
      setInputSpend(String(json.adSpend));
    } catch {
      setErro("Não foi possível carregar os dados de funil.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSpend = async () => {
    const val = parseFloat(inputSpend);
    if (isNaN(val) || val < 0) {
      alert("Informe um valor numérico válido.");
      return;
    }

    setSavingSpend(true);
    try {
      const r = await fetch("/api/funil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adSpend: val }),
      });
      if (r.ok) {
        alert("Investimento em anúncios salvo com sucesso!");
        fetchData();
      } else {
        alert("Erro ao salvar investimento.");
      }
    } catch {
      alert("Erro de rede.");
    } finally {
      setSavingSpend(false);
    }
  };

  const formatSla = (minutos: number) => {
    if (minutos < 1) return "Menos de 1 min";
    if (minutos < 60) return `${minutos} minutos`;
    const horas = Math.floor(minutos / 60);
    const restMin = minutos % 60;
    return `${horas}h ${restMin}m`;
  };

  if (loading && !data) {
    return (
      <main className="flex-1 p-6 lg:p-10 flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Processando métricas do funil...</p>
        </div>
      </main>
    );
  }

  if (erro || !data) {
    return (
      <main className="flex-1 p-6 lg:p-10 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-sm shadow-xl">
          <p className="text-red-650 text-sm font-semibold">{erro || "Não foi possível carregar os dados"}</p>
          <button onClick={fetchData} className="mt-6 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 lg:p-10 bg-[#FAFAFA] min-h-screen selection:bg-zinc-200">
      {/* Header */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 lg:pl-0 pl-12">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Análise de Funil</h1>
          <p className="text-zinc-505 text-sm mt-1.5 font-medium">ROI de Marketing, Abandono por Pergunta e Qualidade Comercial.</p>
        </div>
        
        {/* Controles de Filtro e Ad Spend */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          {/* Período */}
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-700 text-xs font-semibold focus:outline-none"
            />
            <span className="text-zinc-400 text-xs font-bold">até</span>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-700 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="h-6 w-[1px] bg-zinc-200 hidden sm:block" />

          {/* Ad Spend */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Investimento:</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
              <input
                type="text"
                value={inputSpend}
                onChange={(e) => setInputSpend(e.target.value)}
                placeholder="0.00"
                className="w-24 pl-8 pr-2.5 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-800 text-xs font-bold focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveSpend}
              disabled={savingSpend}
              className="p-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
              title="Salvar investimento"
            >
              {savingSpend ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center ml-auto xl:ml-0"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="space-y-8 max-w-[1600px] mx-auto">
        
        {/* ROW 1: Custos e ROI de Anúncios */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Investimento Total</p>
              <p className="text-3xl font-black mt-2 tracking-tight">R$ {data.adSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mt-4">Meta/Google Ads no período</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Custo por Lead (CPL)</p>
                <p className="text-3xl font-black text-zinc-900 mt-2 tracking-tight">R$ {data.custos.cpl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><DollarSign className="w-4 h-4" /></div>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mt-4">Calculado sobre {data.totalLeads} leads gerados</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">CPL Qualificado (CPLQ)</p>
                <p className="text-3xl font-black text-zinc-900 mt-2 tracking-tight">R$ {data.custos.cplq.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mt-4">Leads com intenção "Contratar agora" ({data.custos.totalQualificados})</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Custo de Aquisição (CAC)</p>
                <p className="text-3xl font-black text-zinc-900 mt-2 tracking-tight">R$ {data.custos.cac.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><Award className="w-4 h-4" /></div>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mt-4">Calculado sobre {data.custos.totalGanhos} clientes ganhos</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Taxa de Conclusão</p>
                <p className="text-3xl font-black text-zinc-900 mt-2 tracking-tight">{data.taxaConclusao}%</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><Percent className="w-4 h-4" /></div>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mt-4">Simulações concluídas vs iniciadas</p>
          </div>

        </section>

        {/* ROW 2: Abandono / Drop-off do Simulador */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Abandono por Etapa do Quiz</h3>
              <p className="text-xs text-zinc-500 font-semibold mb-6">Etapa exata onde os usuários desistiram de preencher o simulador (total: {data.totalAbandonos} abandonos).</p>
              
              <div className="space-y-4">
                {Object.entries(ETAPAS_LABELS).map(([etapaNumStr, labelInfo]) => {
                  const etapaNum = parseInt(etapaNumStr);
                  const countAbandono = data.abandono.abandonoPorEtapa.find(e => e.etapa === etapaNum)?.total ?? 0;
                  
                  // Porcentagem em relação ao total de abandonos
                  const pctAbandono = data.totalAbandonos > 0 ? Math.round((countAbandono / data.totalAbandonos) * 100) : 0;
                  
                  return (
                    <div key={etapaNum} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <div>
                          <span className="font-bold text-zinc-800">{labelInfo.title}</span>
                          <span className="text-zinc-400 font-medium ml-2">— {labelInfo.desc}</span>
                        </div>
                        <span className="font-bold text-zinc-900">{countAbandono} desists <span className="text-zinc-400 font-normal ml-1">({pctAbandono}%)</span></span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200/50">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-red-400"
                          style={{ width: `${pctAbandono}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Qualidade do Lead */}
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Qualidade e Intenção Declarada</h3>
              <p className="text-xs text-zinc-500 font-semibold mb-6">Mapeamento da intenção do usuário no formulário e conversão em vendas.</p>
              
              <div className="space-y-6 my-auto">
                {/* Contratar Agora */}
                <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <span className="text-xs font-black text-red-800 uppercase tracking-wider">🔴 Contratar o quanto antes</span>
                    <p className="text-xl font-bold text-zinc-800 mt-1">{data.qualidade.intencaoCounts.contratar_agora} leads</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                      {data.qualidade.convPorIntencao.contratar_agora}% Fechou
                    </span>
                  </div>
                </div>

                {/* Entender Melhor */}
                <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                  <div>
                    <span className="text-xs font-black text-amber-800 uppercase tracking-wider">🟡 Entender melhor antes</span>
                    <p className="text-xl font-bold text-zinc-800 mt-1">{data.qualidade.intencaoCounts.entender_melhor} leads</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                      {data.qualidade.convPorIntencao.entender_melhor}% Fechou
                    </span>
                  </div>
                </div>

                {/* Pesquisando */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-150 rounded-2xl">
                  <div>
                    <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">⚪ Só pesquisando</span>
                    <p className="text-xl font-bold text-zinc-800 mt-1">{data.qualidade.intencaoCounts.pesquisando} leads</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                      {data.qualidade.convPorIntencao.pesquisando}% Fechou
                    </span>
                  </div>
                </div>

                {/* Leads com dados falsos */}
                <div className="flex items-center gap-3.5 p-4 border border-zinc-200 rounded-2xl bg-slate-50/50 shadow-inner">
                  <div className="p-2 bg-red-100 border border-red-200 text-red-650 rounded-xl shrink-0"><AlertTriangle className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dados Falsos / Inválidos</p>
                    <p className="text-lg font-black text-zinc-800 mt-0.5">{data.qualidade.pctInvalidos}% <span className="text-xs text-zinc-400 font-medium font-sans">dos leads no período</span></p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* ROW 3: Performance Comercial (SLA, Tempo nas Etapas e Descarte) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Tempos de Funil e SLA */}
          <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Tempos e SLA Comercial</h3>
            <p className="text-xs text-zinc-500 font-semibold mb-6">Velocidade de primeiro contato e tempo médio gasto nas etapas do CRM.</p>

            <div className="space-y-6">
              
              {/* SLA KPI Card */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/20 border border-blue-100 rounded-2xl">
                <div className="p-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">SLA Médio de Primeiro Contato</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">{formatSla(data.performance.slaMedioMinutos)}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Tempo entre a criação do lead e o clique em "Marcar contato"</p>
                </div>
              </div>

              {/* Tempo nas etapas do CRM */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Permanência Média por Estágio (horas)</h4>
                
                <div className="space-y-3">
                  {/* Novo Lead */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700">⏳ Novo Lead</span>
                    <span className="font-bold text-zinc-900">{data.performance.tempoMedioEtapasHoras.novo_lead} h</span>
                  </div>
                  {/* Em Contato */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700">📞 Em Contato</span>
                    <span className="font-bold text-zinc-900">{data.performance.tempoMedioEtapasHoras.em_contato} h</span>
                  </div>
                  {/* Negociando */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700">💬 Negociando</span>
                    <span className="font-bold text-zinc-900">{data.performance.tempoMedioEtapasHoras.negociando} h</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Descarte por Atendente e Motivos */}
          <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Descarte e Perda de Vendas</h3>
            <p className="text-xs text-zinc-500 font-semibold mb-6">Produtividade de conversão e motivos mapeados para perda comercial.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Descarte por Atendente */}
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Perda por Atendente</h4>
                {data.performance.descartePorAtendente.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Sem atendentes cadastrados no período.</p>
                ) : (
                  <div className="space-y-3">
                    {data.performance.descartePorAtendente.map((a) => (
                      <div key={a.id} className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">{a.nome.split(" ")[0]}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{a.total} leads / {a.descartados} desc.</p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${
                          a.taxaDescarte > 50 ? "bg-red-50 text-red-750 border border-red-200" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                        }`}>
                          {a.taxaDescarte}% descarte
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Motivos de Descarte */}
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Motivos Mais Frequentes</h4>
                {data.performance.motivoDescarte.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Nenhum lead marcado como perdido no período.</p>
                ) : (
                  <div className="space-y-2">
                    {data.performance.motivoDescarte.map((m) => (
                      <div key={m.motivo} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5">
                        <span className="font-medium text-slate-600 truncate max-w-[130px]" title={MOTIVOS_LABELS[m.motivo] ?? m.motivo}>
                          {MOTIVOS_LABELS[m.motivo] ?? m.motivo}
                        </span>
                        <span className="font-bold text-slate-800 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                          {m.total} leads
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
