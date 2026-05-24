"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 16 },
  },
};

function DashboardMockup() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-[500px] bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
    >
      {/* Top Mac-style dots */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="text-white/20 text-[11px] ml-2 font-mono">painel.amavidas.com.br/dashboard</span>
      </div>

      {/* Grid of 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {/* KPI 1 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 relative overflow-hidden"
          whileHover={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Leads Totais</p>
          <p className="text-white text-xl font-bold mt-1">1.482</p>
          <div className="text-[#00B4C8] text-[9px] font-semibold flex items-center gap-0.5 mt-1.5">
            <span>↑ 12.4%</span>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 relative overflow-hidden"
          whileHover={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Simulações</p>
          <p className="text-white text-xl font-bold mt-1">842</p>
          <div className="text-emerald-400 text-[9px] font-semibold flex items-center gap-0.5 mt-1.5">
            <span>↑ 8.2%</span>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 relative overflow-hidden"
          whileHover={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Conversão</p>
          <p className="text-white text-xl font-bold mt-1">68.4%</p>
          <div className="text-[#C4336A] text-[9px] font-semibold flex items-center gap-0.5 mt-1.5">
            <span>↑ 4.1%</span>
          </div>
        </motion.div>
      </div>

      {/* Main Chart Area */}
      <motion.div
        variants={itemVariants}
        className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <p className="text-white/70 text-xs font-semibold">Evolução de Leads (Últimos 7 dias)</p>
          <span className="text-[9px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full font-mono">LIVE</span>
        </div>
        
        {/* SVG Line Chart */}
        <div className="h-28 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B4C8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00B4C8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2B3DA8" />
                <stop offset="50%" stopColor="#00B4C8" />
                <stop offset="100%" stopColor="#C4336A" />
              </linearGradient>
            </defs>
            {/* Gridlines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
            
            {/* Area under the line */}
            <path
              d="M 0 85 Q 50 65 100 75 T 200 45 T 300 25 T 400 15 L 400 100 L 0 100 Z"
              fill="url(#chartGradient)"
            />
            {/* Line path */}
            <path
              d="M 0 85 Q 50 65 100 75 T 200 45 T 300 25 T 400 15"
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Glowing dots */}
            <circle cx="200" cy="45" r="4" fill="#00B4C8" stroke="white" strokeWidth="1.5" />
            <circle cx="400" cy="15" r="4" fill="#C4336A" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      </motion.div>

      {/* Recent Leads Activity feed */}
      <motion.div
        variants={itemVariants}
        className="bg-white/[0.04] border border-white/10 rounded-xl p-4"
      >
        <p className="text-white/70 text-xs font-semibold mb-3">Últimas Simulações</p>
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="flex justify-between items-center text-[12px] border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E8EBFB] text-[#2B3DA8] font-bold grid place-items-center text-[10px]">
                RM
              </div>
              <div>
                <span className="text-white/80 font-medium">Rosângela Martins</span>
                <span className="text-white/30 text-[10px] ml-1.5">Águas Lindas, GO</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#E2F7FA]/10 text-[#00B4C8] px-2 py-0.5 rounded-full text-[10px] font-medium">
                Família
              </span>
              <span className="text-white/30 text-[10px]">2m atrás</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex justify-between items-center text-[12px] border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FBE9F0] text-[#C4336A] font-bold grid place-items-center text-[10px]">
                AK
              </div>
              <div>
                <span className="text-white/80 font-medium">Arthur Kovalik</span>
                <span className="text-white/30 text-[10px] ml-1.5">Goiânia, GO</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FBE9F0]/10 text-[#C4336A] px-2 py-0.5 rounded-full text-[10px] font-medium">
                Premium
              </span>
              <span className="text-white/30 text-[10px]">15m atrás</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const resp = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setErro(data.error || "E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      const redirect = searchParams.get("redirect") ?? "/admin/dashboard";
      router.push(redirect);
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-screen grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] bg-[#F8F6F2] overflow-hidden font-sans">
      {/* Coluna 1: Formulário de Login */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white relative z-10 shadow-2xl lg:shadow-none h-full overflow-hidden">
        {/* Topo: Logo */}
        <div className="flex items-center">
          <div className="relative h-12 w-40">
            <Image
              src="/logo-amavidas-transparent.png"
              alt="AmaVidas"
              fill
              sizes="160px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Centro: Formulário */}
        <div className="w-full max-w-sm mx-auto my-auto py-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-[#1A1F36] font-serif text-3xl font-medium tracking-tight mb-2">
              Acesso restrito
            </h1>
            <p className="text-[#4A5066] text-sm mb-8">
              Digite suas credenciais administrativas para continuar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#1A1F36] font-semibold text-xs uppercase tracking-wider mb-2">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@amavidas.com.br"
                  className="w-full bg-[#F8F6F2] border border-[#D8D3C7] rounded-xl px-4 py-3.5 text-[#1A1F36] placeholder:text-[#767C92] focus:border-[#2B3DA8] focus:ring-2 focus:ring-[#2B3DA8]/10 focus:outline-none transition-all text-sm font-medium"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[#1A1F36] font-semibold text-xs uppercase tracking-wider mb-2">
                  Senha do Painel
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#F8F6F2] border border-[#D8D3C7] rounded-xl px-4 py-3.5 text-[#1A1F36] placeholder:text-[#767C92] focus:border-[#2B3DA8] focus:ring-2 focus:ring-[#2B3DA8]/10 focus:outline-none transition-all text-sm pr-12 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767C92] hover:text-[#1A1F36] transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <AnimatePresence mode="wait">
                  {erro && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-[#FBE9F0] border border-[#f5c6d6] text-[#C4336A] text-[13px] font-semibold rounded-xl px-4 py-3 flex items-start gap-2.5"
                    >
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#C4336A]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{erro}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !email || !senha}
                className="w-full bg-[#2B3DA8] text-white font-semibold py-4 rounded-xl text-sm transition-all hover:bg-[#1E2D7D] shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <span>Entrar no painel</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Rodapé: Copyright */}
        <div className="flex items-center justify-between text-xs text-[#767C92] border-t border-[#E7E4DC] pt-6">
          <span>AmaVidas &copy; {new Date().getFullYear()}</span>
          <span>Área Restrita</span>
        </div>
      </div>

      {/* Coluna 2: Showcase Visual (oculta em mobile) */}
      <div
        className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden p-16"
        style={{
          background: "radial-gradient(circle at 60% 40%, #1e2e7d 0%, #0a1021 100%)",
        }}
      >
        {/* Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00B4C8]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C4336A]/10 blur-[120px] pointer-events-none" />

        {/* Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full stroke-white/[0.015] [mask-image:radial-gradient(80%_80%_at_center,white,transparent)] pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse" x="-1" y="-1">
              <path d="M.5 48V.5H48" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="none" strokeWidth="0" />
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Mockup Container */}
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-white font-serif text-2xl font-normal mb-2">
              Gestão ágil e acolhedora
            </h2>
            <p className="text-white/50 text-sm max-w-sm">
              Monitore leads em tempo real, gerencie os planos e entre em contato via WhatsApp direto pelo painel de controle.
            </p>
          </div>
          
          <DashboardMockup />
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen h-[100dvh] bg-[#F8F6F2] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#2B3DA8]/20 border-t-[#2B3DA8] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
