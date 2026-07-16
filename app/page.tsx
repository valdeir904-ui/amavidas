import { ModalProvider } from "@/contexts/ModalContext";
import ModalFormulario from "@/components/ModalFormulario";
import ModalDepoimentos from "@/components/ModalDepoimentos";
import ModalSimulador from "@/components/ModalSimulador";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImpactoFinanceiro from "@/components/ImpactoFinanceiro";
import Diferenciais from "@/components/Diferenciais";
import Testimonials from "@/components/Testimonials";
import Plans from "@/components/Plans";
import ClubeDescontos from "@/components/ClubeDescontos";
import SimuladorSection from "@/components/SimuladorSection";
import Sobre from "@/components/Sobre";
import FAQ from "@/components/FAQ";
import ComoFunciona from "@/components/ComoFunciona";
import CTAFinal from "@/components/CTAFinal";
import Footer from "@/components/Footer";
import WhatsAppFlutuante from "@/components/WhatsAppFlutuante";
import SocialProofToast from "@/components/SocialProofToast";

export default function HomePage() {
  return (
    <ModalProvider>
      <Navbar />
      <main>
        <Hero />
        <ImpactoFinanceiro />
        <ComoFunciona />
        <Diferenciais />
        <Testimonials />
        <Plans />
        <ClubeDescontos />
        <SimuladorSection />
        <Sobre />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <WhatsAppFlutuante />
      <SocialProofToast />
      {/* Global modals */}
      <ModalFormulario />
      <ModalDepoimentos />
      <ModalSimulador />
    </ModalProvider>
  );
}
