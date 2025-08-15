"use client";

import { useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

export default function DashboardHome() {
  const [longUrl, setLongUrl] = useState("");
  const [shortResult, setShortResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // QR states
  const [qrUrl, setQrUrl] = useState("");
  const [qrPng, setQrPng] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrErr, setQrErr] = useState("");

  // --- Shortener ---
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

  // --- QR generate (PNG) ---
  const onGenerateQr = async () => {
    setQrErr("");
    setQrPng("");
    if (!qrUrl) { setQrErr("Enter a URL"); return; }
    try {
      setQrLoading(true);
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        errorCorrectionLevel: "M",
        width: 256,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrPng(dataUrl);
    } catch {
      setQrErr("Failed to generate QR");
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQr = () => {
    if (!qrPng) return;
    const a = document.createElement("a");
    a.href = qrPng;
    a.download = "qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const editMoreHref = `/dashboard/qr?url=${encodeURIComponent(qrUrl)}&size=256&margin=2&ecc=M`;

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
            <code className="px-3 py-2 rounded-md bg-white border border-orange-200 text-orange-800 break-all flex-1">
              {shortResult.shortUrl}
            </code>
            <CopyButton text={shortResult.shortUrl} />
          </div>
        )}
      </section>

      {/* QR code */}
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

        <button
          onClick={onGenerateQr}
          disabled={qrLoading}
          className="mt-3 w-full sm:w-auto px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-60"
        >
          {qrLoading ? "Generating..." : "Generate"}
        </button>

        {qrErr && (
          <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            {qrErr}
          </div>
        )}

        {qrPng && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <img
              src={qrPng}
              alt="QR preview"
              className="h-40 w-40 rounded-md border border-orange-200 bg-white p-2"
            />
            <div className="flex gap-2">
              <button
                onClick={downloadQr}
                className="px-3 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
              >
                Download PNG
              </button>
              <a
                href={editMoreHref}
                className="px-3 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Edit more
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
