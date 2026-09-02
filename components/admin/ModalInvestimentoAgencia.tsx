"use client";

import { useState, useEffect } from "react";
import { DollarSign, Calendar, TrendingUp, Save, X, AlertCircle } from "lucide-react";

interface ModalInvestimentoAgenciaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentMesAno?: string;
  initialInvestimentoLeads?: number;
  initialInvestimentoBranding?: number;
  initialObservacoes?: string;
}

export default function ModalInvestimentoAgencia({
  isOpen,
  onClose,
  onSuccess,
  currentMesAno,
  initialInvestimentoLeads = 0,
  initialInvestimentoBranding = 0,
  initialObservacoes = "",
}: ModalInvestimentoAgenciaProps) {
  const defaultMes = currentMesAno || new Date().toISOString().slice(0, 7);
  const [mesAno, setMesAno] = useState(defaultMes);
  const [investimentoLeads, setInvestimentoLeads] = useState("");
  const [investimentoBranding, setInvestimentoBranding] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMonth, setFetchingMonth] = useState(false);
  const [erro, setErro] = useState("");
  const [hasExistingRecord, setHasExistingRecord] = useState(false);

  // Função para buscar dados do mês selecionado
  const loadMonthData = async (targetMes: string) => {
    setFetchingMonth(true);
    try {
      const resp = await fetch(`/api/admin/investimentos?mesAno=${targetMes}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.investimento) {
          setInvestimentoLeads(data.investimento.investimentoLeads ? data.investimento.investimentoLeads.toString() : "");
          setInvestimentoBranding(data.investimento.investimentoBranding ? data.investimento.investimentoBranding.toString() : "");
          setObservacoes(data.investimento.observacoes || "");
          setHasExistingRecord(true);
        } else {
          setInvestimentoLeads("");
          setInvestimentoBranding("");
          setObservacoes("");
          setHasExistingRecord(false);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar mês:", e);
    } finally {
      setFetchingMonth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const selMes = currentMesAno || new Date().toISOString().slice(0, 7);
      setMesAno(selMes);
      setErro("");
      loadMonthData(selMes);
    }
  }, [isOpen, currentMesAno]);

  const handleMesChange = (newMes: string) => {
    setMesAno(newMes);
    loadMonthData(newMes);
  };

  if (!isOpen) return null;

  const leadsNum = parseFloat(investimentoLeads) || 0;
  const brandingNum = parseFloat(investimentoBranding) || 0;
  const totalNum = leadsNum + brandingNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const resp = await fetch("/api/admin/investimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesAno,
          investimentoLeads: leadsNum,
          investimentoBranding: brandingNum,
          observacoes,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Erro ao salvar investimento");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErro(err.message || "Falha ao salvar investimentos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-zinc-900 p-6 text-white flex justify-between items-start relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Acesso Restrito Agência
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Investimento em Anúncios</h2>
            <p className="text-teal-100/70 text-xs mt-1 font-medium">
              Insira o valor aplicado em cada campanha para calcular CPL e ROI.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Mês de Referência */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Mês de Referência
              </label>
              {fetchingMonth ? (
                <span className="text-[10px] text-zinc-400 animate-pulse font-semibold">Carregando mês...</span>
              ) : hasExistingRecord ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  🟢 Lançamento Encontrado (Edição)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                  ⚪ Novo Lançamento
                </span>
              )}
            </div>
            <input
              type="month"
              value={mesAno}
              onChange={(e) => handleMesChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
              required
            />
          </div>

          {/* Campanha 1: Geração de Leads */}
          <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-900 mb-1 flex items-center justify-between">
              <span>🚀 Campanha Geração de Leads</span>
              <span className="text-[10px] text-teal-600 font-normal">Foco em Conversão</span>
            </label>
            <p className="text-[11px] text-teal-700/80 mb-2">Investimento em anúncios focados na captação direta de leads no site.</p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-teal-700">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={investimentoLeads}
                onChange={(e) => setInvestimentoLeads(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-teal-200 bg-white text-zinc-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Campanha 2: Fortalecimento de Marca / Instagram */}
          <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1 flex items-center justify-between">
              <span>✨ Campanha Fortalecimento da Marca</span>
              <span className="text-[10px] text-purple-600 font-normal">Instagram / Engajamento</span>
            </label>
            <p className="text-[11px] text-purple-700/80 mb-2">Investimento para tráfego ao perfil do Instagram e alcance de marca.</p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-700">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={investimentoBranding}
                onChange={(e) => setInvestimentoBranding(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 bg-white text-zinc-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          {/* Resumo Total */}
          <div className="bg-zinc-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Investimento Total Previsto</p>
              <p className="text-xs text-zinc-300 font-medium">Soma de todas as campanhas do mês</p>
            </div>
            <p className="text-2xl font-black text-teal-400 tracking-tight">
              R$ {totalNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Observações Estratégicas da Agência
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Aumento de verba na 2ª semana; teste de público na região X..."
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {loading ? "Salvando..." : "Salvar Investimentos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
