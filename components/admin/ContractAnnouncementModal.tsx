"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ANNOUNCEMENT_KEY = "amavidas_contrato_announcement_seen_v1";

export default function ContractAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário já visualizou a novidade
    const seen = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!seen) {
      // Exibir popup com ligeiro delay para transição suave de abertura
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
    setIsOpen(false);
  };

  const handleGoToGenerator = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
    setIsOpen(false);
    router.push("/admin/contratos/novo");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn print:hidden">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-6 relative overflow-hidden transform transition-all scale-100">
        
        {/* FAIXA SUPERIOR COM GRADIENTE DA MARCA */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#4f6ef7] via-[#06b6d4] to-[#4f6ef7]" />

        {/* BOTÃO FECHAR */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
          title="Fechar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* CABEÇALHO DA NOVIDADE */}
        <div className="space-y-3 pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider">
            <span>🎉</span>
            <span>NOVIDADE NO SISTEMA</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Novo Gerador de Contratos AmaVidas!
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Agora você conta com um módulo completo para emitir, pré-visualizar em tempo real e exportar contratos em PDF com integração total ao CRM.
          </p>
        </div>

        {/* LISTA DE DESTAQUES */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              📄
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">PDF Oficial de 12 Páginas</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Minutas no formato A4 com a logo transparente original, sem quebras brancas ou rasuras.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm font-bold shrink-0">
              🔗
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Integração Direta com o CRM</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Importe os dados do Lead em 1 clique e atualize o status para <strong>Venda Ganha</strong> automaticamente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Máscaras e Preços Automáticos</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Formatação inteligente para CPF, CNPJ e WhatsApp com valores sincronizados com o site.
              </p>
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleGoToGenerator}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#4f6ef7] to-[#06b6d4] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>🚀 Criar Primeiro Contrato</span>
          </button>
          
          <button
            onClick={handleClose}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
