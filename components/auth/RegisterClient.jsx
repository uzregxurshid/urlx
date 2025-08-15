"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validators";

export default function RegisterClient() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    dob: "",
    country: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // If already signed in, bounce to dashboard
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

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",           // ✅ important
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Registration failed");
        return;
      }

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
        <h1 className="text-2xl font-bold text-orange-800 mb-1">Create your account</h1>
        <p className="text-sm text-orange-900/70 mb-6">Start shortening links and making QR codes.</p>

        {error && (
          <div className="mb-4 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Surname</label>
              <input
                name="surname"
                value={form.surname}
                onChange={onChange}
                className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={onChange}
                className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Country</label>
              <input
                name="country"
                value={form.country}
                onChange={onChange}
                className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                placeholder="Uzbekistan"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-900 mb-1">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-900 mb-1">Password</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={onChange}
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
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-orange-900/70 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-700 hover:text-orange-800 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
