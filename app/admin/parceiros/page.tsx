"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Parceiro {
  id: string;
  nome: string;
  tipo: string;
  desconto: string;
  contato: string | null;
  logoUrl: string | null;
  ativo: boolean;
  ordem: number;
}

// ─── Toggle Component ───────────────────────────────────────────────────────────
function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1 gap-4">
      <div>
        <p className="text-sm text-slate-700 font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div onClick={() => onChange(!checked)} className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-slate-200"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

// ─── Live Preview Card ────────────────────────────────────────────────────────
function PreviewCard({ parceiro }: { parceiro: Parceiro }) {
  const getIcon = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes("farm") || t.includes("remed")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
    }
    if (t.includes("exam") || t.includes("lab") || t.includes("clin") || t.includes("saud") || t.includes("odont")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    }
    if (t.includes("educ") || t.includes("curs") || t.includes("faculd") || t.includes("idiom")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      );
    }
    // Default Lazer / Comércio
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  };

  const getColors = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes("farm") || t.includes("remed")) {
      return { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", badge: "bg-emerald-100 text-emerald-800" };
    }
    if (t.includes("exam") || t.includes("lab") || t.includes("clin") || t.includes("saud") || t.includes("odont")) {
      return { bg: "bg-blue-50 text-blue-600 border-blue-100", badge: "bg-blue-100 text-blue-800" };
    }
    if (t.includes("educ") || t.includes("curs") || t.includes("faculd") || t.includes("idiom")) {
      return { bg: "bg-indigo-50 text-indigo-600 border-indigo-100", badge: "bg-indigo-100 text-indigo-800" };
    }
    return { bg: "bg-rose-50 text-rose-600 border-rose-100", badge: "bg-rose-100 text-rose-800" };
  };

  const colors = getColors(parceiro.tipo);

  return (
    <div className="relative bg-white rounded-[20px] border border-slate-200 p-7 flex flex-col shadow-sm max-w-sm mx-auto overflow-hidden h-[260px] justify-between transition-all hover:shadow-md">
      {!parceiro.ativo && (
        <span className="absolute top-3 right-3 bg-slate-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-20 uppercase">Inativo</span>
      )}
      
      <div className="flex items-start justify-between">
        {/* Logo or Icon */}
        {parceiro.logoUrl ? (
          <div className="relative w-14 h-14 rounded-xl border border-slate-100 overflow-hidden bg-white">
            <Image src={parceiro.logoUrl} alt={parceiro.nome} fill className="object-contain p-1" />
          </div>
        ) : (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${colors.bg}`}>
            {getIcon(parceiro.tipo)}
          </div>
        )}

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${colors.badge}`}>
          {parceiro.tipo || "Outro"}
        </span>
      </div>

      <div className="my-auto pt-3">
        <h4 className="text-lg font-bold text-slate-900 leading-tight">{parceiro.nome || "Nome do Parceiro"}</h4>
        <p className="text-xl font-extrabold text-blue-600 mt-1 leading-none font-serif">{parceiro.desconto || "Desconto aplicado"}</p>
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate max-w-[85%]">{parceiro.contato || "Como utilizar o benefício"}</span>
        <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Modal: Novo Parceiro ────────────────────────────────────────────────────
function ModalNovoParceiro({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Parceiro) => void }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Farmácia");
  const [desconto, setDesconto] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!desconto.trim()) { setErro("Desconto é obrigatório."); return; }

    setCriando(true); setErro("");
    try {
      const r = await fetch("/api/admin/parceiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          tipo,
          desconto: desconto.trim(),
          ativo: false, // Inicia inativo para configurar
        }),
      });
      if (!r.ok) throw new Error();
      const { parceiro } = await r.json();
      onCreate(parceiro);
    } catch {
      setErro("Erro ao criar parceiro. Tente novamente.");
    } finally { setCriando(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Novo Parceiro</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Negócio</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 bg-white">
              <option value="Farmácia">💊 Farmácia</option>
              <option value="Clínica / Saúde">🏥 Clínica / Saúde</option>
              <option value="Odontologia">🦷 Odontologia</option>
              <option value="Exames e Laboratório">🔬 Exames e Laboratório</option>
              <option value="Educação">🎓 Educação</option>
              <option value="Lazer e Varejo">🎟️ Lazer e Varejo</option>
              <option value="Outro">💼 Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome do Parceiro *</label>
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Drogasil"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Desconto Aplicado *</label>
            <input value={desconto} onChange={(e) => setDesconto(e.target.value)} placeholder="Ex: Até 60% de desconto"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">⚠ O parceiro será criado como <strong>inativo</strong>. Adicione contato, envie a logo e ative-o quando estiver pronto.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={criando} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {criando ? "Criando..." : "Criar Parceiro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Confirmar exclusão ────────────────────────────────────────────────
function ModalConfirmarDelete({ parceiro, onClose, onConfirm, excluindo }: {
  parceiro: Parceiro; onClose: () => void; onConfirm: () => void; excluindo: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Excluir parceiro?</h2>
          <p className="text-slate-500 text-sm mb-1">
            Você está prestes a excluir o parceiro <strong>{parceiro.nome}</strong>.
          </p>
          <p className="text-red-600 text-xs font-medium mb-6">Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={excluindo} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={excluindo} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
              {excluindo ? "Excluindo..." : "Sim, excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ParceirosPage() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Parceiro | null>(null);
  
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const headers = { "Content-Type": "application/json" };

  const showToast = (msg: string, tipo: "ok" | "erro") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchParceiros = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/parceiros");
      if (!r.ok) throw new Error();
      const { parceiros: data } = await r.json();
      setParceiros(data);
      if (data.length > 0 && !selecionadoId) {
        setSelecionadoId(data[0].id);
        setEditando(structuredClone(data[0]));
      }
    } catch {
      setErro("Erro ao carregar parceiros.");
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchParceiros(); }, [fetchParceiros]);

  const selecionar = (parceiro: Parceiro) => { 
    setSelecionadoId(parceiro.id); 
    setEditando(structuredClone(parceiro)); 
  };

  const original = parceiros.find((p) => p.id === selecionadoId);
  const alterado = editando && original ? JSON.stringify(editando) !== JSON.stringify(original) : false;

  const salvar = async () => {
    if (!editando) return;
    setSalvando(true);
    try {
      const r = await fetch("/api/admin/parceiros", { method: "PATCH", headers, body: JSON.stringify(editando) });
      if (!r.ok) throw new Error();
      const { parceiro } = await r.json();
      setParceiros((prev) => prev.map((p) => (p.id === parceiro.id ? parceiro : p)));
      setEditando(structuredClone(parceiro));
      showToast("Parceiro salvo com sucesso!", "ok");
    } catch { 
      showToast("Erro ao salvar parceiro.", "erro"); 
    } finally { 
      setSalvando(false); 
    }
  };

  const excluir = async () => {
    if (!editando) return;
    setExcluindo(true);
    try {
      const r = await fetch("/api/admin/parceiros", { method: "DELETE", headers, body: JSON.stringify({ id: editando.id }) });
      const json = await r.json();
      if (!r.ok) { showToast(json.error ?? "Erro ao excluir.", "erro"); return; }
      
      const restantes = parceiros.filter((p) => p.id !== editando.id);
      setParceiros(restantes);
      setSelecionadoId(restantes[0]?.id ?? null);
      setEditando(restantes[0] ? structuredClone(restantes[0]) : null);
      setShowDeleteModal(false);
      showToast("Parceiro excluído.", "ok");
    } catch { 
      showToast("Erro ao excluir. Tente novamente.", "erro"); 
    } finally { 
      setExcluindo(false); 
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const r = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!r.ok) throw new Error();
      const { url } = await r.json();
      
      setEditando((prev) => {
        if (!prev) return prev;
        return { ...prev, logoUrl: url };
      });
      showToast("Logo carregado com sucesso!", "ok");
    } catch {
      showToast("Erro ao enviar a imagem de logo.", "erro");
    } finally {
      setUploadingLogo(false);
    }
  };

  const campo = <K extends keyof Parceiro>(key: K, value: Parceiro[K]) =>
    setEditando((prev) => prev ? { ...prev, [key]: value } : prev);

  const handleCriado = (parceiro: Parceiro) => {
    setParceiros((prev) => [...prev, parceiro]);
    selecionar(parceiro);
    setShowModal(false);
    showToast("Parceiro criado! Complete os detalhes e ative.", "ok");
  };

  if (loading) return <main className="flex-1 p-8 flex items-center justify-center"><div className="w-7 h-7 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" /></main>;
  if (erro) return <main className="flex-1 p-8"><p className="text-red-600 text-sm font-semibold">{erro}</p></main>;

  return (
    <main className="flex-1 p-6 lg:p-8 min-h-0">
      {showModal && <ModalNovoParceiro onClose={() => setShowModal(false)} onCreate={handleCriado} />}
      {showDeleteModal && editando && (
        <ModalConfirmarDelete parceiro={editando} onClose={() => setShowDeleteModal(false)} onConfirm={excluir} excluindo={excluindo} />
      )}

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-40 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2 ${toast.tipo === "ok" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.tipo === "ok" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-7 flex items-center justify-between lg:pl-0 pl-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clube de Parceiros</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie a rede de parceiros conveniados e os descontos oferecidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Parceiro
          </button>
          <button onClick={salvar} disabled={!alterado || salvando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {salvando
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Salvando...</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Salvar alterações</>
            }
          </button>
        </div>
      </div>

      {/* Select list */}
      <div className="flex flex-wrap gap-3 mb-8">
        {parceiros.map((parce) => {
          const ativo = parce.id === selecionadoId;
          const badges: Record<string, string> = {
            "Farmácia": "bg-emerald-100 text-emerald-700",
            "Clínica / Saúde": "bg-blue-100 text-blue-700",
            "Odontologia": "bg-cyan-100 text-cyan-700",
            "Exames e Laboratório": "bg-sky-100 text-sky-700",
            "Educação": "bg-indigo-100 text-indigo-700",
            "Lazer e Varejo": "bg-rose-100 text-rose-700",
            "Outro": "bg-slate-100 text-slate-700",
          };
          return (
            <button key={parce.id} onClick={() => selecionar(parce)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${ativo ? `border-blue-500 bg-white shadow-md` : "border-slate-200 bg-white hover:border-slate-300"}`}>
              {ativo && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />}
              <div className="text-xl">
                {parce.tipo.includes("Farm") && "💊"}
                {parce.tipo.includes("Clín") && "🏥"}
                {parce.tipo.includes("Odon") && "🦷"}
                {parce.tipo.includes("Exam") && "🔬"}
                {parce.tipo.includes("Educ") && "🎓"}
                {parce.tipo.includes("Laze") && "🎟️"}
                {!["Farm","Clín","Odon","Exam","Educ","Laze"].some(k => parce.tipo.includes(k)) && "💼"}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs truncate max-w-[130px]">{parce.nome}</p>
                <p className="text-slate-400 text-[10px] truncate max-w-[130px]">{parce.desconto}</p>
              </div>
              <div className="flex flex-col gap-1 ml-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-none whitespace-nowrap ${badges[parce.tipo] || "bg-slate-100 text-slate-700"}`}>
                  {parce.tipo.split(" ")[0]}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${parce.ativo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {parce.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor + Preview Split */}
      {editando && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
              Editando Parceiro: <span className="text-blue-600">{editando.nome}</span>
              {alterado && <span className="ml-2 text-xs text-amber-500 font-medium">• alterações pendentes</span>}
            </p>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Negócio</label>
              <select value={editando.tipo} onChange={(e) => campo("tipo", e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 bg-white">
                <option value="Farmácia">💊 Farmácia</option>
                <option value="Clínica / Saúde">🏥 Clínica / Saúde</option>
                <option value="Odontologia">🦷 Odontologia</option>
                <option value="Exames e Laboratório">🔬 Exames e Laboratório</option>
                <option value="Educação">🎓 Educação</option>
                <option value="Lazer e Varejo">🎟️ Lazer e Varejo</option>
                <option value="Outro">💼 Outro</option>
              </select>
            </div>

            {/* Nome + Desconto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome do Parceiro</label>
                <input value={editando.nome} onChange={(e) => campo("nome", e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Desconto Aplicado</label>
                <input value={editando.desconto} onChange={(e) => campo("desconto", e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
            </div>

            {/* Contato + Ordem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contato / Regra de Uso</label>
                <input value={editando.contato ?? ""} onChange={(e) => campo("contato", e.target.value || null)} placeholder="Ex: Válido com carteirinha virtual"
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ordem de Exibição</label>
                <input type="number" value={editando.ordem} onChange={(e) => campo("ordem", parseInt(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
            </div>

            {/* Toggles */}
            <div className="bg-slate-50 rounded-xl p-4">
              <Toggle label="Parceiro Ativo" sub="Desative para ocultar da landing page imediatamente" checked={editando.ativo} onChange={(v) => campo("ativo", v)} />
            </div>

            {/* Logo Image Upload */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Logo do Parceiro (Imagem PNG/JPG)</p>
              {editando.logoUrl ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <Image src={editando.logoUrl} alt={editando.nome} fill className="object-contain p-1" />
                  </div>
                  <button 
                    onClick={() => campo("logoUrl", null)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors font-bold"
                  >
                    Remover logo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <input 
                    type="file" 
                    onChange={uploadFile}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*"
                  />
                  {uploadingLogo && <p className="text-xs text-blue-600 font-medium">Carregando imagem de logo...</p>}
                </div>
              )}
            </div>

            {/* Actions */}
            <button onClick={salvar} disabled={!alterado || salvando || uploadingLogo}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {salvando ? "Salvando..." : alterado ? "Salvar alterações" : "Sem alterações pendentes"}
            </button>

            {/* Danger Zone */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Zona de Perigo</p>
              <button onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir este parceiro
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-1">
              Pré-visualização (como aparece no site)
            </p>
            <PreviewCard parceiro={editando} />
            
            {alterado && (
              <p className="text-xs text-amber-600 font-medium mt-3 px-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
                </svg>
                Alterações pendentes — site ainda exibe a versão anterior.
              </p>
            )}
            {!alterado && !salvando && original?.ativo && (
              <p className="text-xs text-green-600 font-medium mt-3 px-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Este parceiro está ativo e sendo exibido na landing page.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
