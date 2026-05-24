"use client";

import { useEffect } from "react";

export default function TrackVisita() {
  useEffect(() => {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "visita" }),
    }).catch(() => {});
  }, []);

  return null;
}
