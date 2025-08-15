"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-orange-100 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
                  <Image src="/logo-wordmark.svg" alt="urlx" width={110} height={24} className="hidden sm:block" />

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
