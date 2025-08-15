"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function CopyButton({
  text,
  className = "",
  label = "Copy",
  successText = "Copied!",
  ms = 1500,
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    try {
      // try modern clipboard
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), ms);
    } catch {
      // even on failure show feedback, but you can customize
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), ms);
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={onCopy}
        className="px-3 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 inline-flex items-center gap-2 text-sm"
        aria-live="polite"
        aria-label={label}
      >
        {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
        <span>{copied ? successText : label}</span>
      </button>

      {/* Tooltip bubble */}
      <div
        className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
          rounded-md bg-orange-600 text-white text-xs px-2 py-1 shadow
          transition-all duration-150
          ${copied ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        role="status"
      >
        {successText}
        <span
          className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-orange-600"
          aria-hidden
        />
      </div>
    </div>
  );
}
