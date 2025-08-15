"use client";

export default function LinksFilters({
  q, setQ,
  from, setFrom,
  to, setTo,
  selectedCount,
  onApply,
  onReset,
}) {
  return (
    <div className="rounded-xl border border-orange-100 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by slug or destination"
          className="rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
          placeholder="From"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
          placeholder="To"
        />
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onApply}
          className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
        >
          Apply
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          Reset
        </button>

        <div className="sm:ml-auto flex items-center gap-2 text-sm text-orange-900/80">
          <span>Selected: {selectedCount}</span>
        </div>
      </div>
    </div>
  );
}
