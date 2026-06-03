"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useModal } from "@/contexts/ModalContext";
import { abrirWhatsApp } from "@/lib/whatsapp";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 0) return `(${d}`;
  return "";
}

import { useConfig } from "@/contexts/ConfigContext";

export default function ModalFormulario() {
  const { configs } = useConfig();
  const whatsappNum = configs.whatsapp || "5561985825621";
  const { modal, closeForm, openTestimonials } = useModal();
  const { open, preselectedPlan } = modal.form;

  const [step, setStep] = useState<"form" | "success">("form");
  const [firstName, setFirstName] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", city: "", plan: "", people: "2-4", message: "", lgpd: true,
  });
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setStep("form");
      setForm((f) => ({ ...f, plan: preselectedPlan ?? "" }));
      setTimeout(() => nameRef.current?.focus(), 250);
    }
  }, [open, preselectedPlan]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeForm(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Por favor, preencha nome e WhatsApp para continuarmos.");
      return;
    }
    setFirstName(form.name.trim().split(" ")[0]);

    // Salvar lead no backend
    fetch("/api/simulacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.name,
        telefone: form.phone,
        email: "",
        paraQuem: form.people,
        planoRecomendado: form.plan || "Indefinido",
        quantidadePessoas: form.people,
        faixaEtaria: "",
        prioridade: "",
        orcamento: "",
        cidade: form.city,
        comoContatar: "whatsapp",
      }),
    }).catch(() => {});

    setStep("success");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-5 overflow-y-auto"
      style={{ background: "rgba(20,25,55,.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="formModalTitle"
    >
      <div
        className="bg-white w-full max-w-[560px] rounded-[20px] p-10 max-[600px]:p-6 relative shadow-[var(--shadow-lg)] my-auto"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Close */}
        <button
          onClick={closeForm}
          aria-label="Fechar"
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-xl bg-[var(--bg-alt)] text-[var(--ink)] grid place-items-center hover:bg-[var(--line)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {step === "form" ? (
          <>
            <p className="text-[var(--magenta)] text-[13px] font-semibold tracking-[0.14em] uppercase mb-2.5">
              Vamos cuidar de você
            </p>
            <h3
              id="formModalTitle"
              className="font-[var(--serif)] text-[30px] font-medium leading-tight tracking-[-0.015em] mb-2"
              style={{ fontFamily: "var(--serif)" }}
            >
              Solicite o contato de um consultor
            </h3>
            <p className="text-[var(--ink-soft)] text-base mb-7">
              Deixe seus dados e em até <strong>15 minutos</strong> um especialista entra em contato pelo WhatsApp. Sem compromisso.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Nome */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-name" className="text-sm font-semibold text-[var(--ink)]">
                  Nome completo <span className="text-[var(--magenta)]">*</span>
                </label>
                <input
                  ref={nameRef}
                  id="f-name"
                  type="text"
                  placeholder="Como podemos te chamar"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="h-[52px] px-4 border border-[var(--line-strong)] rounded-[10px] font-[var(--sans)] text-base text-[var(--ink)] bg-white focus:outline-none focus:border-[var(--royal)] focus:shadow-[0_0_0_4px_rgba(43,61,168,.12)] transition-all w-full"
                />
              </div>

              {/* Phone + City */}
              <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-phone" className="text-sm font-semibold text-[var(--ink)]">
                    WhatsApp <span className="text-[var(--magenta)]">*</span>
                  </label>
                  <input
                    id="f-phone"
                    type="tel"
                    placeholder="(61) 99000-0000"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: maskPhone(e.target.value) }))}
                    required
                    className="h-[52px] px-4 border border-[var(--line-strong)] rounded-[10px] font-[var(--sans)] text-base text-[var(--ink)] bg-white focus:outline-none focus:border-[var(--royal)] focus:shadow-[0_0_0_4px_rgba(43,61,168,.12)] transition-all w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-city" className="text-sm font-semibold text-[var(--ink)]">Cidade</label>
                  <input
                    id="f-city"
                    type="text"
                    placeholder="Águas Lindas, GO"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="h-[52px] px-4 border border-[var(--line-strong)] rounded-[10px] font-[var(--sans)] text-base text-[var(--ink)] bg-white focus:outline-none focus:border-[var(--royal)] focus:shadow-[0_0_0_4px_rgba(43,61,168,.12)] transition-all w-full"
                  />
                </div>
              </div>

              {/* Plano */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-plan" className="text-sm font-semibold text-[var(--ink)]">Plano de interesse</label>
                <select
                  id="f-plan"
                  value={form.plan}
                  onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                  className="h-[52px] px-4 pr-11 border border-[var(--line-strong)] rounded-[10px] font-[var(--sans)] text-base text-[var(--ink)] bg-white focus:outline-none focus:border-[var(--royal)] focus:shadow-[0_0_0_4px_rgba(43,61,168,.12)] transition-all w-full appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231A1F36' stroke-width='2.4' stroke-linecap='round'><path d='M6 9l6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                >
                  <option value="">Ainda não decidi — preciso de ajuda</option>
                  <option value="Amar Plus">Amar Plus — R$ 43/mês (mais escolhido)</option>
                  <option value="Vida Plus">Vida Plus — R$ 90/mês</option>
                </select>
              </div>

              {/* Pessoas */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-people" className="text-sm font-semibold text-[var(--ink)]">Quantas pessoas você quer proteger?</label>
                <select
                  id="f-people"
                  value={form.people}
                  onChange={(e) => setForm((f) => ({ ...f, people: e.target.value }))}
                  className="h-[52px] px-4 pr-11 border border-[var(--line-strong)] rounded-[10px] font-[var(--sans)] text-base text-[var(--ink)] bg-white focus:outline-none focus:border-[var(--royal)] focus:shadow-[0_0_0_4px_rgba(43,61,168,.12)] transition-all w-full appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231A1F36' stroke-width='2.4' stroke-linecap='round'><path d='M6 9l6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                >
                  <option value="1">Só eu</option>
                  <option value="2-4">2 a 4 pessoas (minha família)</option>
                  <option value="5+">5 ou mais pessoas</option>
                </select>
              </div>

              {/* Mensagem */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-msg" className="text-sm font-semibold text-[var(--ink)]">
                  Alguma observação? <span className="font-normal text-[var(--ink-mute)]">(opcional)</span>
                </label>
                <textarea
                  id="f-msg"
                  rows={4}
                  placeholder="Conte um pouco sobre o que você precisa..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="px-4 py-3.5 border border-[var(--line-strong)] rounded-[10px] font-[var(--sans)] text-base text-[var(--ink)] bg-white focus:outline-none focus:border-[var(--royal)] focus:shadow-[0_0_0_4px_rgba(43,61,168,.12)] transition-all w-full resize-y leading-relaxed"
                />
              </div>

              {/* LGPD */}
              <label className="flex gap-2.5 items-start text-sm text-[var(--ink-soft)] leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.lgpd}
                  onChange={(e) => setForm((f) => ({ ...f, lgpd: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 flex-shrink-0 accent-[var(--royal)]"
                />
                <span>
                  Concordo em ser contatado pela AmaVidas pelo WhatsApp ou telefone. Meus dados serão tratados conforme a{" "}
                  <a href="#" className="text-[var(--royal)] font-semibold underline underline-offset-2">Política de Privacidade (LGPD)</a>.
                </span>
              </label>

              <button
                type="submit"
                className="h-16 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[18px] text-white transition-all hover:-translate-y-0.5"
                style={{ background: "var(--royal)", boxShadow: "0 8px 22px rgba(43,61,168,.28)" }}
              >
                Quero receber contato
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>

              {/* Trust */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--line)] text-[13px] text-[var(--ink-mute)]">
                {[
                  { icon: "shield", text: "Dados protegidos pela LGPD" },
                  { icon: "check", text: "Sem spam, sem ligações automáticas" },
                  { icon: "clock", text: "Resposta em até 15 minutos" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 whitespace-nowrap">
                    {icon === "shield" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.4"><path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z"/><path d="M9 12l2 2 4-4"/></svg>
                    )}
                    {icon === "check" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.4"><path d="M5 12l5 5L20 7"/></svg>
                    )}
                    {icon === "clock" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    )}
                    {text}
                  </div>
                ))}
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-5">
            <div
              className="w-[72px] h-[72px] rounded-full grid place-items-center mx-auto mb-5"
              style={{ background: "var(--teal-soft)", color: "var(--teal)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h3 className="text-[28px] font-medium mb-2" style={{ fontFamily: "var(--serif)" }}>
              Recebemos seu pedido, {firstName}!
            </h3>
            <p className="text-[var(--ink-soft)]">
              Um de nossos consultores vai entrar em contato pelo WhatsApp em até{" "}
              <strong>15 minutos</strong>.<br />
              Enquanto isso, fique tranquilo — nós cuidamos do resto.
            </p>
            <div className="flex gap-2.5 justify-center flex-wrap mt-6">
              <button
                onClick={() => abrirWhatsApp(whatsappNum, "Olá! Acabei de enviar meu pedido no site da AmaVidas.")}
                className="h-16 px-8 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[18px] text-white transition-all hover:opacity-90"
                style={{ background: "var(--magenta)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.5-.3z"/></svg>
                Falar agora no WhatsApp
              </button>
              <button
                onClick={closeForm}
                className="h-16 px-8 rounded-xl font-semibold text-[18px] text-[var(--ink)] hover:bg-[var(--bg-alt)] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
