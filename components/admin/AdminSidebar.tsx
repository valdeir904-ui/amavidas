"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
      </svg>
    ),
  },
  {
    label: "Análise de Funil",
    href: "/admin/funil",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
  },
  {
    label: "Análise por Canal",
    href: "/admin/analise-canais",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    label: "Oportunidades",
    href: "/admin/oportunidades",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Planos",
    href: "/admin/planos",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Depoimentos",
    href: "/admin/depoimentos",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Parceiros",
    href: "/admin/parceiros",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Usuários",
    href: "/admin/usuarios",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Nota de Falecimento",
    href: "/admin/nota-falecimento",
    soon: false,
    icon: (
      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 2.2 1.3 4.1 3.2 5l-4.2 8.5c-.3.6.1 1.3.8 1.3h2.4c.4 0 .7-.2.9-.5L12 17.8l1.4 3c.2.3.5.5.9.5h2.4c.7 0 1.1-.7.8-1.3l-4.2-8.5c1.9-.9 3.2-2.8 3.2-5C16.5 4 14.5 2 12 2zm0 3c.8 0 1.5.7 1.5 1.5S12.8 8 12 8s-1.5-.7-1.5-1.5S11.2 5 12 5z"/>
      </svg>
    ),
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    soon: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ perfil: string; nome?: string; email?: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const visibleNavItems = navItems.filter((item) => {
    if (currentUser?.perfil !== "MASTER") {
      return item.label === "Dashboard" || item.label === "Oportunidades" || item.label === "Nota de Falecimento";
    }
    return true;
  });

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className={`px-4 py-4 border-b border-white/10 relative flex flex-col items-center justify-center transition-all ${collapsed ? "h-20" : "h-28"}`}>
        <div className={`relative transition-all mx-auto ${collapsed ? "w-8 h-8 mb-0" : "w-14 h-14 mb-1"}`}>
          <Image
            src="/logo.png"
            alt="AmaVidas"
            fill
            sizes="56px"
            className="object-contain brightness-0 invert"
          />
        </div>
        {!collapsed && <p className="text-white/40 text-xs text-center mt-1">Painel Admin</p>}
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} py-4 space-y-0.5 overflow-y-auto overflow-x-hidden`}>
        {!collapsed && <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>}
        {!currentUser ? (
          <div className="px-3 py-2 space-y-3">
            <div className="h-8 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="h-8 bg-white/5 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          visibleNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.soon ? "#" : item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"} rounded-xl text-sm font-medium transition-all group relative ${
                  active
                    ? "bg-white/10 text-white"
                    : item.soon
                    ? "text-white/30 cursor-not-allowed"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#4f6ef7] to-[#06b6d4] rounded-full ${collapsed ? "ml-1" : ""}`} />
                )}
                <span className={active ? "text-white" : ""}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    {item.soon && (
                      <span className="text-[10px] font-semibold bg-white/10 text-white/40 px-1.5 py-0.5 rounded-full">
                        Em breve
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })
        )}
      </nav>

      {/* Bottom */}
      <div className={`px-2 py-4 border-t border-white/10 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <Link
          href="/"
          title={collapsed ? "Ver site" : undefined}
          className={`flex items-center gap-3 ${collapsed ? "justify-center px-0 py-3 w-full" : "px-3 py-2.5"} rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {!collapsed && <span>Ver site</span>}
        </Link>
        
        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={`w-full flex items-center gap-3 ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"} rounded-xl text-sm text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sair</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4f6ef7] to-[#06b6d4] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs font-medium truncate">
                {currentUser?.email?.split("@")[0] || "Usuário"}
              </p>
              <p className="text-white/30 text-xs truncate">
                {currentUser?.perfil === "MASTER" ? "Admin Master" : "Atendente"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full w-60 bg-[#0f1729] z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent collapsed={false} />
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col min-h-screen bg-[#0f1729] flex-shrink-0 sticky top-0 h-screen transition-all duration-300 relative z-20 ${isCollapsed ? "w-20" : "w-60"}`}>
        <SidebarContent collapsed={isCollapsed} />
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 w-7 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-105 shadow-md transition-all z-50 cursor-pointer"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    </>
  );
}
