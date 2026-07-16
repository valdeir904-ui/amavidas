"use client";

import { useEffect, useRef } from "react";

function detectarDispositivo(): string {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|webos|fennec|windvane/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export default function TrackVisita() {
  const trackedScroll = useRef(false);
  const trackedBottom = useRef(false);

  useEffect(() => {
    // 1. Capturar parâmetros da URL e informações do navegador
    const params = new URLSearchParams(window.location.search);
    const origem = {
      utmSource: params.get("utm_source") || null,
      utmMedium: params.get("utm_medium") || null,
      utmCampaign: params.get("utm_campaign") || null,
      utmTerm: params.get("utm_term") || null,
      utmContent: params.get("utm_content") || null,
      gclid: params.get("gclid") || null,
      fbclid: params.get("fbclid") || null,
      referrer: document.referrer || null,
      landingPage: window.location.pathname,
      dispositivo: detectarDispositivo(),
    };

    const jaExiste = sessionStorage.getItem("amavidas_origem");
    const temSinal = origem.utmSource || origem.gclid || origem.fbclid;

    let finalOrigem = origem;

    if (temSinal && !jaExiste) {
      sessionStorage.setItem("amavidas_origem", JSON.stringify(origem));
      finalOrigem = origem;
    } else if (!temSinal && !jaExiste) {
      const org = {
        ...origem,
        utmSource: null,
        referrer: document.referrer || "direto",
      };
      sessionStorage.setItem("amavidas_origem", JSON.stringify(org));
      finalOrigem = org;
    } else if (jaExiste) {
      try {
        finalOrigem = JSON.parse(jaExiste);
      } catch (e) {
        finalOrigem = origem;
      }
    }

    // 2. Registrar a visita inicial com a origem carregada
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "visita",
        utmSource: finalOrigem.utmSource || null,
        utmMedium: finalOrigem.utmMedium || null,
        utmCampaign: finalOrigem.utmCampaign || null,
        utmTerm: finalOrigem.utmTerm || null,
        utmContent: finalOrigem.utmContent || null,
        gclid: finalOrigem.gclid || null,
        fbclid: finalOrigem.fbclid || null,
        referrer: finalOrigem.referrer || null,
        landingPage: finalOrigem.landingPage || null,
        dispositivo: finalOrigem.dispositivo || null,
      }),
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
          body: JSON.stringify({ 
            tipo: "iniciou_scroll",
            utmSource: finalOrigem.utmSource || null,
            utmMedium: finalOrigem.utmMedium || null,
            utmCampaign: finalOrigem.utmCampaign || null,
            utmTerm: finalOrigem.utmTerm || null,
            utmContent: finalOrigem.utmContent || null,
            gclid: finalOrigem.gclid || null,
            fbclid: finalOrigem.fbclid || null,
            referrer: finalOrigem.referrer || null,
            landingPage: finalOrigem.landingPage || null,
            dispositivo: finalOrigem.dispositivo || null,
          }),
        }).catch(() => {});
      }

      if (!trackedBottom.current && (scrollY + winHeight >= docHeight - 300)) {
        trackedBottom.current = true;
        fetch("/api/eventos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            tipo: "chegou_ao_fim",
            utmSource: finalOrigem.utmSource || null,
            utmMedium: finalOrigem.utmMedium || null,
            utmCampaign: finalOrigem.utmCampaign || null,
            utmTerm: finalOrigem.utmTerm || null,
            utmContent: finalOrigem.utmContent || null,
            gclid: finalOrigem.gclid || null,
            fbclid: finalOrigem.fbclid || null,
            referrer: finalOrigem.referrer || null,
            landingPage: finalOrigem.landingPage || null,
            dispositivo: finalOrigem.dispositivo || null,
          }),
        }).catch(() => {});
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
