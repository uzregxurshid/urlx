"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validators";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Client-side fallback: if already signed in, bounce to dashboard
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        const d = await r.json();
        if (d?.authenticated) {
          router.replace("/dashboard");
          router.refresh();
        }
      } catch {}
    })();
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",             // ✅ important
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      // Make sure navigation sees the new cookie
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center bg-gradient-to-b from-white to-orange-50/40">
      <div className="w-full max-w-md bg-white border border-orange-100 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-orange-800 mb-1">Welcome back</h1>
        <p className="text-sm text-orange-900/70 mb-6">
          Log in to manage your links and QR codes.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-orange-900 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-900 mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-orange-600 text-white py-2 hover:bg-orange-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-orange-900/70 mt-4">
          Don’t have an account?{" "}
          <Link href="/register" className="text-orange-700 hover:text-orange-800 underline">
            Register
          </Link>
        </p>
        <p className="text-sm text-orange-900/70 mt-2">
          Forgot your password?{" "}
          <Link href="/forgotpassword" className="text-orange-700 hover:text-orange-800 underline">
            Restore
          </Link>
        </p>
      </div>
    </div>
  );
}
