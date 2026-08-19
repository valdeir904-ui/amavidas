import { Metadata } from "next";
import ChatSimulador from "@/components/ChatSimulador";

export const metadata: Metadata = {
  title: "Simulação Conversacional | AmaVidas",
  description: "Converse com a nossa assistente e descubra o plano ideal para você em poucos passos.",
};

export default function SimuladorChatPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center sm:py-6 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Container que no mobile ocupa 100vh e no desktop simula um celular elegante */}
      <div className="w-full h-[100dvh] sm:h-[85vh] sm:max-h-[820px] sm:max-w-md sm:rounded-[36px] sm:overflow-hidden sm:border-[6px] sm:border-slate-800 relative bg-white shadow-2xl shadow-emerald-950/30 flex flex-col">
        <ChatSimulador />
      </div>
    </div>
  );
}
