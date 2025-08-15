"use client";

import CopyButton from "@/components/ui/CopyButton";

function domainOf(url) { try { return new URL(url).hostname; } catch { return ""; } }
function formatDate(iso) { try { return new Date(iso).toLocaleDateString(); } catch { return ""; } }

export default function LinkCard({
  item,
  selected,
  onSelect,
  onDelete,
  deleting = false,
  onToggle,
  toggling = false,
}) {
  const dom = domainOf(item.longUrl);

  return (
    <div
      className={`rounded-xl border p-4 bg-white transition-shadow ${
        selected ? "border-orange-500 shadow" : "border-orange-100 hover:shadow-sm"
      } ${item.isActive ? "" : "opacity-75"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://icons.duckduckgo.com/ip3/${dom}.ico`}
            alt=""
            className="h-5 w-5 rounded shrink-0"
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
          <div className="text-sm min-w-0">
            {/* domain / title with tooltip */}
            <div
              className="font-semibold text-orange-800 truncate max-w-[min(70vw,32rem)]"
              title={dom || item.longUrl}
            >
              {dom || item.longUrl}
            </div>
            {/* long URL with tooltip */}
            <div
              className="text-orange-900/70 truncate max-w-[min(70vw,32rem)]"
              title={item.longUrl}
            >
              {item.longUrl}
            </div>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 accent-orange-600"
          />
          Select
        </label>
      </div>

      <div className="mt-3 text-xs text-orange-900/70 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>Slug: <code className="text-orange-800">{item.slug}</code></span>
        <span>Created: {formatDate(item.createdAt)}</span>
        {item.expiresAt && <span>Expires: {formatDate(item.expiresAt)}</span>}
        <span>Status: {item.isActive ? "Active" : "Paused"}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-200 text-sm">
          Engagement: <b>{item.clicksCount}</b>
        </span>

        <a
          href={`/dashboard/analytics/${encodeURIComponent(item.slug)}`}
          className="px-3 py-1.5 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 text-sm"
        >
          Analytics
        </a>

        <CopyButton text={item.shortUrl} className="!inline-block" />

        {onToggle && (
          <button
            onClick={onToggle}
            disabled={toggling}
            className={`px-3 py-1.5 rounded-md text-sm disabled:opacity-60 border ${
              item.isActive ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                             : "border-green-300 text-green-700 hover:bg-green-50"
            }`}
          >
            {toggling ? "Updating..." : item.isActive ? "Deactivate" : "Activate"}
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 text-sm disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="mt-2 text-xs break-all">
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noreferrer noopener"
          className={`underline ${item.isActive ? "text-orange-700 hover:text-orange-800" : "text-orange-900/50 pointer-events-none cursor-not-allowed"}`}
          title={item.shortUrl}
        >
          {item.shortUrl}
        </a>
      </div>
    </div>
  );
}
