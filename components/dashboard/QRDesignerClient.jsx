"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

/** Friendly named palettes (bg = background, a/b = gradient colors) */
const PALETTES = [
  { id: "orange",  name: "Sunset Orange",     bg: "#fff7ed", a: "#ea580c", b: "#7c2d12" },
  { id: "ocean",   name: "Ocean Blue",        bg: "#eff6ff", a: "#2563eb", b: "#1e3a8a" },
  { id: "teal",    name: "Teal Breeze",       bg: "#ecfeff", a: "#0ea5e9", b: "#0f766e" },
  { id: "emerald", name: "Emerald Green",     bg: "#f0fdf4", a: "#16a34a", b: "#065f46" },
  { id: "forest",  name: "Forest Moss",       bg: "#f7fee7", a: "#65a30d", b: "#365314" },
  { id: "amber",   name: "Amber Glow",        bg: "#fffbeb", a: "#f59e0b", b: "#92400e" },
  { id: "rose",    name: "Rose Pink",         bg: "#fff1f2", a: "#db2777", b: "#831843" },
  { id: "magenta", name: "Hot Magenta",       bg: "#fdf4ff", a: "#a855f7", b: "#6b21a8" },
  { id: "purple",  name: "Royal Purple",      bg: "#faf5ff", a: "#8b5cf6", b: "#5b21b6" },
  { id: "grape",   name: "Grape Jelly",       bg: "#f5f3ff", a: "#7c3aed", b: "#4c1d95" },
  { id: "candy",   name: "Candy Pop",         bg: "#fff7fb", a: "#ec4899", b: "#db2777" },
  { id: "lava",    name: "Lava Red",          bg: "#fef2f2", a: "#ef4444", b: "#7f1d1d" },
  { id: "midnight",name: "Midnight",          bg: "#f3f4f6", a: "#111827", b: "#334155" },
  { id: "coffee",  name: "Coffee Brown",      bg: "#fafaf9", a: "#92400e", b: "#3f2d20" },
];

const DOT_TYPES = ["rounded", "dots", "classy", "classy-rounded", "square", "extra-rounded"];
const CORNER_SQUARE_TYPES = ["square", "extra-rounded"];
const CORNER_DOT_TYPES = ["dot", "square"];
const ECCS = ["L", "M", "Q", "H"];

