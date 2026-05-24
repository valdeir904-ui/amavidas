"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ModalState = {
  form: { open: boolean; preselectedPlan?: string };
  testimonials: { open: boolean };
  simulador: { open: boolean };
};

type ModalContextType = {
  modal: ModalState;
  openForm: (plan?: string) => void;
  closeForm: () => void;
  openTestimonials: () => void;
  closeTestimonials: () => void;
  openSimulador: () => void;
  closeSimulador: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    form: { open: false },
    testimonials: { open: false },
    simulador: { open: false },
  });

  const openForm = useCallback((plan?: string) => {
    setModal((m) => ({ ...m, form: { open: true, preselectedPlan: plan } }));
    document.body.style.overflow = "hidden";
  }, []);

  const closeForm = useCallback(() => {
    setModal((m) => ({ ...m, form: { open: false, preselectedPlan: undefined } }));
    document.body.style.overflow = "";
  }, []);

  const openTestimonials = useCallback(() => {
    setModal((m) => ({ ...m, testimonials: { open: true } }));
    document.body.style.overflow = "hidden";
  }, []);

  const closeTestimonials = useCallback(() => {
    setModal((m) => ({ ...m, testimonials: { open: false } }));
    document.body.style.overflow = "";
  }, []);

  const openSimulador = useCallback(() => {
    setModal((m) => ({ ...m, simulador: { open: true } }));
    document.body.style.overflow = "hidden";
  }, []);

  const closeSimulador = useCallback(() => {
    setModal((m) => ({ ...m, simulador: { open: false } }));
    document.body.style.overflow = "";
  }, []);

  return (
    <ModalContext.Provider value={{ modal, openForm, closeForm, openTestimonials, closeTestimonials, openSimulador, closeSimulador }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside ModalProvider");
  return ctx;
}
