import Simulador from "@/components/Simulador";

export default function SimuladorSection() {
  return (
    <section
      id="simulador"
      className="max-[980px]:py-14"
      style={{ padding: "96px 0", background: "var(--bg)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">
        
        {/* Layout de duas colunas: Simulador na esquerda, Incentivo na direita */}
        <div className="grid grid-cols-1 min-[981px]:grid-cols-2 gap-12 min-[1100px]:gap-20 items-center">
          
          {/* Lado Esquerdo: Card do simulador */}
          <div className="order-2 min-[981px]:order-1 flex justify-center min-[981px]:justify-start w-full">
            <div
              className="w-full bg-white rounded-[24px] p-8 max-[980px]:p-6"
              style={{
                maxWidth: 580,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <Simulador />
            </div>
          </div>

          {/* Lado Direito: Texto de incentivo */}
          <div className="order-1 min-[981px]:order-2 flex flex-col gap-6 w-full">
            <div>
              <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--magenta)" }}>
                Não sabe qual plano escolher?
              </p>
              <h2 className="mt-2 text-[32px] min-[981px]:text-[38px] leading-tight font-medium" style={{ fontFamily: "var(--serif)", color: "var(--ink)" }}>
                Descubra em minutos o plano ideal para você e sua família
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Cada família tem necessidades únicas. Nossa simulação analisa o tamanho da sua família e seu momento de vida para recomendar a cobertura perfeita. Evite pagar a mais e garanta apenas o suporte que você realmente precisa.
              </p>
            </div>

            {/* Lista de incentivos */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-3.5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--magenta-soft)", color: "var(--magenta)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>Simulação ultra-rápida</h4>
                  <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>Leva menos de 1 minuto e são apenas 5 perguntas simples.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--royal-soft)", color: "var(--royal)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>Recomendação inteligente</h4>
                  <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>Sugestão precisa baseada na sua realidade familiar e financeira.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>100% Gratuito e Seguro</h4>
                  <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>Suas informações estão protegidas e você não tem nenhum compromisso financeiro.</p>
                </div>
              </div>
            </div>

            {/* Simulações concluídas */}
            <div className="flex items-center gap-2 mt-4 pt-5 border-t border-[var(--line)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--teal)" }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: "var(--teal)" }}></span>
              </span>
              <p className="text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>
                Mais de <strong style={{ color: "var(--ink)" }}>1.400 simulações</strong> concluídas hoje.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
