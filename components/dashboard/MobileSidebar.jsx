"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { navItems } from "./Sidebar";
import Image from "next/image";

export default function MobileSidebar({ open, onClose }) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { onClose?.(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pathname]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-72 bg-white border-r border-orange-100 shadow-lg
                    transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-14 px-4 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
                      <Image src="/logo-wordmark.svg" alt="urlx" width={110} height={24} className="hidden sm:block" />
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-orange-200 text-orange-700 hover:bg-orange-50"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors w-full ${
                  active
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white border-orange-100 text-orange-800 hover:bg-orange-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
