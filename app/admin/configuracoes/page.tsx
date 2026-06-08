"use client";

import { useEffect, useState } from "react";

type Configs = Record<string, string>;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, tipo }: { msg: string; tipo: "ok" | "erro" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium ${
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

// ── Campo de texto ────────────────────────────────────────────────────────────
function Campo({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${
            prefix ? "rounded-r-xl" : "rounded-xl"
          }`}
        />
      </div>
    </div>
  );
}

// ── Seção card ────────────────────────────────────────────────────────────────
function Secao({
  titulo,
  descricao,
  icone,
  children,
  onSalvar,
  salvando,
  alterado,
}: {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  children: React.ReactNode;
  onSalvar: () => void;
  salvando: boolean;
  alterado: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white flex-shrink-0">
          {icone}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base">{titulo}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{descricao}</p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
      <div className="px-6 pb-5 flex items-center justify-between">
        {alterado ? (
          <span className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Alterações não salvas
          </span>
        ) : (
          <span className="text-xs text-slate-400">Sem alterações pendentes</span>
        )}
        <button
          onClick={onSalvar}
          disabled={salvando || !alterado}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

// ── Helpers de número WhatsApp ────────────────────────────────────────────────
function formatarWpp(raw: string) {
  // Mantém somente dígitos, max 13 (DDI + DDD + 9 dígitos)
  return raw.replace(/\D/g, "").slice(0, 13);
}

function exibirWpp(num: string) {
  // ex: 5511999999999 → +55 (11) 99999-9999
  const d = num.replace(/\D/g, "");
  if (d.length < 2) return d;
  const ddi = d.slice(0, 2);
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  if (!ddd) return `+${ddi}`;
  if (!rest) return `+${ddi} (${ddd})`;
  if (rest.length <= 4) return `+${ddi} (${ddd}) ${rest}`;
  const split = rest.length === 9 ? 5 : 4;
  return `+${ddi} (${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState<Configs>({});
  const [original, setOriginal] = useState<Configs>({});
  const [carregando, setCarregando] = useState(true);
  const [salvandoSecao, setSalvandoSecao] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  function showToast(msg: string, tipo: "ok" | "erro" = "ok") {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetch("/api/admin/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        setConfigs(data.configs ?? {});
        setOriginal(data.configs ?? {});
      })
      .finally(() => setCarregando(false));
  }, []);

  function set(key: string, val: string) {
    setConfigs((prev) => ({ ...prev, [key]: val }));
  }

  function alteradoIn(keys: string[]) {
    return keys.some((k) => configs[k] !== original[k]);
  }

  async function salvar(keys: string[], secao: string) {
    setSalvandoSecao(secao);
    try {
      const subset = Object.fromEntries(keys.map((k) => [k, configs[k] ?? ""]));
      const res = await fetch("/api/admin/configuracoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: subset }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Erro ao salvar.", "erro"); return; }
      setOriginal((prev) => ({ ...prev, ...data.configs }));
      showToast("Configurações salvas!");
    } finally {
      setSalvandoSecao(null);
    }
  }

  if (carregando) {
    return (
      <main className="flex-1 p-8">
        <div className="py-20 text-center text-slate-400 text-sm">Carregando…</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 lg:p-8 min-w-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Ajuste contatos, empresa e redes sociais sem precisar editar código.</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* ── Seção WhatsApp & Contato ── */}
        <Secao
          titulo="Contato"
          descricao="Número de WhatsApp, telefone e e-mail exibidos no site."
          icone={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          }
          onSalvar={() => salvar(["whatsapp", "telefone", "email_contato"], "contato")}
          salvando={salvandoSecao === "contato"}
          alterado={alteradoIn(["whatsapp", "telefone", "email_contato"])}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp comercial</label>
            <p className="text-xs text-slate-400 mb-1.5">
              Somente dígitos: DDI + DDD + número. Ex: <strong>5511999999999</strong>
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="tel"
                value={configs.whatsapp ?? ""}
                onChange={(e) => set("whatsapp", formatarWpp(e.target.value))}
                placeholder="5511999999999"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono"
              />
              {configs.whatsapp && (
                <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                  {exibirWpp(configs.whatsapp)}
                </span>
              )}
            </div>
            {configs.whatsapp && (
              <a
                href={`https://wa.me/${configs.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-green-600 hover:underline"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Testar link
              </a>
            )}
          </div>

          <Campo
            label="Telefone / 0800"
            hint="Exibido no rodapé e na página de contato (opcional)."
            value={configs.telefone ?? ""}
            onChange={(v) => set("telefone", v)}
            placeholder="0800 xxx xxxx ou (11) 3333-3333"
          />

          <Campo
            label="E-mail de contato"
            hint="E-mail exibido publicamente no site."
            value={configs.email_contato ?? ""}
            onChange={(v) => set("email_contato", v)}
            placeholder="contato@amavidas.com.br"
            type="email"
          />
        </Secao>

        {/* ── Seção Empresa ── */}
        <Secao
          titulo="Empresa"
          descricao="Dados institucionais da empresa."
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          onSalvar={() => salvar(["empresa_nome", "empresa_cnpj", "empresa_endereco"], "empresa")}
          salvando={salvandoSecao === "empresa"}
          alterado={alteradoIn(["empresa_nome", "empresa_cnpj", "empresa_endereco"])}
        >
          <Campo
            label="Nome da empresa"
            value={configs.empresa_nome ?? ""}
            onChange={(v) => set("empresa_nome", v)}
            placeholder="AmaVidas"
          />
          <Campo
            label="CNPJ"
            hint="Exibido no rodapé do site."
            value={configs.empresa_cnpj ?? ""}
            onChange={(v) => set("empresa_cnpj", v)}
            placeholder="00.000.000/0001-00"
          />
          <Campo
            label="Endereço"
            hint="Endereço completo da sede."
            value={configs.empresa_endereco ?? ""}
            onChange={(v) => set("empresa_endereco", v)}
            placeholder="Rua Exemplo, 123 — São Paulo, SP"
          />
        </Secao>

        {/* ── Seção Redes Sociais ── */}
        <Secao
          titulo="Redes sociais"
          descricao="Links exibidos no rodapé e nas páginas do site."
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
          onSalvar={() => salvar(["instagram", "facebook", "youtube"], "redes")}
          salvando={salvandoSecao === "redes"}
          alterado={alteradoIn(["instagram", "facebook", "youtube"])}
        >
          <Campo
            label="Instagram"
            value={configs.instagram ?? ""}
            onChange={(v) => set("instagram", v)}
            placeholder="https://instagram.com/amavidas"
            prefix="🌐"
          />
          <Campo
            label="Facebook"
            value={configs.facebook ?? ""}
            onChange={(v) => set("facebook", v)}
            placeholder="https://facebook.com/amavidas"
            prefix="🌐"
          />
          <Campo
            label="YouTube"
            value={configs.youtube ?? ""}
            onChange={(v) => set("youtube", v)}
            placeholder="https://youtube.com/@amavidas"
            prefix="🌐"
          />
        </Secao>

        {/* ── Seção Funcionalidades ── */}
        <Secao
          titulo="Funcionalidades da Landing Page"
          descricao="Ative ou desative seções interativas do site."
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
          onSalvar={() => salvar(["secao_beneficios_ativa"], "funcionalidades")}
          salvando={salvandoSecao === "funcionalidades"}
          alterado={alteradoIn(["secao_beneficios_ativa"])}
        >
          <Toggle
            label="Clube de Benefícios"
            sub="Exibir a seção do Clube de Descontos/Parceiros na página inicial"
            checked={configs.secao_beneficios_ativa === "true"}
            onChange={(v) => set("secao_beneficios_ativa", v ? "true" : "false")}
          />
        </Secao>

        {/* ── Info ── */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 text-sm font-semibold mb-0.5">Alterações refletem em tempo real</p>
            <p className="text-blue-600 text-xs leading-relaxed">
              O número de WhatsApp é usado diretamente no simulador do site. Atualize aqui e as novas simulações já usarão o número correto automaticamente.
            </p>
          </div>
        </div>

      </div>

      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
    </main>
  );
}
