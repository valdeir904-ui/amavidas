"use client";

import { useEffect, useRef } from "react";

export default function TrackVisita() {
  const trackedScroll = useRef(false);
  const trackedBottom = useRef(false);

  useEffect(() => {
    // Registra a visita inicial
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "visita" }),
    }).catch(() => {});

    // Registra o scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      if (!trackedScroll.current && scrollY > 200) {
        trackedScroll.current = true;
        fetch("/api/eventos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "iniciou_scroll" }),
        }).catch(() => {});
      }

      if (!trackedBottom.current && (scrollY + winHeight >= docHeight - 300)) {
        trackedBottom.current = true;
        fetch("/api/eventos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "chegou_ao_fim" }),
        }).catch(() => {});
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
