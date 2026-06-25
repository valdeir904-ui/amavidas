import { Metadata } from "next";
import ChatSimulador from "@/components/ChatSimulador";

export const metadata: Metadata = {
  title: "Simulação Conversacional | AmaVidas",
  description: "Converse com a nossa assistente e descubra o plano ideal para você em poucos passos.",
};

export default function SimuladorChatPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center sm:py-6">
      {/* Container que no mobile ocupa 100vh e no desktop simula um celular */}
      <div className="w-full h-[100dvh] sm:h-[85vh] sm:max-h-[800px] sm:max-w-md sm:rounded-[40px] sm:overflow-hidden sm:border-8 sm:border-slate-800 relative bg-white shadow-2xl flex flex-col">
        <ChatSimulador />
      </div>
    </div>
  );
}
