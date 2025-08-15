"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkIcon, QrCodeIcon } from "@heroicons/react/24/outline";

export default function ShortenerHero() {
  const [mode, setMode] = useState("link"); // 'link' | 'qr'
  const [url, setUrl] = useState("");
  const router = useRouter();

  const onGenerate = (e) => {
    e.preventDefault();
    router.push("/login"); // auth required
  };

  return (
    <section className="bg-gradient-to-b from-white to-orange-50/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Headline */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-orange-800">
            Shorten links & generate QR codes with analytics
          </h1>
          <p className="text-orange-900/70">
            Create branded short links and track engagement by country, referrer, and device.
          </p>
        </div>

        {/* Toggle + Form */}
        <form
          onSubmit={onGenerate}
          className="mx-auto max-w-3xl bg-white border border-orange-100 rounded-xl p-4 sm:p-6 shadow-sm"
        >
          {/* Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                mode === "link"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-orange-200 text-orange-700 hover:bg-orange-50"
              }`}
            >
              <LinkIcon className="h-5 w-5" />
              Link
            </button>

            <button
              type="button"
              onClick={() => setMode("qr")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                mode === "qr"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-orange-200 text-orange-700 hover:bg-orange-50"
              }`}
            >
              <QrCodeIcon className="h-5 w-5" />
              QR
            </button>
          </div>

          {/* URL input */}
          <label className="block text-sm font-medium mb-2 text-orange-900">
            Enter URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              placeholder="https://example.com/some/long/path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              Generate
            </button>
          </div>

          {/* Helper */}
          <p className="text-xs text-orange-700 mt-2">
            Clicking “Generate” will ask you to log in before creating a {mode === "qr" ? "QR code" : "short link"}.
          </p>
        </form>
      </div>
    </section>
  );
}
