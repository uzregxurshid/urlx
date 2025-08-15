"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-orange-100 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="inline-block h-8 w-8 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm" />
          <span className="font-semibold tracking-tight text-orange-700 group-hover:text-orange-800 transition-colors">
            urlx
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 text-sm transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-3 py-1.5 rounded-md bg-orange-600 text-white hover:bg-orange-700 text-sm transition-colors"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
