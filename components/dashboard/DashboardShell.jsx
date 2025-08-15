"use client";

import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

export default function DashboardShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-orange-50/40">
      <Topbar onMenuClick={() => setMobileOpen(true)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-56 shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 bg-white border border-orange-100 rounded-xl shadow-sm p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
