"use client";

import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  ultimoAcesso: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

type ModalState =
  | { tipo: "fechado" }
  | { tipo: "novo" }
  | { tipo: "editar"; usuario: Usuario }
  | { tipo: "senha"; usuario: Usuario }
  | { tipo: "deletar"; usuario: Usuario };

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(nome: string) {
  const parts = nome.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtDatetime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

function avatarColor(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

// ── CampoSenha ────────────────────────────────────────────────────────────────
function CampoSenha({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Modal base ────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}

// ── ModalNovoUsuario ──────────────────────────────────────────────────────────
function ModalNovoUsuario({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!email.trim()) { setErro("E-mail é obrigatório."); return; }
    if (senha.length < 6) { setErro("Senha deve ter ao menos 6 caracteres."); return; }
    if (senha !== confirma) { setErro("As senhas não coincidem."); return; }

    setSalvando(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error ?? "Erro ao criar usuário."); return; }
      onSaved();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Novo usuário</h2>
          <p className="text-slate-500 text-sm mt-0.5">Preencha os dados para criar o acesso.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Silva"
              autoFocus
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: maria@amavidas.com.br"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <CampoSenha label="Senha" value={senha} onChange={setSenha} placeholder="Mín. 6 caracteres" />
          <CampoSenha label="Confirmar senha" value={confirma} onChange={setConfirma} placeholder="Repita a senha" />
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-600 text-sm">{erro}</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {salvando ? "Criando…" : "Criar usuário"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── ModalEditar ───────────────────────────────────────────────────────────────
function ModalEditar({
  usuario,
  onClose,
  onSaved,
}: {
  usuario: Usuario;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!email.trim()) { setErro("E-mail é obrigatório."); return; }

    setSalvando(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuario.id, nome, email }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error ?? "Erro ao salvar."); return; }
      onSaved();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Editar usuário</h2>
          <p className="text-slate-500 text-sm mt-0.5">Altere os dados de {usuario.nome}.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-600 text-sm">{erro}</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── ModalSenha ────────────────────────────────────────────────────────────────
function ModalSenha({
  usuario,
  onClose,
  onSaved,
}: {
  usuario: Usuario;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (novaSenha.length < 6) { setErro("Senha deve ter ao menos 6 caracteres."); return; }
    if (novaSenha !== confirma) { setErro("As senhas não coincidem."); return; }

    setSalvando(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuario.id, novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error ?? "Erro ao alterar senha."); return; }
      onSaved();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Alterar senha</h2>
          <p className="text-slate-500 text-sm mt-0.5">Nova senha para <strong>{usuario.nome}</strong>.</p>
        </div>
        <div className="p-6 space-y-4">
          <CampoSenha label="Nova senha" value={novaSenha} onChange={setNovaSenha} placeholder="Mín. 6 caracteres" autoFocus />
          <CampoSenha label="Confirmar nova senha" value={confirma} onChange={setConfirma} placeholder="Repita a senha" />
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-600 text-sm">{erro}</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {salvando ? "Alterando…" : "Alterar senha"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── ModalDeletar ──────────────────────────────────────────────────────────────
function ModalDeletar({
  usuario,
  onClose,
  onDeleted,
}: {
  usuario: Usuario;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [erro, setErro] = useState("");
  const [deletando, setDeletando] = useState(false);

  async function handleDelete() {
    setErro("");
    setDeletando(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuario.id }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error ?? "Erro ao excluir."); return; }
      onDeleted();
    } finally {
      setDeletando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Excluir usuário</h2>
        <p className="text-slate-500 text-sm mb-4">
          Você está prestes a excluir <strong>{usuario.nome}</strong>. Esta ação não pode ser desfeita.
        </p>
        {erro && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-4">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-600 text-sm">{erro}</span>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deletando}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deletando ? "Excluindo…" : "Sim, excluir"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, tipo }: { msg: string; tipo: "ok" | "erro" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all ${
      tipo === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    }`}>
      {tipo === "ok" ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {msg}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modal, setModal] = useState<ModalState>({ tipo: "fechado" });
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  function showToast(msg: string, tipo: "ok" | "erro" = "ok") {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/usuarios");
      const data = await res.json();
      setUsuarios(data.usuarios ?? []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function toggleAtivo(u: Usuario) {
    const res = await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, ativo: !u.ativo }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error ?? "Erro ao atualizar.", "erro"); return; }
    showToast(u.ativo ? "Usuário desativado." : "Usuário ativado.");
    carregar();
  }

  const total = usuarios.length;
  const ativos = usuarios.filter((u) => u.ativo).length;
  const inativos = total - ativos;

  return (
    <main className="flex-1 p-6 lg:p-8 min-w-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <button
          onClick={() => setModal({ tipo: "novo" })}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo usuário
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total", value: total, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Ativos", value: ativos, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Inativos", value: inativos, color: "text-slate-500", bg: "bg-slate-50" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`text-3xl font-bold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-slate-500 text-sm">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {carregando ? (
          <div className="py-20 text-center text-slate-400 text-sm">Carregando…</div>
        ) : usuarios.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">Nenhum usuário cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Último acesso</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Criado em</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Avatar + info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(u.id)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">{initials(u.nome)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.nome}</div>
                          <div className="text-slate-400 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Último acesso */}
                    <td className="px-5 py-4 text-slate-500 hidden md:table-cell">
                      {fmtDatetime(u.ultimoAcesso)}
                    </td>

                    {/* Criado em */}
                    <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">
                      {fmtDate(u.criadoEm)}
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleAtivo(u)}
                        title={u.ativo ? "Desativar" : "Ativar"}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          u.ativo
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.ativo ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Editar */}
                        <button
                          onClick={() => setModal({ tipo: "editar", usuario: u })}
                          title="Editar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Senha */}
                        <button
                          onClick={() => setModal({ tipo: "senha", usuario: u })}
                          title="Alterar senha"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        {/* Deletar */}
                        <button
                          onClick={() => setModal({ tipo: "deletar", usuario: u })}
                          title="Excluir"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security info */}
      <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <p className="text-blue-800 text-sm font-semibold mb-0.5">Senhas protegidas com scrypt</p>
          <p className="text-blue-600 text-xs leading-relaxed">
            As senhas são armazenadas como hash derivado com scrypt + salt aleatório. Nunca ficam em texto puro no banco de dados.
          </p>
        </div>
      </div>

      {/* Modals */}
      {modal.tipo === "novo" && (
        <ModalNovoUsuario
          onClose={() => setModal({ tipo: "fechado" })}
          onSaved={() => { setModal({ tipo: "fechado" }); showToast("Usuário criado com sucesso!"); carregar(); }}
        />
      )}
      {modal.tipo === "editar" && (
        <ModalEditar
          usuario={modal.usuario}
          onClose={() => setModal({ tipo: "fechado" })}
          onSaved={() => { setModal({ tipo: "fechado" }); showToast("Dados atualizados!"); carregar(); }}
        />
      )}
      {modal.tipo === "senha" && (
        <ModalSenha
          usuario={modal.usuario}
          onClose={() => setModal({ tipo: "fechado" })}
          onSaved={() => { setModal({ tipo: "fechado" }); showToast("Senha alterada com sucesso!"); carregar(); }}
        />
      )}
      {modal.tipo === "deletar" && (
        <ModalDeletar
          usuario={modal.usuario}
          onClose={() => setModal({ tipo: "fechado" })}
          onDeleted={() => { setModal({ tipo: "fechado" }); showToast("Usuário excluído."); carregar(); }}
        />
      )}

      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
    </main>
  );
}
