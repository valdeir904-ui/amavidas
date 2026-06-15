"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Depoimento {
  id: string;
  nome: string;
  cidade: string;
  relacao: string | null;
  texto: string | null;
  tipo: string; // "video" | "imagem" | "audio" | "texto"
  mediaUrl: string | null;
  fotoUrl: string | null;
  ativo: boolean;
  ordem: number;
}

// Helper to format audio duration (like in Testimonials component)
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r < 10 ? "0" : ""}${r}`;
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
function PreviewCard({ depoimento }: { depoimento: Depoimento }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset audio playback simulations when testimonial changes
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [depoimento.id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (playing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const initials = depoimento.nome
    ? depoimento.nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="relative bg-gradient-to-br from-white to-slate-50/60 rounded-[20px] border border-slate-200 p-8 flex flex-col shadow-md max-w-lg mx-auto overflow-hidden h-[480px] justify-between">
      {!depoimento.ativo && (
        <span className="absolute top-3 right-3 bg-slate-400 text-white text-xs font-bold px-2 py-0.5 rounded-full z-20">Inativo</span>
      )}
      
      {/* Glows decorativos de fundo */}
      <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-12 -left-12 w-44 h-44 bg-teal-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      
      {/* Dynamic Render based on type */}
      {depoimento.tipo === "video" && (
        <div className="w-full h-full flex flex-col justify-between relative z-10">
          <div className="w-full h-[300px] rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {depoimento.mediaUrl ? (
              (() => {
                const url = depoimento.mediaUrl;
                const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
                if (isYoutube) {
                  let videoId = "";
                  if (url.includes("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
                  } else if (url.includes("v=")) {
                    videoId = url.split("v=")[1]?.split(/[&?#]/)[0];
                  } else if (url.includes("embed/")) {
                    videoId = url.split("embed/")[1]?.split(/[?#]/)[0];
                  }
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                );
              })()
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-2 px-4 text-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
                </svg>
                Nenhum vídeo carregado
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e3d4d8] to-[#c9b5bd] text-[#6f4a55] font-serif font-semibold text-lg flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">{depoimento.nome || "Nome do Cliente"}</div>
              <div className="text-xs text-slate-400">
                {depoimento.cidade || "Cidade, UF"}{depoimento.relacao ? ` · ${depoimento.relacao}` : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {depoimento.tipo === "imagem" && (
        <div className="w-full h-full flex flex-col justify-between relative z-10">
          <div className="w-full h-[300px] rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden group cursor-pointer">
            {depoimento.mediaUrl ? (
              <div className="w-full h-full relative">
                <img 
                  src={depoimento.mediaUrl} 
                  alt="Chat print preview" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-2 px-4 text-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a1 1 0 011.414 0L18 20M7 15h1m-1 4h.01m-9 2h12a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 00-2 2zm3-13a1 1 0 112 0 1 1 0 01-2 0z" />
                </svg>
                Nenhuma foto ou print carregado
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e3d4d8] to-[#c9b5bd] text-[#6f4a55] font-serif font-semibold text-lg flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">{depoimento.nome || "Nome do Cliente"}</div>
              <div className="text-xs text-slate-400">
                {depoimento.cidade || "Cidade, UF"}{depoimento.relacao ? ` · ${depoimento.relacao}` : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote for audio and text types */}
      {(depoimento.tipo === "audio" || depoimento.tipo === "texto") && (
        <div className="w-full h-full flex flex-col justify-between relative z-10">
          <div className="relative flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-2 pointer-events-none select-none font-serif text-teal-100 z-0 text-[90px] leading-none">
              &ldquo;
            </div>
            <div className="relative z-10 m-0 font-serif text-[18px] leading-relaxed text-slate-800 overflow-y-auto max-h-[190px] pr-2 scrollbar-thin flex items-center">
              <span className="w-full block text-left">{depoimento.texto || "Insira o depoimento escrito aqui..."}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              {depoimento.fotoUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center">
                  <img src={depoimento.fotoUrl} alt={depoimento.nome} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e3d4d8] to-[#c9b5bd] text-[#6f4a55] font-serif font-semibold text-lg flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <div className="font-semibold text-sm text-slate-900">{depoimento.nome || "Nome do Cliente"}</div>
                <div className="text-xs text-slate-400">
                  {depoimento.cidade || "Cidade, UF"}{depoimento.relacao ? ` · ${depoimento.relacao}` : ""}
                </div>
              </div>
            </div>

            {/* Audio player if audio type */}
            {depoimento.tipo === "audio" && (
              <div className="mt-5 w-full">
                {depoimento.mediaUrl ? (
                  <audio src={depoimento.mediaUrl} controls className="w-full h-10" />
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-center">Nenhum áudio carregado</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal: Novo Depoimento ──────────────────────────────────────────────────
function ModalNovoDepoimento({ onClose, onCreate }: { onClose: () => void; onCreate: (d: Depoimento) => void }) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro("Nome obrigatório."); return; }
    if (!cidade.trim()) { setErro("Cidade obrigatória."); return; }

    setCriando(true); setErro("");
    try {
      const r = await fetch("/api/admin/depoimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          cidade: cidade.trim(),
          tipo,
          ativo: false, // Começa inativo para configurar
        }),
      });
      if (!r.ok) throw new Error();
      const { depoimento } = await r.json();
      onCreate(depoimento);
    } catch {
      setErro("Erro ao criar depoimento. Tente novamente.");
    } finally { setCriando(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Novo Depoimento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Depoimento</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: "texto", label: "Texto" },
                { val: "audio", label: "Áudio" },
                { val: "video", label: "Vídeo" },
                { val: "imagem", label: "Foto/Print" }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setTipo(opt.val)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${tipo === opt.val ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome do Cliente *</label>
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Rosângela Martins"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Cidade *</label>
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Águas Lindas, GO"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 placeholder:text-slate-400" />
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">⚠ O depoimento será criado como <strong>inativo</strong>. Carregue as mídias, preencha a cópia e ative quando estiver pronto.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={criando} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {criando ? "Criando..." : "Criar Depoimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Confirmar exclusão ────────────────────────────────────────────────
function ModalConfirmarDelete({ depoimento, onClose, onConfirm, excluindo }: {
  depoimento: Depoimento; onClose: () => void; onConfirm: () => void; excluindo: boolean;
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
          <h2 className="font-bold text-slate-900 text-lg mb-2">Excluir depoimento?</h2>
          <p className="text-slate-500 text-sm mb-1">
            Você está prestes a excluir o depoimento de <strong>{depoimento.nome}</strong>.
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
export default function DepoimentosPage() {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Depoimento | null>(null);
  
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const headers = { "Content-Type": "application/json" };

  const showToast = (msg: string, tipo: "ok" | "erro") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDepoimentos = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/depoimentos");
      if (!r.ok) throw new Error();
      const { depoimentos: data } = await r.json();
      setDepoimentos(data);
      if (data.length > 0 && !selecionadoId) {
        setSelecionadoId(data[0].id);
        setEditando(structuredClone(data[0]));
      }
    } catch {
      setErro("Erro ao carregar depoimentos.");
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchDepoimentos(); }, [fetchDepoimentos]);

  const selecionar = (depoimento: Depoimento) => { 
    setSelecionadoId(depoimento.id); 
    setEditando(structuredClone(depoimento)); 
  };

  const original = depoimentos.find((d) => d.id === selecionadoId);
  const alterado = editando && original ? JSON.stringify(editando) !== JSON.stringify(original) : false;

  const salvar = async () => {
    if (!editando) return;
    setSalvando(true);
    try {
      const r = await fetch("/api/admin/depoimentos", { method: "PATCH", headers, body: JSON.stringify(editando) });
      if (!r.ok) throw new Error();
      const { depoimento } = await r.json();
      setDepoimentos((prev) => prev.map((d) => (d.id === depoimento.id ? depoimento : d)));
      setEditando(structuredClone(depoimento));
      showToast("Depoimento salvo com sucesso!", "ok");
    } catch { 
      showToast("Erro ao salvar depoimento.", "erro"); 
    } finally { 
      setSalvando(false); 
    }
  };

  const excluir = async () => {
    if (!editando) return;
    setExcluindo(true);
    try {
      const r = await fetch("/api/admin/depoimentos", { method: "DELETE", headers, body: JSON.stringify({ id: editando.id }) });
      const json = await r.json();
      if (!r.ok) { showToast(json.error ?? "Erro ao excluir.", "erro"); return; }
      
      const restantes = depoimentos.filter((d) => d.id !== editando.id);
      setDepoimentos(restantes);
      setSelecionadoId(restantes[0]?.id ?? null);
      setEditando(restantes[0] ? structuredClone(restantes[0]) : null);
      setShowDeleteModal(false);
      showToast("Depoimento excluído.", "ok");
    } catch { 
      showToast("Erro ao excluir. Tente novamente.", "erro"); 
    } finally { 
      setExcluindo(false); 
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, isMedia: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isMedia) setUploadingMedia(true);
    else setUploadingFoto(true);

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
        return isMedia ? { ...prev, mediaUrl: url } : { ...prev, fotoUrl: url };
      });
      showToast("Upload concluído com sucesso!", "ok");
    } catch {
      showToast("Erro no envio do arquivo.", "erro");
    } finally {
      if (isMedia) setUploadingMedia(false);
      else setUploadingFoto(false);
    }
  };

  const campo = <K extends keyof Depoimento>(key: K, value: Depoimento[K]) =>
    setEditando((prev) => prev ? { ...prev, [key]: value } : prev);

  const handleCriado = (depoimento: Depoimento) => {
    setDepoimentos((prev) => [...prev, depoimento]);
    selecionar(depoimento);
    setShowModal(false);
    showToast("Depoimento criado! Complete as mídias e textos.", "ok");
  };

  if (loading) return <main className="flex-1 p-8 flex items-center justify-center"><div className="w-7 h-7 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" /></main>;
  if (erro) return <main className="flex-1 p-8"><p className="text-red-600 text-sm font-semibold">{erro}</p></main>;

  return (
    <main className="flex-1 p-6 lg:p-8 min-h-0">
      {showModal && <ModalNovoDepoimento onClose={() => setShowModal(false)} onCreate={handleCriado} />}
      {showDeleteModal && editando && (
        <ModalConfirmarDelete depoimento={editando} onClose={() => setShowDeleteModal(false)} onConfirm={excluir} excluindo={excluindo} />
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
          <h1 className="text-2xl font-bold text-slate-900">Depoimentos</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie a prova social, áudios, prints e vídeos de clientes AmaVidas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Depoimento
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

      {/* Select horizontal list */}
      <div className="flex flex-wrap gap-3 mb-8">
        {depoimentos.map((depo) => {
          const ativo = depo.id === selecionadoId;
          const badges: Record<string, string> = {
            video: "bg-purple-100 text-purple-700",
            audio: "bg-pink-100 text-pink-700",
            imagem: "bg-emerald-100 text-emerald-700",
            texto: "bg-blue-100 text-blue-700",
          };
          return (
            <button key={depo.id} onClick={() => selecionar(depo)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${ativo ? `border-blue-500 bg-white shadow-md` : "border-slate-200 bg-white hover:border-slate-300"}`}>
              {ativo && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />}
              <div className="text-xl">
                {depo.tipo === "video" && "🎥"}
                {depo.tipo === "audio" && "🎙️"}
                {depo.tipo === "imagem" && "💬"}
                {depo.tipo === "texto" && "✍️"}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs truncate max-w-[130px]">{depo.nome}</p>
                <p className="text-slate-400 text-[10px]">{depo.cidade}</p>
              </div>
              <div className="flex flex-col gap-1 ml-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-none ${badges[depo.tipo]}`}>
                  {depo.tipo}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${depo.ativo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {depo.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor + Preview Column Split */}
      {editando && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
              Editando Depoimento: <span className="text-blue-600">{editando.nome}</span>
              {alterado && <span className="ml-2 text-xs text-amber-500 font-medium">• alterações pendentes</span>}
            </p>

            {/* Tipo selector inline */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Depoimento</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: "texto", label: "✍️ Texto" },
                  { val: "audio", label: "🎙️ Áudio" },
                  { val: "video", label: "🎥 Vídeo" },
                  { val: "imagem", label: "💬 Foto/Print" }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => campo("tipo", opt.val)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${editando.tipo === opt.val ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Autor Nome + Cidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome do Cliente</label>
                <input value={editando.nome} onChange={(e) => campo("nome", e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cidade</label>
                <input value={editando.cidade} onChange={(e) => campo("cidade", e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900" />
              </div>
            </div>

            {/* Relacao / Ordem */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Relação / Mês e Ano</label>
                <input value={editando.relacao ?? ""} onChange={(e) => campo("relacao", e.target.value || null)} placeholder="Ex: março de 2026"
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
              <Toggle label="Depoimento Ativo" sub="Desative para ocultar do carrossel imediatamente" checked={editando.ativo} onChange={(v) => campo("ativo", v)} />
            </div>

            {/* Texto Escrito (For audio and text types) */}
            {(editando.tipo === "texto" || editando.tipo === "audio") && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Texto Escrito do Depoimento</label>
                <textarea rows={3} value={editando.texto ?? ""} onChange={(e) => campo("texto", e.target.value)}
                  placeholder="Cole aqui o depoimento que será exibido no card..."
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900 resize-y" />
              </div>
            )}

            {/* Media Upload handler based on type */}
            {editando.tipo !== "texto" && (
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Arquivo de Mídia ({editando.tipo === "video" && "Vídeo"}
                  {editando.tipo === "audio" && "Áudio mp3"}
                  {editando.tipo === "imagem" && "Foto/Print"})
                </p>

                {editando.mediaUrl && (
                  <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-4 font-mono">
                    <span className="truncate flex-1">{editando.mediaUrl}</span>
                    <button 
                      onClick={() => campo("mediaUrl", null)}
                      className="text-red-500 hover:text-red-700 transition-colors font-sans text-xs font-bold"
                    >
                      Remover
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  <input 
                    type="file" 
                    onChange={(e) => uploadFile(e, true)}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept={
                      editando.tipo === "audio" ? "audio/*" : 
                      editando.tipo === "video" ? "video/*" : "image/*"
                    }
                  />
                  {uploadingMedia && <p className="text-xs text-blue-600 font-medium">Carregando arquivo de mídia...</p>}

                  {editando.tipo === "video" && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 block mb-1">Ou informe uma URL externa de vídeo (ex: YouTube/Vimeo ou arquivo na CDN):</span>
                      <input 
                        type="text" 
                        value={editando.mediaUrl ?? ""} 
                        onChange={(e) => campo("mediaUrl", e.target.value || null)}
                        placeholder="https://..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Author Photo Upload (optional for audio/texto, generally hidden for pure prints or video if user wishes, but nice to have) */}
            {(editando.tipo === "texto" || editando.tipo === "audio") && (
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Foto do Autor (Opcional)</p>
                {editando.fotoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center">
                      <img src={editando.fotoUrl} alt={editando.nome} className="w-full h-full object-cover" />
                    </div>
                    <button 
                      onClick={() => campo("fotoUrl", null)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors font-bold"
                    >
                      Remover foto
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <input 
                      type="file" 
                      onChange={(e) => uploadFile(e, false)}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {uploadingFoto && <p className="text-xs text-blue-600 font-medium">Carregando foto...</p>}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <button onClick={salvar} disabled={!alterado || salvando || uploadingMedia || uploadingFoto}
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
                Excluir este depoimento
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-1">
              Pré-visualização (como aparece no site)
            </p>
            <PreviewCard depoimento={editando} />
            
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
                Este depoimento está ativo e sendo exibido na landing page.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
