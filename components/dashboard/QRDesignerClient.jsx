"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function QRDesignerClient() {
  const sp = useSearchParams();

  const [url, setUrl] = useState("");
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [ecc, setEcc] = useState("M");
  const [png, setPng] = useState("");
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");

  // Prefill from query
  useEffect(() => {
    const qUrl = sp.get("url") || "";
    const qSize = Number(sp.get("size") || 256);
    const qMargin = Number(sp.get("margin") || 2);
    const qEcc = sp.get("ecc") || "M";
    setUrl(qUrl);
    setSize(Number.isFinite(qSize) ? qSize : 256);
    setMargin(Number.isFinite(qMargin) ? qMargin : 2);
    setEcc(["L","M","Q","H"].includes(qEcc) ? qEcc : "M");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate preview (debounced)
  useEffect(() => {
    let t = setTimeout(async () => {
      try {
        setErr("");
        setPng("");
        setSvg("");
        if (!url) return;
        const QRCode = (await import("qrcode")).default;
        const opts = {
          errorCorrectionLevel: ecc,
          width: size,
          margin,
          color: { dark: "#000000", light: "#ffffff" },
        };
        const dataUrl = await QRCode.toDataURL(url, opts);
        const svgStr = await QRCode.toString(url, { ...opts, type: "svg" });
        setPng(dataUrl);
        setSvg(svgStr);
      } catch {
        setErr("Failed to render QR");
      }
    }, 200);
    return () => clearTimeout(t);
  }, [url, size, margin, ecc]);

  const downloadPng = () => {
    if (!png) return;
    const a = document.createElement("a");
    a.href = png;
    a.download = "qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = "qr.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlBlob);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-orange-800">QR Designer</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="border border-orange-100 rounded-xl p-4 bg-white">
          <h2 className="font-semibold text-orange-800 mb-3">Design</h2>

          <label className="block text-sm font-medium text-orange-900 mb-1">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your.url"
            className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
          />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <label className="text-sm flex items-center gap-2">
              Size
              <input
                type="number"
                min={128}
                max={1024}
                value={size}
                onChange={(e) => setSize(Math.min(1024, Math.max(128, Number(e.target.value) || 256)))}
                className="ml-auto w-24 rounded-md border border-orange-200 px-2 py-1 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              />
            </label>

            <label className="text-sm flex items-center gap-2">
              Margin
              <input
                type="number"
                min={0}
                max={10}
                value={margin}
                onChange={(e) => setMargin(Math.min(10, Math.max(0, Number(e.target.value) || 2)))}
                className="ml-auto w-24 rounded-md border border-orange-200 px-2 py-1 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              />
            </label>

            <label className="text-sm flex items-center gap-2 col-span-2">
              ECC
              <select
                value={ecc}
                onChange={(e) => setEcc(e.target.value)}
                className="ml-2 rounded-md border border-orange-200 px-2 py-1 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                <option value="L">L (low)</option>
                <option value="M">M (medium)</option>
                <option value="Q">Q (quartile)</option>
                <option value="H">H (high)</option>
              </select>
            </label>
          </div>

          {err && (
            <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              {err}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="border border-orange-100 rounded-xl p-4 bg-white flex flex-col items-center justify-center">
          {png ? (
            <>
              <img
                src={png}
                alt="QR preview"
                className="h-64 w-64 rounded-md border border-orange-200 bg-white p-2"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={downloadPng}
                  className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
                >
                  Download PNG
                </button>
                <button
                  onClick={downloadSvg}
                  className="px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Download SVG
                </button>
              </div>
            </>
          ) : (
            <div className="h-64 w-64 rounded-md border border-orange-200 bg-orange-50/60 grid place-items-center text-orange-700">
              Enter a URL to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
