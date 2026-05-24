"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Simulador from "@/components/Simulador";

export default function SimulacaoPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <motion.header
        className="bg-surface border-b border-border px-5 py-4 flex-shrink-0"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-36">
              <Image
                src="/logo.svg"
                alt="AmaVidas"
                fill
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
      </motion.header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 py-10 md:py-14">
        <motion.div
          className="w-full max-w-lg bg-surface rounded-3xl border border-border p-6 md:p-9 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          <Simulador />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 px-5 text-center flex-shrink-0">
        <p className="text-sm text-muted">
          🔒 Seus dados são protegidos. A AmaVidas não compartilha informações com terceiros.
        </p>
      </footer>
    </div>
  );
}
