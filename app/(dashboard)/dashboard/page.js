"use client";

import { useState } from "react";

export default function DashboardHome() {
  const [longUrl, setLongUrl] = useState("");
  const [shortResult, setShortResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [qrUrl, setQrUrl] = useState("");

  const onShorten = async () => {
    setErr("");
    setShortResult(null);
    if (!longUrl) { setErr("Enter a URL"); return; }

    try {
      setLoading(true);
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ longUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Failed to create link");
        return;
      }
      setShortResult(data);
      setLongUrl("");
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyShort = async () => {
    if (!shortResult?.shortUrl) return;
    try { await navigator.clipboard.writeText(shortResult.shortUrl); } catch {}
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-800">Home</h1>

      {/* Short link */}
      <section className="border border-orange-100 rounded-xl p-4 sm:p-5 bg-orange-50/40">
        <h2 className="font-semibold text-orange-800 mb-3">Create short link</h2>

        <label className="block text-sm font-medium text-orange-900 mb-2">Destination URL</label>
        <input
          type="url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="https://long.url/path"
          className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
        />

        <button
          onClick={onShorten}
          disabled={loading}
          className="mt-3 w-full sm:w-auto px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Shorten"}
        </button>

        {err && (
          <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            {err}
          </div>
        )}

        {shortResult?.shortUrl && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
            <code className="px-3 py-2 rounded-md bg-white border border-orange-200 text-orange-800 break-all">
              {shortResult.shortUrl}
            </code>
            <button
              onClick={copyShort}
              className="px-3 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Copy
            </button>
          </div>
        )}

        <p className="text-xs text-orange-900/70 mt-2">
          Your short link will redirect via <code>/r/[slug]</code>.
        </p>
      </section>

      {/* QR code (stub, separate step) */}
      <section className="border border-orange-100 rounded-xl p-4 sm:p-5 bg-orange-50/40">
        <h2 className="font-semibold text-orange-800 mb-3">Generate QR</h2>
        <label className="block text-sm font-medium text-orange-900 mb-2">URL for QR</label>
        <input
          type="url"
          value={qrUrl}
          onChange={(e) => setQrUrl(e.target.value)}
          placeholder="https://your.url"
          className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
        />
        <button className="mt-3 w-full sm:w-auto px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50">
          Generate
        </button>
        <p className="text-xs text-orange-900/70 mt-2">
          We’ll connect QR to its API route next.
        </p>
      </section>
    </div>
  );
}
