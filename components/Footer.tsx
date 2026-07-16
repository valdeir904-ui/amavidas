"use client";

import Image from "next/image";
import { useConfig } from "@/contexts/ConfigContext";
import { abrirWhatsApp } from "@/lib/whatsapp";

function exibirWpp(num: string) {
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

function exibirEndereco(end: string) {
  if (!end) return null;
  const partes = end.split("—"); // split by dash
  if (partes.length >= 2) {
    return (
      <span>
        <strong className="block text-white">{partes[0].trim()}</strong>
        {partes.slice(1).join("—").trim()}
      </span>
    );
  }
  const partesVirgula = end.split(",");
  if (partesVirgula.length >= 2) {
    return (
      <span>
        <strong className="block text-white">{partesVirgula[0].trim()}</strong>
        {partesVirgula.slice(1).join(",").trim()}
      </span>
    );
  }
  return (
    <span>
      <strong className="block text-white">{end}</strong>
    </span>
  );
}

export default function Footer() {
  const { configs } = useConfig();

  return (
    <footer style={{ background: "var(--royal-deep)", color: "rgba(255,255,255,.78)", fontSize: 15 }}>
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6 pt-20 pb-8 max-[980px]:pt-14 max-[980px]:pb-6">

        {/* 4-col grid */}
        <div
          className="grid mb-14 max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-8 max-[980px]:mb-8"
          style={{ gridTemplateColumns: "1.3fr .8fr .8fr 1.1fr", gap: 48 }}
        >
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-3.5">
            <a href="#top" aria-label="AmaVidas — Quem Ama, Cuida.">
              <div className="relative h-[64px] w-[190px] max-[980px]:h-[52px]">
                <Image
                  src="/logo.png"
                  alt="AmaVidas"
                  fill
                  sizes="190px"
                  className="object-contain object-left"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
            </a>
            <p style={{ color: "rgba(255,255,255,.7)", lineHeight: 1.55, maxWidth: 320, fontSize: 15 }}>
              Planos funerários acessíveis com cobertura nacional. Mais de 5.000 famílias atendidas desde 2021.
            </p>

            {/* Trust seals — white card style from reference */}
            <div className="flex gap-3 flex-wrap mt-1">
              {/* Google seal */}
              <div
                className="flex items-center gap-2.5 rounded-xl"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,.08)",
                  padding: "10px 14px 10px 12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                  color: "#1A1F36",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  className="grid place-items-center flex-shrink-0 rounded-lg"
                  style={{ width: 32, height: 32, background: "#fff", border: "1px solid #e1e4ed", color: "#4285F4", fontFamily: "var(--sans)", fontSize: 20, fontWeight: 500, letterSpacing: "-0.04em" }}
                  aria-hidden="true"
                >
                  G
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#767C92" }}>Google</span>
                  <span className="text-[15px] font-bold flex items-center gap-1" style={{ color: "#1A1F36" }}>
                    4,9 <span style={{ color: "#F5B400", letterSpacing: -1, fontSize: 12 }}>★★★★★</span>
                  </span>
                </span>
              </div>

              {/* RA seal */}
              <div
                className="flex items-center gap-2.5 rounded-xl"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,.08)",
                  padding: "10px 14px 10px 12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                  color: "#1A1F36",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  className="grid place-items-center flex-shrink-0 rounded-lg text-center leading-none"
                  style={{ width: 32, height: 32, background: "linear-gradient(135deg, #00B14F 0%, #00853E 100%)", color: "#fff", fontFamily: "var(--sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}
                  aria-hidden="true"
                >
                  RA
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#767C92" }}>Reclame Aqui</span>
                  <span className="text-[15px] font-bold" style={{ color: "#1A1F36" }}>Verificado ✓</span>
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Empresa */}
          <div>
            <h5 className="text-white text-[14px] font-bold tracking-[0.1em] uppercase mb-4">Empresa</h5>
            <ul className="flex flex-col gap-2.5 p-0 m-0" style={{ listStyle: "none" }}>
              {[
                { label: "Sobre nós", href: "#sobre" },
                { label: "Nossos planos", href: "#planos" },
                { label: "Como funciona", href: "#como" },
                { label: "Depoimentos", href: "#depoimento" },
                { label: "Trabalhe conosco", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors"
                    style={{ color: "rgba(255,255,255,.78)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.78)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Ajuda */}
          <div>
            <h5 className="text-white text-[14px] font-bold tracking-[0.1em] uppercase mb-4">Ajuda</h5>
            <ul className="flex flex-col gap-2.5 p-0 m-0" style={{ listStyle: "none" }}>
              {[
                { label: "Dúvidas frequentes", href: "#faq" },
                { label: "Fale conosco", href: "#contato" },
                { label: "Central de atendimento", href: "#" },
                { label: "Política de privacidade", href: "#" },
                { label: "Termos de uso", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors"
                    style={{ color: "rgba(255,255,255,.78)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.78)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Atendimento */}
          <div>
            <h5 className="text-white text-[14px] font-bold tracking-[0.1em] uppercase mb-4">Atendimento</h5>
            
            {/* Informar Óbito Button */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                try {
                  fetch("/api/eventos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tipo: "clique_obito" }),
                  }).catch(() => {});
                } catch {}
                abrirWhatsApp(configs.whatsapp || "5561985825621", "Olá, preciso informar um óbito e solicitar atendimento de plantão imediato.", "obito-footer");
              }}
              className="flex items-center gap-2.5 mb-6 w-fit h-[44px] px-5 rounded-xl font-bold text-[14px] border whitespace-nowrap transition-all"
              style={{
                color: "#fff",
                background: "rgba(239, 68, 68, 0.15)",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Informar Óbito (Plantão)
            </a>

            <ul className="flex flex-col gap-3.5 p-0 m-0" style={{ listStyle: "none" }}>
              <li className="flex gap-2.5 items-start">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ flexShrink: 0, marginTop: 2, color: "var(--teal)" }}>
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.5-.3z" />
                </svg>
                <span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      abrirWhatsApp(configs.whatsapp || "5561985825621", "Olá! Tenho interesse em um plano funerário da AmaVidas. Pode me ajudar?", "atendimento-footer");
                    }}
                    className="hover:underline text-left block"
                  >
                    <strong className="block text-white">{exibirWpp(configs.whatsapp || "5561985825621")}</strong>
                  </a>
                  WhatsApp 24 horas
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0, marginTop: 2, color: "var(--teal)" }}>
                  <path d="M22 16.92V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 4.1 1 1 0 0 1 3 3h4.09a1 1 0 0 1 1 .75c.12.7.34 1.38.66 2.01a1 1 0 0 1-.23 1.1L7.9 8.39a16 16 0 0 0 7.7 7.7l1.53-1.61a1 1 0 0 1 1.1-.23c.63.32 1.31.54 2.01.66a1 1 0 0 1 .76 1z" />
                </svg>
                <span>
                  <a href={`tel:${(configs.telefone || "(61) 98483-8124").replace(/\D/g, "")}`} className="hover:underline">
                    <strong className="block text-white">{configs.telefone || "(61) 98483-8124"}</strong>
                  </a>
                  Falar com Financeiro
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0, marginTop: 2, color: "var(--teal)" }}>
                  <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" /><circle cx="12" cy="9" r="3" />
                </svg>
                {exibirEndereco(configs.empresa_endereco || "Águas Lindas, GO — Av. Brasília, Quadra 100 · Lote 5")}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-between flex-wrap gap-6 pt-6 text-[13px] max-[980px]:flex-col max-[980px]:gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.55)" }}
        >
          <div>© 2026 {configs.empresa_nome || "AmaVidas Assistência Funerária Ltda"} · CNPJ {configs.empresa_cnpj || "42.159.966/0001-16"} · Todos os direitos reservados</div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "LGPD", href: "#" },
              { label: "Cookies", href: "#" },
              { label: "Instagram", href: configs.instagram || "#", target: configs.instagram ? "_blank" : undefined },
              { label: "Facebook", href: configs.facebook || "#", target: configs.facebook ? "_blank" : undefined },
              configs.youtube && { label: "YouTube", href: configs.youtube, target: "_blank" },
            ].filter(Boolean).map((link: any) => (
              <a
                key={link.label}
                href={link.href}
                target={link.target}
                rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                className="transition-colors"
                style={{ color: "rgba(255,255,255,.55)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.55)")}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

