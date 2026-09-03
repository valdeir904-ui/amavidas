"use client";

import { useState, useEffect } from "react";
import { Printer, X, TrendingUp, Users, DollarSign, Award, Clock, AlertTriangle, CheckCircle2, ChevronRight, PieChart as PieIcon, Shield, PhoneCall, Calendar, RefreshCw } from "lucide-react";
import Image from "next/image";

interface RelatorioAgenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  agenciaData: {
    mesAno: string;
    investimentoLeads: number;
    investimentoBranding: number;
    investimentoTotal: number;
    observacoes: string;
    cplLeads: number;
    cplTotal: number;
    custoPorVenda: number;
  };
  kpiData: {
    totalLeads: number;
    leadsThisWeek: number;
    totalContratados: number;
    mrr: number;
    ticketMedio: number;
    previsaoReceita: number;
    taxaConversaoGeral: number;
    slaFormatado: string;
    slaMedioMinutos: number;
    leadsParados48h: number;
    agendamentosCount: number;
    totalVisitas: number;
    totalSims: number;
    totalWhatsapp: number;
    totalIniciouScroll: number;
    totalChegouFim: number;
    topPlano: string;
    totalObito: number;
  };
  motivosPerda?: { motivo: string; total: number; percentual: number }[];
  leadsPorDia?: { data: string; total: number }[];
  faixaEtaria?: { faixa: string; total: number }[];
  orcamento?: { faixa: string; total: number }[];
  paraQuem?: { tipo: string; total: number }[];
  atendentesPerformance?: any[];
}

