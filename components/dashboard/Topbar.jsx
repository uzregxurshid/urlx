"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Topbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const d = await r.json();
        if (d?.authenticated) setUser(d.user);
      } catch {}
    })();
  }, []);

  const onLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
    router.replace("/login"); router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-orange-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-orange-200 text-orange-700 hover:bg-orange-50"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <Image src="/logo-wordmark.svg" alt="urlx" width={110} height={24} className="hidden sm:block" />

        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-orange-900/80 hidden sm:block">{user.email}</span>
          )}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
