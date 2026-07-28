"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { useConfig } from "@/contexts/ConfigContext";
import { trackWhatsAppClick } from "@/lib/analytics";

export default function PetSection() {
  const { configs } = useConfig();
  const whatsapp = configs.whatsapp || "5561985825621";

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Olá! Gostaria de obter mais informações sobre o Plano Pet da AmaVidas.");
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    trackWhatsAppClick({
      origem: "home_pet_section",
      googleAdsId: configs.google_ads_id,
      googleAdsWaLabel: configs.google_ads_wa_label,
    });
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#F5F3FF] to-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-5 min-[640px]:px-8">
        
        <motion.div 
          className="relative rounded-3xl overflow-hidden bg-white border border-purple-100 shadow-2xl p-8 min-[768px]:p-12 lg:p-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                <span className="text-sm">🐾</span> Novo · Proteção Completa Pet
              </div>

              <h2 
                className="text-3xl min-[768px]:text-4xl lg:text-5xl font-medium tracking-tight text-slate-900 leading-[1.15] mb-5"
                style={{ fontFamily: "var(--serif)" }}
              >
                Quem ama cuida até do seu <span className="text-purple-700 underline decoration-amber-400 decoration-wavy decoration-2">amigo de 4 patas.</span>
              </h2>

              <p className="text-slate-600 text-base min-[768px]:text-lg leading-relaxed mb-8">
                Eles nos dão amor incondicional todos os dias. O <strong>Plano Pet da AmaVidas</strong> garante uma despedida com todo o respeito, carinho e dignidade que seu companheiro merece por apenas <strong>R$ 25,00/mês</strong>.
              </p>

              {/* Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                <div className="flex items-start gap-3 bg-purple-50/60 border border-purple-100 p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                    🐶
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Sem Limite de Porte</h4>
                    <p className="text-xs text-slate-600 font-medium">Para cães e gatos de qualquer tamanho ou peso.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-purple-50/60 border border-purple-100 p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                    🌹
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Sala de Velório Especial</h4>
                    <p className="text-xs text-slate-600 font-medium">Espaço reservado para a despedida da família.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-purple-50/60 border border-purple-100 p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                    🌿
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Lápide e Homenagem</h4>
                    <p className="text-xs text-slate-600 font-medium">Embalagem ecológica e lápide personalizada.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-purple-50/60 border border-purple-100 p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                    🚗
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Deslocamento Incluso</h4>
                    <p className="text-xs text-slate-600 font-medium">Remoção e transporte até o memorial.</p>
                  </div>
                </div>
              </div>

              {/* Price Tag & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full pt-2">
                <Link
                  href="/plano-pet"
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-7 py-4 rounded-2xl text-center text-sm transition-all shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Conhecer o Plano Pet</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </Link>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-4 rounded-2xl text-center text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Falar com Consultor</span>
                </button>
              </div>

            </div>

            {/* Right Image Feature */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/hero_pet_plan.png"
                  alt="Plano Pet AmaVidas"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 420px"
                  priority
                />
                
                {/* Floating Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-purple-700 font-extrabold uppercase tracking-widest">A partir de</p>
                    <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">R$ 25<span className="text-xs font-normal text-slate-500">/mês</span></p>
                  </div>
                  <span className="px-3 py-1.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm">
                    Proteção Pet
                  </span>
                </div>
              </div>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}