export default function QRDesignerClient() {
  const sp = useSearchParams();

  const [url, setUrl] = useState("");
  const [size, setSize] = useState(256);
  const [sizeText, setSizeText] = useState("256");
  const [margin, setMargin] = useState(2);
  const [marginText, setMarginText] = useState("2");
  const [ecc, setEcc] = useState("M");
  const [err, setErr] = useState("");

  // style state (palette via id so select shows names, not hex)
  const [style, setStyle] = useState({
    dotsType: "rounded",
    cornerSquareType: "square",
    cornerDotType: "dot",
    paletteId: "orange",
  });

  // derive actual palette object
  const palette = useMemo(
    () => PALETTES.find((p) => p.id === style.paletteId) ?? PALETTES[0],
    [style.paletteId]
  );

  // qr-code-styling instance + container
  const qr = useRef(null);
  const containerRef = useRef(null);

  // Prefill from query
  useEffect(() => {
    const qUrl = sp.get("url") || "";
    const qSize = Number(sp.get("size") || 256);
    const qMargin = Number(sp.get("margin") || 2);
    const qEcc = sp.get("ecc") || "M";

    const s = Number.isFinite(qSize) ? qSize : 256;
    const m = Number.isFinite(qMargin) ? qMargin : 2;

    setUrl(qUrl);
    setSize(s); setSizeText(String(s));
    setMargin(m); setMarginText(String(m));
    setEcc(ECCS.includes(qEcc) ? qEcc : "M");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init qr-code-styling (client-only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("qr-code-styling");
        const QRCodeStyling = mod.default || mod;

        if (cancelled || qr.current) return;

        const instance = new QRCodeStyling({
          width: size,
          height: size,
          data: url || "https://example.com",
          margin,
          qrOptions: { errorCorrectionLevel: ecc },
          backgroundOptions: { color: palette.bg },
          dotsOptions: {
            type: style.dotsType,
            gradient: {
              type: "linear",
              rotation: 0,
              colorStops: [
                { offset: 0, color: palette.a },
                { offset: 1, color: palette.b },
              ],
            },
          },
          cornersSquareOptions: { type: style.cornerSquareType, color: palette.b },
          cornersDotOptions: { type: style.cornerDotType, color: palette.a },
        });

        qr.current = instance;
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          instance.append(containerRef.current);
        }
      } catch (e) {
        console.error(e);
        setErr("Failed to initialize QR renderer");
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data/size/margin/ECC
  useEffect(() => {
    if (!qr.current) return;
    setErr("");
    try {
      qr.current.update({
        data: url || "https://example.com",
        width: size,
        height: size,
        margin,
        qrOptions: { errorCorrectionLevel: ecc },
      });
    } catch (e) {
      console.error(e);
      setErr("Failed to update QR");
    }
  }, [url, size, margin, ecc]);

  // Update style / palette
  useEffect(() => {
    if (!qr.current) return;
    try {
      qr.current.update({
        backgroundOptions: { color: palette.bg },
        dotsOptions: {
          type: style.dotsType,
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: palette.a },
              { offset: 1, color: palette.b },
            ],
          },
        },
        cornersSquareOptions: { type: style.cornerSquareType, color: palette.b },
        cornersDotOptions: { type: style.cornerDotType, color: palette.a },
      });
    } catch (e) {
      console.error(e);
      setErr("Failed to apply style");
    }
  }, [style.dotsType, style.cornerSquareType, style.cornerDotType, palette]);

  // Randomize style
  function randomize() {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pal = pick(PALETTES);
    setStyle((s) => ({
      ...s,
      dotsType: pick(DOT_TYPES),
      cornerSquareType: pick(CORNER_SQUARE_TYPES),
      cornerDotType: pick(CORNER_DOT_TYPES),
      paletteId: pal.id,
    }));
  }

  function resetStyle() {
    setStyle({
      dotsType: "rounded",
      cornerSquareType: "square",
      cornerDotType: "dot",
      paletteId: "orange",
    });
  }

  const downloadPng = () => qr.current?.download({ name: "qr", extension: "png" });
  const downloadSvg = () => qr.current?.download({ name: "qr", extension: "svg" });

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
            {/* Size (typeable without clamping issues) */}
            <label className="text-sm flex items-center gap-2">
              Size
              <input
                type="number"
                inputMode="numeric"
                min={128}
                max={1024}
                value={sizeText}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d{0,4}$/.test(v)) setSizeText(v);
                }}
                onBlur={() => {
                  const n = parseInt(sizeText, 10);
                  const clamped = Math.max(128, Math.min(1024, isNaN(n) ? size : n));
                  setSize(clamped);
                  setSizeText(String(clamped));
                }}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                className="ml-auto w-24 rounded-md border border-orange-200 px-2 py-1 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              />
            </label>

            {/* Margin */}
            <label className="text-sm flex items-center gap-2">
              Margin
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={10}
                value={marginText}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d{0,2}$/.test(v)) setMarginText(v);
                }}
                onBlur={() => {
                  const n = parseInt(marginText, 10);
                  const clamped = Math.max(0, Math.min(10, isNaN(n) ? margin : n));
                  setMargin(clamped);
                  setMarginText(String(clamped));
                }}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                className="ml-auto w-24 rounded-md border border-orange-200 px-2 py-1 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              />
            </label>

            {/* ECC */}
            <label className="text-sm flex items-center gap-2 col-span-2">
              ECC
              <select
                value={ecc}
                onChange={(e) => setEcc(e.target.value)}
                className="ml-2 rounded-md border border-orange-200 px-2 py-1 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                {ECCS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>

          {/* Style controls */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="text-sm">
              <div className="text-orange-900/80 mb-1">Dots</div>
              <select
                value={style.dotsType}
                onChange={(e) => setStyle((s) => ({ ...s, dotsType: e.target.value }))}
                className="w-full rounded-md border border-orange-200 px-2 py-1 focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                {DOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="text-sm">
              <div className="text-orange-900/80 mb-1">Corner squares</div>
              <select
                value={style.cornerSquareType}
                onChange={(e) => setStyle((s) => ({ ...s, cornerSquareType: e.target.value }))}
                className="w-full rounded-md border border-orange-200 px-2 py-1 focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                {CORNER_SQUARE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="text-sm">
              <div className="text-orange-900/80 mb-1">Corner dots</div>
              <select
                value={style.cornerDotType}
                onChange={(e) => setStyle((s) => ({ ...s, cornerDotType: e.target.value }))}
                className="w-full rounded-md border border-orange-200 px-2 py-1 focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                {CORNER_DOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Palette with friendly names */}
            <div className="text-sm">
              <div className="text-orange-900/80 mb-1">Palette</div>
              <select
                value={style.paletteId}
                onChange={(e) => setStyle((s) => ({ ...s, paletteId: e.target.value }))}
                className="w-full rounded-md border border-orange-200 px-2 py-1 focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              >
                {PALETTES.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* tiny swatch preview */}
              <div className="mt-2 flex items-center gap-1">
                <span className="inline-block h-3 w-8 rounded border border-orange-200" style={{ backgroundColor: palette.bg }} />
                <span className="inline-block h-3 w-8 rounded border border-orange-200" style={{ backgroundColor: palette.a }} />
                <span className="inline-block h-3 w-8 rounded border border-orange-200" style={{ backgroundColor: palette.b }} />
              </div>
            </div>
          </div>

          {err && (
            <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              {err}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={randomize}
              className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
            >
              Randomize
            </button>
            <button
              onClick={resetStyle}
              className="px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="border border-orange-100 rounded-xl p-4 bg-white flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            className="h-64 w-64 rounded-md border border-orange-200 bg-white p-2 grid place-items-center"
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
        </div>
      </div>
    </div>
  );
}
