"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import AnimatedCounter from "./AnimatedCounter";

export default function Sobre() {
  return (
    <section id="sobre" style={{ padding: "96px 0", background: "var(--bg-alt)" }} className="max-[980px]:py-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">
        <motion.div
          className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-9"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Left: text */}
          <motion.div variants={fadeUp}>
            <div>
              <p className="text-[14px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--royal)", marginBottom: "32px" }}>
                Nossa história
              </p>
              <h2 style={{ marginBottom: "48px" }}>Nascemos em Águas Lindas, com um propósito simples.</h2>
            </div>

            <p className="text-[18px] leading-relaxed max-[980px]:text-[17px]" style={{ color: "var(--ink-soft)", marginBottom: "32px" }}>
              A AmaVidas começou em 2021, em Águas Lindas de Goiás, quando dois amigos decidiram que nenhuma família deveria atravessar o luto desamparada — nem enfrentar despesas inesperadas em um momento de dor.
            </p>
            <p className="text-[18px] leading-relaxed max-[980px]:text-[17px]" style={{ color: "var(--ink-soft)", marginBottom: "64px" }}>
              Hoje, nos consolidamos como a maior empresa de planos funerários de Águas Lindas de Goiás, expandindo nossa proteção para todo o país, com presença nacional e mais de 5.000 famílias atendidas. Mas a nossa essência continua a mesma:{" "}
              <strong style={{ color: "var(--ink)" }}>cuidar das pessoas como gostaríamos de ser cuidados.</strong>
            </p>

            {/* Stats */}
            <div
              className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-2.5"
              style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
            >
              {[
                { type: "static", value: "2021", label: "fundação em Águas Lindas, GO" },
                { type: "counter", target: 5000, prefix: "+", label: "famílias atendidas" },
                { type: "counter", target: 1700, suffix: "+", label: "cidades cobertas" },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-[14px] p-5 max-[980px]:flex max-[980px]:items-baseline max-[980px]:gap-3 bg-white border border-[var(--line)]"
                >
                  <strong
                    className="block leading-none max-[980px]:text-[26px]"
                    style={{ fontFamily: "var(--serif)", fontSize: "32px", color: "var(--royal)", fontWeight: 500 }}
                  >
                    {s.type === "static" ? (
                      s.value
                    ) : (
                      <AnimatedCounter target={s.target!} prefix={s.prefix} suffix={s.suffix} />
                    )}
                  </strong>
                  <span className="text-[14px] block mt-1.5 max-[980px]:mt-0" style={{ color: "var(--ink-soft)" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: CEO cards + team photo */}
          <motion.div variants={fadeUp}>
            <div
              className="grid max-[980px]:gap-3"
              style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}
            >
              {/* CEO 1 */}
              <motion.div 
                className="rounded-[14px] overflow-hidden bg-white border border-[var(--line)]"
                whileHover={{ y: -6, scale: 1.02, borderColor: "var(--royal-soft)", boxShadow: "var(--shadow-md)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  style={{
                    aspectRatio: "4/5",
                    backgroundImage: "url('/Ceo_Livia.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  role="img"
                  aria-label="Lívia Antonieti, Co-fundadora & CEO"
                />
                <div className="px-5 py-4">
                  <strong className="block font-semibold text-[17px]" style={{ color: "var(--ink)" }}>Lívia Antonieti</strong>
                  <span className="text-[14px]" style={{ color: "var(--ink-mute)" }}>Co-fundadora & CEO</span>
                </div>
              </motion.div>

              {/* CEO 2 */}
              <motion.div 
                className="rounded-[14px] overflow-hidden bg-white border border-[var(--line)]"
                whileHover={{ y: -6, scale: 1.02, borderColor: "var(--royal-soft)", boxShadow: "var(--shadow-md)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  style={{
                    aspectRatio: "4/5",
                    backgroundImage: "url('/Ceo_Rafael.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  role="img"
                  aria-label="Rafael Souza, Co-fundador & COO"
                />
                <div className="px-5 py-4">
                  <strong className="block font-semibold text-[17px]" style={{ color: "var(--ink)" }}>Rafael Souza</strong>
                  <span className="text-[14px]" style={{ color: "var(--ink-mute)" }}>Co-fundador & COO</span>
                </div>
              </motion.div>

              {/* Team photo — full width */}
              <motion.div
                className="rounded-[14px] overflow-hidden col-span-2 bg-white border border-[var(--line)]"
                whileHover={{ y: -6, scale: 1.015, borderColor: "var(--royal-soft)", boxShadow: "var(--shadow-md)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  style={{
                    aspectRatio: "16/7",
                    backgroundImage: "url('/equipe-amavidas.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  role="img"
                  aria-label="Equipe AmaVidas, sede em Águas Lindas"
                />
                <div className="px-5 py-4 bg-white">
                  <strong className="block font-semibold text-[17px]" style={{ color: "var(--ink)" }}>Nossa Equipe</strong>
                  <span className="text-[14px]" style={{ color: "var(--ink-mute)" }}>Sede administrativa em Águas Lindas de Goiás</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
