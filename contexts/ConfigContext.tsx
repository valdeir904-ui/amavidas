"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ConfigContextType = {
  configs: Record<string, string>;
  loading: boolean;
};

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        if (data.configs) {
          setConfigs(data.configs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConfigContext.Provider value={{ configs, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside ConfigProvider");
  return ctx;
}
