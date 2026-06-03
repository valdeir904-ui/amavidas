"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

const DEPOIMENTOS = [
  {
    nome: "Carla Mendonça",
    cidade: "Águas Lindas, GO",
    avatar: "CM",
    texto:
      "Quando perdi meu pai, a AmaVidas cuidou de absolutamente tudo. Em nenhum momento precisei me preocupar com papelada, funerária ou custos. Me disseram o que precisava fazer e tomaram conta de todo o resto. Não tenho palavras para descrever o alívio que senti. Recomendo para todos da minha família.",
    avaliacao: 5,
    plano: "Amar Plus",
    data: "Março 2025",
  },
  {
    nome: "Roberto Alves",
    cidade: "Brasília, DF",
    avatar: "RA",
    texto:
      "Contratei o Plano Amar Plus há 2 anos. Quando precisei usar, ficou evidente que valeu cada centavo. O atendente ficou conosco do início ao fim do processo. Atendimento impecável, humanizado de verdade. Nunca me senti sozinho naquele momento.",
    avaliacao: 5,
    plano: "Amar Plus",
    data: "Janeiro 2025",
  },
  {
    nome: "Fernanda Costa",
    cidade: "Luziânia, GO",
    avatar: "FC",
    texto:
      "Fiz a simulação no site e em menos de 10 minutos já tinha o plano contratado. O processo foi super simples, o preço cabe no meu orçamento e saber que minha família está protegida me dá uma paz enorme. Atendimento pelo WhatsApp rápido e sem enrolação.",
    avaliacao: 5,
    plano: "Cuidar Plus",
    data: "Dezembro 2024",
  },
  {
    nome: "Jorge Santos",
    cidade: "Planaltina, DF",
    avatar: "JS",
    texto:
      "Precisei de translado de outra cidade. Liguei às 2h da manhã e me atenderam imediatamente, com toda a calma do mundo. Em poucas horas tudo estava resolvido. Isso é seriedade. Recomendo a AmaVidas para toda a minha família.",
    avaliacao: 5,
    plano: "Vida Plus",
    data: "Novembro 2024",
  },
  {
    nome: "Maria Aparecida Lima",
    cidade: "Formosa, GO",
    avatar: "MA",
    texto:
      "Minha filha me indicou o plano e graças a Deus ela teve essa ideia. Quando meu marido faleceu, a equipe da AmaVidas cuidou de tudo com muito respeito e carinho. Nossa família não precisou se preocupar com nenhum detalhe. Muito obrigada.",
    avaliacao: 5,
    plano: "Amar Plus",
    data: "Outubro 2024",
  },
];

const AVATAR_COLORS = [
  "bg-primary",
  "bg-cyan",
  "bg-rose",
  "bg-primary-dark",
  "bg-cyan-dark",
];

function Estrelas({ qtd }: { qtd: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: qtd }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function DepoimentosPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border px-5 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative h-9 w-32">
              <Image
                src="/logo.png"
                alt="AmaVidas"
                fill
                sizes="128px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="brand-gradient py-16 px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-cyan font-semibold text-sm uppercase tracking-widest mb-4">
              Depoimentos reais
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Histórias de famílias que a AmaVidas cuidou
            </h1>
            <p className="text-white/75 max-w-xl mx-auto">
              Relatos reais de clientes que passaram pelo momento mais difícil com
              o suporte completo e humanizado da AmaVidas.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              {[
                { valor: "4,9⭐", label: "Google" },
                { valor: "+5.000", label: "famílias" },
                { valor: "Zero", label: "reclamações" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-white font-bold text-2xl">{s.valor}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Depoimentos */}
        <section className="py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {DEPOIMENTOS.map((t, i) => (
                <motion.div
                  key={t.nome}
                  variants={fadeUp}
                  className="bg-surface rounded-2xl p-7 border border-border hover:shadow-md hover:border-primary/20 transition-all flex flex-col"
                >
                  <Estrelas qtd={t.avaliacao} />

                  <blockquote className="text-text leading-relaxed my-5 text-sm flex-1">
                    &ldquo;{t.texto}&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                          AVATAR_COLORS[i % AVATAR_COLORS.length]
                        }`}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-text text-sm">{t.nome}</p>
                        <p className="text-muted text-xs">{t.cidade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-primary-light text-primary font-medium px-2.5 py-1 rounded-full">
                        {t.plano}
                      </span>
                      <p className="text-muted text-xs mt-1">{t.data}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 px-5">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted mb-6">
              Sua família também pode ter essa proteção. A partir de R$&nbsp;43/mês.
            </p>
            <Link
              href="/simulacao"
              className="inline-flex items-center gap-2 brand-gradient text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Simular meu plano ideal grátis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-5 px-5 text-center">
        <p className="text-sm text-muted">
          🔒 Seus dados são protegidos. A AmaVidas não compartilha informações com terceiros.
        </p>
      </footer>
    </div>
  );
}