export default function RelatorioAgenciaModal({
  isOpen,
  onClose,
  agenciaData: initialAgenciaData,
  kpiData: initialKpiData,
  motivosPerda: initialMotivosPerda = [],
  leadsPorDia: initialLeadsPorDia = [],
  faixaEtaria: initialFaixaEtaria = [],
  orcamento: initialOrcamento = [],
  paraQuem: initialParaQuem = [],
  atendentesPerformance: initialAtendentes = [],
}: RelatorioAgenciaModalProps) {
  const defaultMonth = initialAgenciaData?.mesAno || new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);

  const [agenciaData, setAgenciaData] = useState(initialAgenciaData);
  const [kpiData, setKpiData] = useState(initialKpiData);
  const [motivosPerda, setMotivosPerda] = useState(initialMotivosPerda);
  const [faixaEtaria, setFaixaEtaria] = useState(initialFaixaEtaria);
  const [orcamento, setOrcamento] = useState(initialOrcamento);
  const [paraQuem, setParaQuem] = useState(initialParaQuem);
  const [atendentesPerformance, setAtendentesPerformance] = useState(initialAtendentes);

  // Buscar dados estritamente para o mês fechado completo (01 ao último dia)
  const fetchFullMonthData = async (mesAno: string) => {
    setLoading(true);
    try {
      const [yStr, mStr] = mesAno.split("-");
      const year = parseInt(yStr, 10);
      const month = parseInt(mStr, 10);

      const firstDayStr = `${mesAno}-01`;
      const lastDayNum = new Date(year, month, 0).getDate();
      const lastDayStr = `${mesAno}-${String(lastDayNum).padStart(2, "0")}`;

      const resp = await fetch(`/api/dashboard?from=${firstDayStr}&to=${lastDayStr}`);
      if (resp.ok) {
        const res = await resp.json();
        if (res.agencia) setAgenciaData(res.agencia);
        if (res.kpi) {
          setKpiData({
            totalLeads: res.kpi.totalLeads || 0,
            leadsThisWeek: res.kpi.leadsThisWeek || 0,
            totalContratados: res.kpi.totalContratados || 0,
            mrr: res.kpi.mrr || 0,
            ticketMedio: res.kpi.ticketMedio || 0,
            previsaoReceita: res.kpi.previsaoReceita || 0,
            taxaConversaoGeral: res.kpi.taxaConversaoGeral || 0,
            slaFormatado: res.kpi.slaFormatado || "0 min",
            slaMedioMinutos: res.kpi.slaMedioMinutos || 0,
            leadsParados48h: res.kpi.leadsParados48h || 0,
            agendamentosCount: res.kpi.agendamentosCount || 0,
            totalVisitas: res.kpi.totalVisitas || 0,
            totalSims: res.kpi.totalSims || 0,
            totalWhatsapp: res.kpi.totalWhatsapp || 0,
            totalIniciouScroll: res.kpi.totalIniciouScroll || 0,
            totalChegouFim: res.kpi.totalChegouFim || 0,
            topPlano: res.kpi.topPlano || "essencial",
            totalObito: res.kpi.totalObito || 0,
          });
        }
        if (res.motivosPerda) setMotivosPerda(res.motivosPerda);
        if (res.faixaEtaria) setFaixaEtaria(res.faixaEtaria);
        if (res.orcamento) setOrcamento(res.orcamento);
        if (res.paraQuem) setParaQuem(res.paraQuem);
        if (res.atendentesPerformance) setAtendentesPerformance(res.atendentesPerformance);
      }
    } catch (err) {
      console.error("Erro ao buscar relatório fechado do mês:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initMes = initialAgenciaData?.mesAno || new Date().toISOString().slice(0, 7);
      setSelectedMonth(initMes);
      fetchFullMonthData(initMes);
    }
  }, [isOpen, initialAgenciaData?.mesAno]);

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    fetchFullMonthData(newMonth);
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) =>
    `R$ ${(val || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Cálculo de datas e strings do Mês Fechado Completo
  const [anoNum, mesNum] = (selectedMonth || "2026-08").split("-").map(Number);
  const dataRef = new Date(anoNum, mesNum - 1, 1);
  const lastDayNum = new Date(anoNum, mesNum, 0).getDate();

  const nomeMesExtenso = dataRef.toLocaleDateString("pt-BR", { month: "long" });
  const nomeMesCapitalized = nomeMesExtenso.charAt(0).toUpperCase() + nomeMesExtenso.slice(1);
  
  // Exemplo: "01 a 31 de Agosto de 2026"
  const periodoFechadoText = `01 a ${String(lastDayNum).padStart(2, "0")} de ${nomeMesCapitalized} de ${anoNum}`;
  const mesAnoHeader = `${nomeMesCapitalized} / ${anoNum}`;
  const dataEmissao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const totalLeadsBase = kpiData.totalLeads || 1;
  const individualItem = paraQuem.find((p) => p.tipo.toLowerCase().includes("indivi"))?.total || 0;
  const familiarItem = paraQuem.find((p) => p.tipo.toLowerCase().includes("fam"))?.total || 0;
  const totalParaQuem = individualItem + familiarItem || 1;
  const indPct = Math.round((individualItem / totalParaQuem) * 100);
  const famPct = 100 - indPct;

  const percBranding = agenciaData.investimentoTotal > 0
    ? Math.round((agenciaData.investimentoBranding / agenciaData.investimentoTotal) * 100)
    : 0;

  return (
    <div id="relatorio-agencia-modal-container" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible selection:bg-purple-500 selection:text-white">
      
      {/* REGRAS DE IMPRESSÃO CSS PARA PRESERVAR LAYOUT, PURPLE GRADIENT E A4 PAGES */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-hide {
            display: none !important;
          }
          #relatorio-agencia-pdf {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .pdf-page-block {
            width: 100% !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

      {/* BARRA FIXA DE AÇÕES (OCULTA NA IMPRESSÃO) */}
      <div className="sticky top-0 z-50 w-full bg-zinc-950/90 border-b border-zinc-800 px-6 py-4 text-white flex justify-between items-center print-hide print:hidden shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative w-24 h-8">
            <Image src="/logo-agencia.png" alt="Ascend Agência" fill className="object-contain" />
          </div>
          <span className="text-zinc-600">|</span>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-purple-400 uppercase">Relatório Mensal de Performance (Mês Fechado)</h3>
            <p className="text-[11px] text-zinc-400 font-medium">AmaVidas — Planos Funerários ({periodoFechadoText})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Mês Fechado Completo */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            <Calendar className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-semibold text-purple-200">Mês Fechado:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            />
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400 ml-1" />}
          </div>

          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-900/30 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF (6 Páginas)
          </button>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* DOCUMENTO IMPRIMÍVEL DE 6 PÁGINAS */}
      <div id="relatorio-agencia-pdf" className="w-full max-w-4xl space-y-8 my-8 print:my-0 print:p-0 print:w-full print:max-w-none">

        {/* ── PÁGINA 1: CAPA CONFIDENCIAL ── */}
        <div className="pdf-page-block bg-gradient-to-br from-purple-900 via-purple-950 to-black text-white p-12 lg:p-16 rounded-3xl min-h-[1050px] flex flex-col justify-between relative overflow-hidden shadow-2xl print:rounded-none print:shadow-none print:p-12">
          {/* Efeitos Visuais de Fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Topo da Capa */}
          <div className="flex justify-between items-center relative z-10">
            <div className="relative w-40 h-14">
              <Image src="/logo-agencia.png" alt="Ascend Agência" fill className="object-contain brightness-0 invert" />
            </div>
            <span className="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase bg-white/10 border border-white/20 backdrop-blur-md">
              RELATÓRIO CONFIDENCIAL
            </span>
          </div>

          {/* Título Principal */}
          <div className="my-auto py-12 relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-4">
              RELATÓRIO MENSAL DE PERFORMANCE
            </p>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Tráfego pago & aquisição de clientes — AmaVidas — Planos Funerários
            </h1>
            <p className="text-sm lg:text-base text-purple-200/80 leading-relaxed font-medium">
              Consolidação de investimento em mídia, geração de leads, eficiência comercial e comportamento de público, com diagnóstico e plano de ação da Ascend Agência para o próximo ciclo.
            </p>
          </div>

          {/* Cards Rápidos de Metadados e KPIs */}
          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs">
              <div>
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">CLIENTE</p>
                <p className="font-bold text-white mt-1">AmaVidas — Planos Funerários</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">PRAÇA DE ATUAÇÃO</p>
                <p className="font-bold text-white mt-1">Águas Lindas de Goiás (GO) & Distrito Federal</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">PERÍODO DE REFERÊNCIA</p>
                <p className="font-bold text-white mt-1 capitalize">{periodoFechadoText}</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">EMITIDO EM</p>
                <p className="font-bold text-white mt-1">{dataEmissao} · Ref. {selectedMonth}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white text-zinc-900 p-6 rounded-2xl shadow-xl">
                <p className="text-2xl font-black">{formatCurrency(agenciaData.investimentoTotal)}</p>
                <p className="text-[11px] font-semibold text-zinc-500 mt-1">Investimento total em tráfego</p>
              </div>
              <div className="bg-white text-zinc-900 p-6 rounded-2xl shadow-xl">
                <p className="text-3xl font-black text-purple-700">{kpiData.totalLeads}</p>
                <p className="text-[11px] font-semibold text-zinc-500 mt-1">Leads gerados no período</p>
              </div>
              <div className="bg-white text-zinc-900 p-6 rounded-2xl shadow-xl">
                <p className="text-2xl font-black">{formatCurrency(agenciaData.cplTotal)}</p>
                <p className="text-[11px] font-semibold text-zinc-500 mt-1">Custo por lead (CPL global)</p>
              </div>
              <div className="bg-white text-zinc-900 p-6 rounded-2xl shadow-xl">
                <p className="text-3xl font-black text-emerald-700">{kpiData.totalContratados}</p>
                <p className="text-[11px] font-semibold text-zinc-500 mt-1">Contratos fechados no mês</p>
              </div>
            </div>
          </div>

          {/* Footer da Capa */}
          <div className="pt-8 border-t border-white/10 flex justify-between items-center text-xs text-purple-300/70 font-medium relative z-10">
            <p>Preparado por <strong>Ascend Agência</strong></p>
            <p>agencia.ascend.br@gmail.com</p>
          </div>
        </div>

        {/* ── PÁGINA 2: SUMÁRIO EXECUTIVO ── */}
        <div className="pdf-page-block bg-white text-zinc-900 p-10 lg:p-12 rounded-3xl min-h-[1050px] flex flex-col justify-between shadow-2xl border border-zinc-200 print:rounded-none print:shadow-none print:p-10">
          <div>
            {/* Header de Página */}
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image src="/logo-agencia.png" alt="Ascend" fill className="object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Sumário Executivo</h2>
                  <p className="text-xs text-zinc-500">Relatório mensal de performance — AmaVidas — Planos Funerários</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full capitalize">
                {mesAnoHeader}
              </span>
            </div>

            {/* Panorama do mês */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-2">● Panorama do mês</h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Visão consolidada do investimento em tráfego pago, geração de leads e retorno comercial da AmaVidas entre {periodoFechadoText}. Os indicadores abaixo resumem a saúde geral da operação de aquisição.
              </p>
            </div>

            {/* Grid 8 Cards Panorama */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">INVESTIMENTO TOTAL</p>
                <p className="text-xl font-black text-zinc-900 mt-1">{formatCurrency(agenciaData.investimentoTotal)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Verba aplicada em mídia no mês</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">LEADS GERADOS</p>
                <p className="text-2xl font-black text-purple-700 mt-1">{kpiData.totalLeads}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Oportunidades no período</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">CPL GLOBAL</p>
                <p className="text-xl font-black text-zinc-900 mt-1">{formatCurrency(agenciaData.cplTotal)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Custo médio por oportunidade</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl relative overflow-hidden">
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-100 text-red-700">ATENÇÃO</span>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">CONTRATOS</p>
                <p className="text-2xl font-black text-zinc-900 mt-1">{kpiData.totalContratados}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Taxa de conversão de {kpiData.taxaConversaoGeral}%</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">CUSTO POR CONTRATO</p>
                <p className="text-xl font-black text-zinc-900 mt-1">{formatCurrency(agenciaData.custoPorVenda)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">CAC por venda finalizada</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">MRR ADICIONADO</p>
                <p className="text-xl font-black text-emerald-700 mt-1">{formatCurrency(kpiData.mrr)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Ticket médio: {formatCurrency(kpiData.ticketMedio)}</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">PIPELINE ATIVO</p>
                <p className="text-xl font-black text-zinc-900 mt-1">{formatCurrency(kpiData.previsaoReceita)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Potencial em negociação</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">CONTATOS WHATSAPP</p>
                <p className="text-2xl font-black text-teal-700 mt-1">{kpiData.totalWhatsapp}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Cliques diretos no site</p>
              </div>
            </div>

            {/* Como o investimento foi distribuído */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-4">● Como o investimento foi distribuído</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">🚀 Geração de Leads</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800">Conversão Direta</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4 font-medium">Campanhas direcionadas ao simulador de planos e ao atendimento comercial no site.</p>
                  <div className="pt-3 border-t border-zinc-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">INVESTIDO</p>
                      <p className="text-lg font-black text-zinc-900">{formatCurrency(agenciaData.investimentoLeads)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">CPL EFETIVO</p>
                      <p className="text-base font-bold text-purple-700">{formatCurrency(agenciaData.cplLeads)}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">✨ Fortalecimento de Marca</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">Instagram</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4 font-medium">Engajamento e tráfego direcionados para o perfil da AmaVidas no Instagram.</p>
                  <div className="pt-3 border-t border-zinc-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">INVESTIDO</p>
                      <p className="text-lg font-black text-zinc-900">{formatCurrency(agenciaData.investimentoBranding)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">REPRESENTATIVIDADE</p>
                      <p className="text-base font-bold text-indigo-700">{percBranding}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Diagnóstico Ascend */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                Leitura Ascend do período
              </h4>
              <p className="text-xs text-purple-900 leading-relaxed font-medium">
                O custo por lead global (<strong>{formatCurrency(agenciaData.cplTotal)}</strong>) segue eficiente e a geração de oportunidades foi consistente (<strong>{kpiData.totalLeads} leads</strong>). O gargalo do mês não está na mídia — está na velocidade de resposta comercial: SLA médio de <strong>{kpiData.slaFormatado}</strong> e <strong>{kpiData.leadsParados48h} leads parados</strong> há mais de 48h estão represando a conversão.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[11px] text-zinc-400 font-medium">
            <p>Ascend · Relatório de Performance — AmaVidas</p>
            <p>Confidencial · Ref. {selectedMonth} — Página 2 / 6</p>
          </div>
        </div>

        {/* ── PÁGINA 3: PERFORMANCE DE TRÁFEGO PAGO & FUNIL ── */}
        <div className="pdf-page-block bg-white text-zinc-900 p-10 lg:p-12 rounded-3xl min-h-[1050px] flex flex-col justify-between shadow-2xl border border-zinc-200 print:rounded-none print:shadow-none print:p-10">
          <div>
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Performance de Tráfego Pago</h2>
                <p className="text-xs text-zinc-500">Funil de aquisição e detalhamento de investimento por campanha</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full capitalize">{mesAnoHeader}</span>
            </div>

            {/* Funil de Aquisição */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-2">● Funil de aquisição</h3>
              <p className="text-xs text-zinc-600 font-medium mb-6">Evolução do usuário desde a visita inicial até a assinatura do contrato.</p>
              
              <div className="border border-zinc-200 rounded-3xl p-6 space-y-6 bg-zinc-50/50">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-zinc-900">Acessos à página <span className="text-zinc-500 font-normal">Tráfego único recebido</span></span>
                      <span className="text-base font-black text-zinc-900">{kpiData.totalVisitas.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-3 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full w-full" />
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-zinc-900">Leads gerados <span className="text-zinc-500 font-normal">Simulações concluídas</span></span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          {kpiData.totalVisitas > 0 ? Math.round((kpiData.totalLeads / kpiData.totalVisitas) * 100) : 0}% conv.
                        </span>
                        <span className="text-base font-black text-zinc-900">{kpiData.totalLeads.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, (kpiData.totalLeads / (kpiData.totalVisitas || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-zinc-900">Contratos <span className="text-zinc-500 font-normal">Vendas fechadas</span></span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {kpiData.taxaConversaoGeral}% conv.
                        </span>
                        <span className="text-base font-black text-zinc-900">{kpiData.totalContratados.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(2, (kpiData.totalContratados / (kpiData.totalLeads || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Captação e Engajamento */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-4">● Captação e engajamento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">CONTATOS VIA WHATSAPP</p>
                  <p className="text-3xl font-black text-teal-700 mt-1">{kpiData.totalWhatsapp}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Cliques diretos em botões do site</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">SIMULAÇÕES INICIADAS</p>
                  <p className="text-3xl font-black text-purple-700 mt-1">{kpiData.totalSims}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{kpiData.totalLeads} concluíram e viraram lead</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">ENGAJAMENTO DA PÁGINA</p>
                  <p className="text-3xl font-black text-zinc-900 mt-1">{kpiData.totalIniciouScroll} rolagens</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {kpiData.totalIniciouScroll > 0 ? Math.round((kpiData.totalChegouFim / kpiData.totalIniciouScroll) * 100) : 0}% chegaram ao fim
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[11px] text-zinc-400 font-medium">
            <p>Ascend · Relatório de Performance — AmaVidas</p>
            <p>Confidencial · Ref. {selectedMonth} — Página 3 / 6</p>
          </div>
        </div>

        {/* ── PÁGINA 4: EFICIÊNCIA COMERCIAL & ATENDIMENTO ── */}
        <div className="pdf-page-block bg-white text-zinc-900 p-10 lg:p-12 rounded-3xl min-h-[1050px] flex flex-col justify-between shadow-2xl border border-zinc-200 print:rounded-none print:shadow-none print:p-10">
          <div>
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Eficiência Comercial & Atendimento</h2>
                <p className="text-xs text-zinc-500">SLA comercial (Janela 08:00–17:30), gestão de atendentes e motivos de perda</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full capitalize">{mesAnoHeader}</span>
            </div>

            {/* SLA e Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-red-50/60 border border-red-200 p-5 rounded-2xl relative overflow-hidden">
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white">CRÍTICO</span>
                <p className="text-[10px] font-bold text-red-900 uppercase">SLA DE RESPOSTA (08h-17h30)</p>
                <p className="text-3xl font-black text-red-700 mt-2">{kpiData.slaFormatado}</p>
                <p className="text-xs text-red-900/70 mt-1 font-medium">Tempo útil médio até 1º contato</p>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl relative overflow-hidden">
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-600 text-white">AÇÃO NECESSÁRIA</span>
                <p className="text-[10px] font-bold text-amber-900 uppercase">LEADS PARADOS (&gt; 48H)</p>
                <p className="text-3xl font-black text-amber-700 mt-2">{kpiData.leadsParados48h}</p>
                <p className="text-xs text-amber-900/70 mt-1 font-medium">Leads ativos sem atualização</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">FOLLOW-UPS PROGRAMADOS</p>
                <p className="text-3xl font-black text-zinc-900 mt-2">{kpiData.agendamentosCount}</p>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Com data e hora agendadas</p>
              </div>
            </div>

            {/* Gestão de atendentes */}
            {atendentesPerformance.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-3">● Gestão de atendentes & volume por lead</h3>
                <div className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="text-left p-3">ATENDENTE</th>
                        <th className="text-center p-3">LEADS ATRIBUÍDOS</th>
                        <th className="text-right p-3">SITUAÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {atendentesPerformance.map((at) => (
                        <tr key={at.id}>
                          <td className="p-3 font-bold text-zinc-900 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-[10px]">
                              {at.nome.charAt(0)}
                            </span>
                            <div>
                              <p>{at.nome}</p>
                              <p className="text-[10px] text-zinc-400 font-normal">{at.email}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center font-black text-sm text-zinc-900">{at.totalLeads}</td>
                          <td className="p-3 text-right">
                            {(at.leadsParadosCount || 0) > 0 ? (
                              <span className="text-red-600 font-extrabold">{at.leadsParadosCount} parado(s) &gt; 7 dias</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">Em dia</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Motivos de Perda */}
            {motivosPerda.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-3">● Análise de motivos de perda</h3>
                <div className="space-y-2.5 border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50">
                  {motivosPerda.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-800 w-1/3 truncate">{m.motivo}</span>
                      <div className="w-1/2 bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.max(5, m.percentual)}%` }} />
                      </div>
                      <span className="font-black text-zinc-900 w-16 text-right">{m.total} ({m.percentual}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[11px] text-zinc-400 font-medium">
            <p>Ascend · Relatório de Performance — AmaVidas</p>
            <p>Confidencial · Ref. {selectedMonth} — Página 4 / 6</p>
          </div>
        </div>

        {/* ── PÁGINA 5: PERFIL DO PÚBLICO & TENDÊNCIA ── */}
        <div className="pdf-page-block bg-white text-zinc-900 p-10 lg:p-12 rounded-3xl min-h-[1050px] flex flex-col justify-between shadow-2xl border border-zinc-200 print:rounded-none print:shadow-none print:p-10">
          <div>
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Perfil do Público & Tendência</h2>
                <p className="text-xs text-zinc-500">Demografia, preferências e volume declarados na simulação</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full capitalize">{mesAnoHeader}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Demografia Etária */}
              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">Demografia etária</h4>
                <div className="space-y-2">
                  {faixaEtaria.map((f, i) => {
                    const pct = Math.round((f.total / totalLeadsBase) * 100);
                    return (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-700 w-28 truncate">{f.faixa || "Não informado"}</span>
                        <div className="w-1/2 bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.max(5, pct)}%` }} />
                        </div>
                        <span className="font-bold text-zinc-900">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Orçamento Mensal */}
              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">Orçamento mensal declarado</h4>
                <div className="space-y-2">
                  {orcamento.map((o, i) => {
                    const pct = Math.round((o.total / totalLeadsBase) * 100);
                    return (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-700 w-28 truncate">{o.faixa || "Não informado"}</span>
                        <div className="w-1/2 bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.max(5, pct)}%` }} />
                        </div>
                        <span className="font-bold text-zinc-900">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tipo de proteção buscada & Volume Operacional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">Tipo de proteção buscada</h4>
                  <div className="h-4 w-full bg-zinc-200 rounded-full overflow-hidden flex mb-4">
                    <div style={{ width: `${indPct}%` }} className="bg-purple-600 h-full" />
                    <div style={{ width: `${famPct}%` }} className="bg-indigo-600 h-full" />
                  </div>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-purple-700">Individual: {indPct}% ({individualItem})</span>
                  <span className="text-indigo-700">Familiar: {famPct}% ({familiarItem})</span>
                </div>
              </div>

              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3">Volume operacional</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-zinc-200">
                    <p className="text-[10px] text-zinc-400 font-bold">TOTAL LEADS BASE</p>
                    <p className="text-xl font-black text-zinc-900 mt-1">{kpiData.totalLeads}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200">
                    <p className="text-[10px] text-zinc-400 font-bold">PLANO DESTAQUE</p>
                    <p className="text-sm font-black text-purple-700 capitalize mt-1">{kpiData.topPlano}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[11px] text-zinc-400 font-medium">
            <p>Ascend · Relatório de Performance — AmaVidas</p>
            <p>Confidencial · Ref. {selectedMonth} — Página 5 / 6</p>
          </div>
        </div>

        {/* ── PÁGINA 6: DIAGNÓSTICO & PLANO DE AÇÃO ── */}
        <div className="pdf-page-block bg-white text-zinc-900 p-10 lg:p-12 rounded-3xl min-h-[1050px] flex flex-col justify-between shadow-2xl border border-zinc-200 print:rounded-none print:shadow-none print:p-10">
          <div>
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Diagnóstico & Plano de Ação</h2>
                <p className="text-xs text-zinc-500">Leitura estratégica Ascend e recomendações para o próximo ciclo</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full capitalize">{mesAnoHeader}</span>
            </div>

            {/* Pontos de Atenção */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-4">● Diagnóstico Ascend</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-red-600 text-white shrink-0"><Clock className="w-4 h-4" /></span>
                  <div>
                    <h4 className="text-xs font-bold text-red-900">Velocidade de resposta comprometida</h4>
                    <p className="text-xs text-red-800/80 font-medium mt-0.5">
                      O SLA comercial médio de {kpiData.slaFormatado} está acima do ideal para simulação online (meta: até 15 min).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-amber-600 text-white shrink-0"><AlertTriangle className="w-4 h-4" /></span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">{kpiData.leadsParados48h} leads parados sem atualização</h4>
                    <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                      Oportunidades no funil ativo sem interação há mais de 48h represando a taxa de conversão final.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recomendações em Grid 4 */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 mb-4">● Recomendações para o próximo ciclo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-zinc-200 bg-purple-50/50">
                  <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-3">1</span>
                  <h4 className="text-xs font-bold text-zinc-900">Resposta útil em até 15 minutos</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 font-medium">Cadência imediata para novos leads criados na janela comercial (08:00 às 17:30).</p>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-200 bg-purple-50/50">
                  <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-3">2</span>
                  <h4 className="text-xs font-bold text-zinc-900">Rotina de follow-up estruturada</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 font-medium">Cadência obrigatória de tentativas com agendamento ativo no CRM.</p>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-200 bg-purple-50/50">
                  <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-3">3</span>
                  <h4 className="text-xs font-bold text-zinc-900">Recuperação da base parada</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 font-medium">Ação dedicada de reativação via WhatsApp para a base de leads sem movimentação.</p>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-200 bg-purple-50/50">
                  <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-3">4</span>
                  <h4 className="text-xs font-bold text-zinc-900">Alinhamento de mídia & vendas</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 font-medium">Manter o alinhamento constante da verba de aquisição com a capacidade da equipe comercial.</p>
                </div>
              </div>
            </div>

            {/* Banner Encerramento */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-lg font-bold">Vamos elevar a conversão no próximo ciclo</h4>
                <p className="text-xs text-purple-200 mt-1 font-medium">A geração de leads está saudável — o próximo passo é otimizar o atendimento para transformar oportunidades em vendas.</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold">Ascend Agência</p>
                <p className="text-[10px] text-purple-300">agencia.ascend.br@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[11px] text-zinc-400 font-medium">
            <p>Ascend · Relatório de Performance — AmaVidas</p>
            <p>Confidencial · Ref. {selectedMonth} — Página 6 / 6</p>
          </div>
        </div>

      </div>
    </div>
  );
}
