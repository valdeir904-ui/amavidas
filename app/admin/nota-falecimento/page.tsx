"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";

const PRESET_MENSAGENS = {
  familiar: [
    "Com profundo pesar, comunicamos o falecimento de nosso amado ente querido. Sua memória permanecerá eterna em nossos corações.",
    "\"Aquele que habita no esconderijo do Altíssimo, à sombra do Omnipotente descansará.\" — Salmos 91:1",
    "\"Combati o bom combate, acabei a carreira, guardei a fé.\" — 2 Timóteo 4:7",
    "Aos que amamos, a saudade é o testemunho eterno do amor que permanecerá para sempre.",
    "Nossos corações se enchem de saudades e gratidão por cada momento compartilhado."
  ],
  pet: [
    "Com amor e saudade, nos despedimos do nosso companheiro de 4 patas. Obrigado por cada momento inesquecível de afeto.",
    "Seus passos deixaram marcas de amor e alegrias inesquecíveis em nossas vidas. Descanse em paz, amado pet.",
    "O amor por quem nos deu tanto afeto e lealdade jamais se apaga dos nossos corações."
  ]
};

export default function NotaFalecimentoPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Form State
  const [tipo, setTipo] = useState<"familiar" | "pet">("familiar");
  const [nome, setNome] = useState("Maria de Lourdes Oliveira");
  const [dataNascimento, setDataNascimento] = useState("12/03/1950");
  const [dataFalecimento, setDataFalecimento] = useState("29/07/2026");
  const [mensagem, setMensagem] = useState(PRESET_MENSAGENS.familiar[0]);
  
  // Cerimônia
  const [localVelorio, setLocalVelorio] = useState("Memorial AmaVidas — Sala 02 (Águas Lindas de Goiás)");
  const [horarioVelorio, setHorarioVelorio] = useState("A partir das 08:00h");
  const [localSepultamento, setLocalSepultamento] = useState("Cemitério Municipal de Águas Lindas");
  const [horarioSepultamento, setHorarioSepultamento] = useState("Às 16:30h");

  // Estilo
  const [formato, setFormato] = useState<"feed" | "story">("feed");
  const [tema, setTema] = useState<"dark" | "maravilha" | "celeste" | "pet">("dark");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Loading
  const [generating, setGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Switch Tipo
  const handleTipoChange = (newTipo: "familiar" | "pet") => {
    setTipo(newTipo);
    if (newTipo === "pet") {
      setTema("pet");
      setNome("Thor");
      setMensagem(PRESET_MENSAGENS.pet[0]);
    } else {
      setTema("dark");
      setNome("Maria de Lourdes Oliveira");
      setMensagem(PRESET_MENSAGENS.familiar[0]);
    }
  };

  // Download PNG
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Alta resolução
        useCORS: true,
        backgroundColor: null,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const cleanName = nome.toLowerCase().replace(/\s+/g, "_");
      link.download = `nota_falecimento_${cleanName}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Não foi possível gerar a imagem. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  // Text for WhatsApp
  const formatWhatsAppMessage = () => {
    return `*NOTA DE FALECIMENTO — AMANVIDAS MEMORIAL*\n\n` +
      `É com profundo pesar que comunicamos o falecimento de *${nome}* (${dataNascimento ? `*${dataNascimento}` : ''}  † ${dataFalecimento}).\n\n` +
      `"${mensagem}"\n\n` +
      `📍 *VELÓRIO:* ${localVelorio}\n` +
      `⏰ *HORÁRIO:* ${horarioVelorio}\n\n` +
      `📍 *SEPULTAMENTO:* ${localSepultamento}\n` +
      `⏰ *HORÁRIO:* ${horarioSepultamento}\n\n` +
      `_AmaVidas — Acolhimento e Dignidade 24h_`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(formatWhatsAppMessage());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(formatWhatsAppMessage());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Estilos de Tema
  const getThemeStyles = () => {
    switch (tema) {
      case "pet":
        return {
          bg: "bg-gradient-to-b from-[#2E1065] via-[#3B0764] to-[#1E1B4B]",
          border: "border-purple-400/30",
          accentText: "text-amber-300",
          ribbonColor: "text-amber-400",
          cardBg: "bg-purple-950/60 border-purple-400/20",
          subText: "text-purple-200",
        };
      case "maravilha":
        return {
          bg: "bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617]",
          border: "border-slate-700/60",
          accentText: "text-slate-200",
          ribbonColor: "text-slate-300",
          cardBg: "bg-slate-900/80 border-slate-700/40",
          subText: "text-slate-300",
        };
      case "celeste":
        return {
          bg: "bg-gradient-to-b from-[#0F172A] via-[#1E3A8A] to-[#090D16]",
          border: "border-sky-400/30",
          accentText: "text-sky-200",
          ribbonColor: "text-sky-300",
          cardBg: "bg-slate-900/70 border-sky-400/20",
          subText: "text-sky-100",
        };
      case "dark":
      default:
        return {
          bg: "bg-gradient-to-b from-[#09090B] via-[#18181B] to-[#09090B]",
          border: "border-amber-500/30",
          accentText: "text-amber-400",
          ribbonColor: "text-amber-400",
          cardBg: "bg-zinc-900/90 border-amber-500/20",
          subText: "text-zinc-300",
        };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <span>🎗️</span> Central Memorial AmaVidas
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gerador de Nota de Falecimento</h1>
          <p className="text-slate-600 text-sm mt-1">
            Crie comunicados solenes de homenagem e velório para baixar em alta resolução ou enviar via WhatsApp.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopyText}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            {copiedText ? "Copiado!" : "Copiar Texto WA"}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Compartilhar WA
          </button>

          <button
            onClick={handleDownload}
            disabled={generating}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            {generating ? "Gerando..." : "Baixar Imagem PNG"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Tipo & Formato */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚙️</span> Tipo & Formato
            </h3>

            {/* Tipo */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTipoChange("familiar")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  tipo === "familiar"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>🎗️</span> Homenagem Familiar
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange("pet")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  tipo === "pet"
                    ? "bg-purple-700 text-white border-purple-700 shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>🐾</span> Homenagem Pet
              </button>
            </div>

            {/* Formato & Tema */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Formato</label>
                <select
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as "feed" | "story")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-900"
                >
                  <option value="feed">Feed (Quadrado 1:1)</option>
                  <option value="story">Stories / WA Status (9:16)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Tema Visual</label>
                <select
                  value={tema}
                  onChange={(e) => setTema(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-900"
                >
                  <option value="dark">Escuro & Dourado</option>
                  <option value="maravilha">Mármore Solene</option>
                  <option value="celeste">Celeste & Prata</option>
                  <option value="pet">Roxo Pet 🐾</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Dados do Falecido */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>👤</span> {tipo === "pet" ? "Dados do Pet" : "Dados do Falecido"}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                {tipo === "pet" ? "Nome do Pet" : "Nome Completo"}
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria de Lourdes Oliveira"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Nascimento / Início</label>
                <input
                  type="text"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  placeholder="Ex: 12/03/1950"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Falecimento</label>
                <input
                  type="text"
                  value={dataFalecimento}
                  onChange={(e) => setDataFalecimento(e.target.value)}
                  placeholder="Ex: 29/07/2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Foto Upload */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Foto de Homenagem (Opcional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white"
                />
                {fotoUrl && (
                  <button
                    type="button"
                    onClick={() => setFotoUrl(null)}
                    className="px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl shrink-0"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>

            {/* Frase / Versículo */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Frase de Homenagem / Versículo</label>
              <select
                onChange={(e) => setMensagem(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 mb-2 focus:outline-none"
              >
                <option value="">-- Escolher uma Frase Pronta --</option>
                {PRESET_MENSAGENS[tipo].map((msg, i) => (
                  <option key={i} value={msg}>{msg.slice(0, 55)}...</option>
                ))}
              </select>

              <textarea
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Card 3: Informações do Velório & Sepultamento */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📍</span> Cerimônia de Despedida
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Local do Velório</label>
              <input
                type="text"
                value={localVelorio}
                onChange={(e) => setLocalVelorio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Horário do Velório</label>
              <input
                type="text"
                value={horarioVelorio}
                onChange={(e) => setHorarioVelorio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Local do Sepultamento / Cremação</label>
              <input
                type="text"
                value={localSepultamento}
                onChange={(e) => setLocalSepultamento(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Horário do Sepultamento</label>
              <input
                type="text"
                value={horarioSepultamento}
                onChange={(e) => setHorarioSepultamento(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Live Card Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-start sticky top-6">
          
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Pré-visualização em Tempo Real</span>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">{formato === "feed" ? "1080 x 1080px (Feed)" : "1080 x 1920px (Story)"}</span>
          </div>

          {/* Canvas Wrapper */}
          <div className="w-full flex justify-center bg-slate-200/60 p-4 rounded-3xl border border-slate-300/80 shadow-inner">
            <div
              ref={cardRef}
              style={{
                width: formato === "feed" ? "540px" : "420px",
                height: formato === "feed" ? "540px" : "740px",
                fontFamily: "var(--serif), Georgia, serif",
              }}
              className={`relative flex flex-col justify-between p-8 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${currentTheme.bg} text-white border ${currentTheme.border}`}
            >
              {/* Subtle Pattern Background Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/40 pointer-events-none" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/40 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/40 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/40 pointer-events-none" />

              {/* Top Header Card */}
              <div className="text-center relative z-10 flex flex-col items-center">
                
                {/* Logo & Ribbon */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  {/* Mourning Ribbon Icon */}
                  <svg className={`w-6 h-6 ${currentTheme.ribbonColor}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 2.2 1.3 4.1 3.2 5l-4.2 8.5c-.3.6.1 1.3.8 1.3h2.4c.4 0 .7-.2.9-.5L12 17.8l1.4 3c.2.3.5.5.9.5h2.4c.7 0 1.1-.7.8-1.3l-4.2-8.5c1.9-.9 3.2-2.8 3.2-5C16.5 4 14.5 2 12 2zm0 3c.8 0 1.5.7 1.5 1.5S12.8 8 12 8s-1.5-.7-1.5-1.5S11.2 5 12 5z"/>
                  </svg>
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-white/90">NOTÍCIA DE FALECIMENTO</span>
                </div>

                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent my-1" />
              </div>

              {/* Middle Section: Photo + Name + Message */}
              <div className="flex flex-col items-center text-center my-auto relative z-10 px-2 space-y-3">
                
                {/* Photo Frame (if uploaded) */}
                {fotoUrl ? (
                  <div className="relative w-24 h-24 min-[640px]:w-28 min-[640px]:h-28 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-xl mb-1 shrink-0">
                    <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-2xl mb-1 shadow-sm shrink-0">
                    {tipo === "pet" ? "🐾" : "🕊️"}
                  </div>
                )}

                {/* Name */}
                <h2 className="text-2xl min-[640px]:text-3xl font-extrabold tracking-tight leading-tight text-white">
                  {nome || "Nome do Ente Querido"}
                </h2>

                {/* Dates */}
                <p className={`text-xs min-[640px]:text-sm font-semibold uppercase tracking-widest ${currentTheme.accentText}`}>
                  {dataNascimento ? `* ${dataNascimento}` : ''} {dataFalecimento ? `† ${dataFalecimento}` : ''}
                </p>

                {/* Quote Message */}
                {mensagem && (
                  <p className={`text-xs min-[640px]:text-sm italic font-normal leading-relaxed max-w-md ${currentTheme.subText} pt-1`}>
                    "{mensagem}"
                  </p>
                )}
              </div>

              {/* Bottom Section: Ceremony Details Card */}
              <div className={`relative z-10 rounded-xl p-3.5 text-left border ${currentTheme.cardBg} backdrop-blur-md shadow-lg space-y-2 mt-auto`}>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className={`font-extrabold uppercase text-[10px] tracking-wider block ${currentTheme.accentText}`}>📍 Velório</span>
                    <p className="font-semibold text-white/90 text-[11px] leading-tight truncate">{localVelorio || "À definir"}</p>
                    <p className="text-[10px] text-white/70 mt-0.5">{horarioVelorio}</p>
                  </div>

                  <div>
                    <span className={`font-extrabold uppercase text-[10px] tracking-wider block ${currentTheme.accentText}`}>📍 Sepultamento</span>
                    <p className="font-semibold text-white/90 text-[11px] leading-tight truncate">{localSepultamento || "À definir"}</p>
                    <p className="text-[10px] text-white/70 mt-0.5">{horarioSepultamento}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 font-sans font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white tracking-wider">AmaVidas</span>
                    <span>· Assistência Funeral 24h</span>
                  </div>
                  <span>Águas Lindas & DF</span>
                </div>

              </div>

            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            💡 Dica: Ao clicar em <strong>"Baixar Imagem PNG"</strong>, a imagem acima será baixada em alta resolução pronta para publicação!
          </p>

        </div>

      </div>

    </div>
  );
}
