"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Plano {
  id: string;
  slug: string;
  nome: string;
  tagline: string;
  preco: number;
  cobertura: number;
  icone: string;
  ativo: boolean;
  destaque: boolean;
  badge: string | null;
  beneficios: string[];
  ausentes: string[];
  ordem: number;
}

const SLUG_STYLE: Record<string, { border: string }> = {
  essencial: { border: "border-slate-300" },
  familia:   { border: "border-blue-400"  },
  premium:   { border: "border-amber-400" },
};
const DEFAULT_STYLE = { border: "border-slate-200" };

const EMOJI_OPTIONS = [
  "🌿","🌱","🌳","🍃","🌸","🌺","🌹","💐",
  "🏡","🏠","🤝","👨‍👩‍👧‍👦","❤️","💙","💛","💚",
  "⭐","✨","💎","🛡️","🕊️","🌟","🎯","📋",
  "🙋","👤","👪","🌻","💝","🏆","🎖️","📄",
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1 gap-4">
      <div>
        <p className="text-sm text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div onClick={() => onChange(!checked)} className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-slate-200"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

// ─── Picker de emoji ──────────────────────────────────────────────────────────
function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors bg-white text-sm font-medium text-slate-700">
        <span className="text-2xl">{value}</span>
        <span className="text-slate-400 text-xs">Trocar</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-64">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Escolha um ícone</p>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => { onChange(emoji); setOpen(false); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xl hover:bg-slate-100 transition-colors ${value === emoji ? "bg-blue-50 ring-2 ring-blue-400" : ""}`}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lista editável ───────────────────────────────────────────────────────────
function ItemList({ items, onAdd, onRemove, placeholder, iconColor = "text-blue-500" }: {
  items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void;
  placeholder: string; iconColor?: string;
}) {
  const [novo, setNovo] = useState("");
  const add = () => { const t = novo.trim(); if (t) { onAdd(t); setNovo(""); } };
  return (
    <div>
      <div className="space-y-1.5 mb-2">
        {items.length === 0 && <p className="text-slate-400 text-xs italic px-1">Nenhum item ainda.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 group">
            <svg className={`w-3.5 h-3.5 ${iconColor} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-slate-700 flex-1 leading-tight">{item}</span>
            <button onClick={() => onRemove(i)} className="text-slate-300 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={placeholder}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none bg-white text-slate-700 placeholder:text-slate-400" />
        <button onClick={add} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-colors">+</button>
      </div>
    </div>
  );
}

// ─── Preview ──────────────────────────────────────────────────────────────────
function PreviewCard({ plano }: { plano: Plano }) {
  const col = SLUG_STYLE[plano.slug] ?? DEFAULT_STYLE;
  return (
    <div className={`relative bg-white rounded-2xl border-2 ${col.border} p-6 flex flex-col ${plano.destaque ? "shadow-xl shadow-blue-100" : ""}`}>
      {plano.badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">{plano.badge}</span>
      )}
      {!plano.ativo && (
        <span className="absolute top-3 right-3 bg-slate-300 text-white text-xs font-bold px-2 py-0.5 rounded-full">Inativo</span>
      )}
      <div className="mb-6">
        <div className="text-3xl mb-3">{plano.icone}</div>
        <h3 className="font-bold text-xl text-slate-900 mb-1">{plano.nome}</h3>
        <p className="text-slate-500 text-sm">{plano.tagline}</p>
      </div>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-end gap-1">
          <span className="text-slate-400 text-sm">R$</span>
          <span className="text-4xl font-bold text-slate-900">{plano.preco}</span>
          <span className="text-slate-400 text-sm mb-1">/mês</span>
        </div>
        {plano.cobertura > 0 && (
          <p className="text-xs text-slate-500 font-medium">
            Cobertura funeral de R$ {plano.cobertura.toLocaleString("pt-BR")}
          </p>
        )}
      </div>
      <ul className="space-y-2.5 flex-1">
        {plano.beneficios.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-slate-700">{b}</span>
          </li>
        ))}
        {plano.ausentes.map((a, i) => (
          <li key={i} className="flex items-start gap-2 text-sm opacity-35">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-slate-500">{a}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-5 text-center px-4 py-2.5 rounded-xl font-semibold text-sm border-2 ${col.border} text-slate-600`}>
        Quero este plano
      </div>
    </div>
  );
}

// ─── Modal: Novo Plano ────────────────────────────────────────────────────────
function ModalNovoPlano({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Plano) => void }) {
  const [nome, setNome] = useState("");
  const [tagline, setTagline] = useState("");
  const [preco, setPreco] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [icone, setIcone] = useState("📄");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro("Nome obrigatório."); return; }
    if (!preco || isNaN(Number(preco)) || Number(preco) <= 0) { setErro("Preço inválido."); return; }
    setCriando(true); setErro("");
    try {
      const r = await fetch("/api/admin/planos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          tagline: tagline.trim(),
          preco: parseInt(preco),
          cobertura: parseInt(cobertura) || 0,
          icone,
        }),
      });
      if (!r.ok) throw new Error();
      const { plano } = await r.json();
      onCreate(plano);
    } catch {
      setErro("Erro ao criar plano. Tente novamente.");
    } finally { setCriando(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Novo Plano</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Ícone</label>
            <EmojiPicker value={icone} onChange={setIcone} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome do plano *</label>
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Plano Senior"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Ex: Proteção especial para a melhor idade"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Preço (R$/mês) *</label>
              <input type="number" min={1} value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex: 79"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Cobertura (R$)</label>
              <input type="number" min={0} value={cobertura} onChange={(e) => setCobertura(e.target.value)} placeholder="Ex: 2500"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
            </div>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">⚠ O plano será criado como <strong>inativo</strong>. Configure as coberturas e ative quando estiver pronto.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={criando} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {criando ? "Criando..." : "Criar plano"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Confirmar exclusão ────────────────────────────────────────────────
function ModalConfirmarDelete({ plano, onClose, onConfirm, excluindo }: {
  plano: Plano; onClose: () => void; onConfirm: () => void; excluindo: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Excluir plano?</h2>
          <p className="text-slate-500 text-sm mb-1">
            Você está prestes a excluir o plano <strong>{plano.icone} {plano.nome}</strong>.
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
export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Plano | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const headers = { "Content-Type": "application/json" };

  const showToast = (msg: string, tipo: "ok" | "erro") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlanos = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/planos");
      if (!r.ok) throw new Error();
      const { planos: data } = await r.json();
      setPlanos(data);
      if (data.length > 0 && !selecionadoId) {
        setSelecionadoId(data[0].id);
        setEditando(structuredClone(data[0]));
      }
    } catch {
      setErro("Erro ao carregar planos.");
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchPlanos(); }, [fetchPlanos]);

  const selecionar = (plano: Plano) => { setSelecionadoId(plano.id); setEditando(structuredClone(plano)); };

  const original = planos.find((p) => p.id === selecionadoId);
  const alterado = editando && original ? JSON.stringify(editando) !== JSON.stringify(original) : false;

  const salvar = async () => {
    if (!editando) return;
    setSalvando(true);
    try {
      const r = await fetch("/api/admin/planos", { method: "PATCH", headers, body: JSON.stringify(editando) });
      if (!r.ok) throw new Error();
      const { plano } = await r.json();
      setPlanos((prev) => prev.map((p) => (p.id === plano.id ? plano : p)));
      setEditando(structuredClone(plano));
      showToast("Plano salvo! Alterações já estão no site.", "ok");
    } catch { showToast("Erro ao salvar. Tente novamente.", "erro"); }
    finally { setSalvando(false); }
  };

  const excluir = async () => {
    if (!editando) return;
    setExcluindo(true);
    try {
      const r = await fetch("/api/admin/planos", { method: "DELETE", headers, body: JSON.stringify({ id: editando.id }) });
      const json = await r.json();
      if (!r.ok) { showToast(json.error ?? "Erro ao excluir.", "erro"); return; }
      const restantes = planos.filter((p) => p.id !== editando.id);
      setPlanos(restantes);
      setSelecionadoId(restantes[0]?.id ?? null);
      setEditando(restantes[0] ? structuredClone(restantes[0]) : null);
      setShowDeleteModal(false);
      showToast("Plano excluído.", "ok");
    } catch { showToast("Erro ao excluir. Tente novamente.", "erro"); }
    finally { setExcluindo(false); }
  };

  const campo = <K extends keyof Plano>(key: K, value: Plano[K]) =>
    setEditando((prev) => prev ? { ...prev, [key]: value } : prev);

  const addBeneficio = (v: string) => setEditando((p) => p ? { ...p, beneficios: [...p.beneficios, v] } : p);
  const remBeneficio = (i: number) => setEditando((p) => p ? { ...p, beneficios: p.beneficios.filter((_, j) => j !== i) } : p);
  const addAusente   = (v: string) => setEditando((p) => p ? { ...p, ausentes: [...p.ausentes, v] } : p);
  const remAusente   = (i: number) => setEditando((p) => p ? { ...p, ausentes: p.ausentes.filter((_, j) => j !== i) } : p);

  const handleCriado = (plano: Plano) => {
    setPlanos((prev) => [...prev, plano]);
    selecionar(plano);
    setShowModal(false);
    showToast("Plano criado! Configure as coberturas e ative quando pronto.", "ok");
  };

  if (loading) return <main className="flex-1 p-8 flex items-center justify-center"><div className="w-7 h-7 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" /></main>;
  if (erro) return <main className="flex-1 p-8"><p className="text-red-600 text-sm font-semibold">{erro}</p></main>;

  return (
    <main className="flex-1 p-6 lg:p-8 min-h-0">
      {showModal && <ModalNovoPlano onClose={() => setShowModal(false)} onCreate={handleCriado} />}
      {showDeleteModal && editando && (
        <ModalConfirmarDelete plano={editando} onClose={() => setShowDeleteModal(false)} onConfirm={excluir} excluindo={excluindo} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-40 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2 ${toast.tipo === "ok" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.tipo === "ok" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-7 flex items-center justify-between lg:pl-0 pl-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planos</h1>
          <p className="text-slate-500 text-sm mt-1">Alterações salvas refletem imediatamente no site.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Plano
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

      {/* Seletor */}
      <div className="flex flex-wrap gap-3 mb-8">
        {planos.map((plano) => {
          const col = SLUG_STYLE[plano.slug] ?? DEFAULT_STYLE;
          const ativo = plano.id === selecionadoId;
          return (
            <button key={plano.id} onClick={() => selecionar(plano)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${ativo ? `${col.border} bg-white shadow-md` : "border-slate-200 bg-white hover:border-slate-300"}`}>
              {ativo && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500" />}
              <span className="text-xl">{plano.icone}</span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{plano.nome}</p>
                <p className="text-slate-400 text-xs">R$ {plano.preco}/mês</p>
              </div>
              <div className="flex flex-col gap-1 ml-2">
                {plano.destaque && <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full leading-none">★ Destaque</span>}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${plano.ativo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {plano.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor + Preview */}
      {editando && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
              Editando: <span className="text-blue-600">{editando.icone} {editando.nome}</span>
              {alterado && <span className="ml-2 text-xs text-amber-500 font-medium">• não salvo</span>}
            </p>

            {/* Ícone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Ícone do plano</label>
              <EmojiPicker value={editando.icone} onChange={(v) => campo("icone", v)} />
            </div>

            {/* Nome + Preço + Cobertura */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome</label>
                <input value={editando.nome} onChange={(e) => campo("nome", e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Preço (R$/mês)</label>
                <input type="number" min={1} value={editando.preco} onChange={(e) => campo("preco", parseInt(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Cobertura (R$)</label>
                <input type="number" min={0} value={editando.cobertura || 0} onChange={(e) => campo("cobertura", parseInt(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tagline</label>
              <input value={editando.tagline} onChange={(e) => campo("tagline", e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Badge <span className="text-slate-400 normal-case font-normal">(ex: "Mais escolhido")</span>
              </label>
              <input value={editando.badge ?? ""} onChange={(e) => campo("badge", e.target.value || null)}
                placeholder="Deixe em branco para não exibir"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
            </div>

            {/* Toggles */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <Toggle label="Ativo — visível no site" sub="Desative para ocultar sem excluir" checked={editando.ativo} onChange={(v) => campo("ativo", v)} />
              <Toggle label="Destaque — escala maior com sombra" sub="Apenas um plano deve ter destaque" checked={editando.destaque} onChange={(v) => campo("destaque", v)} />
            </div>

            {/* Benefícios */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Coberturas incluídas</label>
              <ItemList items={editando.beneficios} onAdd={addBeneficio} onRemove={remBeneficio} placeholder="Ex: Translado nacional gratuito" iconColor="text-blue-500" />
            </div>

            {/* Ausentes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Itens não incluídos <span className="text-slate-400 normal-case font-normal">(aparecem riscados)</span>
              </label>
              <ItemList items={editando.ausentes} onAdd={addAusente} onRemove={remAusente} placeholder="Ex: Translado internacional" iconColor="text-slate-400" />
            </div>

            {/* Salvar */}
            <button onClick={salvar} disabled={!alterado || salvando}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {salvando ? "Salvando..." : alterado ? "Salvar alterações" : "Sem alterações pendentes"}
            </button>

            {/* Zona de perigo */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Zona de perigo</p>
              <button onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir este plano
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-1">
              Pré-visualização (como aparece no site)
            </p>
            <PreviewCard plano={editando} />
            {alterado && (
              <p className="text-xs text-amber-600 font-medium mt-3 px-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
                </svg>
                Alterações não salvas — site ainda mostra a versão anterior
              </p>
            )}
            {!alterado && !salvando && original?.ativo && (
              <p className="text-xs text-green-600 font-medium mt-3 px-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Este é exatamente o que está sendo exibido no site agora
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
