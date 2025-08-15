"use client";

import { useEffect, useState } from "react";
import BarChartSimple from "@/components/charts/BarChartSimple";

function isoDate(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function OverviewClient() {
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(isoDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [clicks, setClicks] = useState(0);
  const [uniques, setUniques] = useState(0);
  const [topCountry, setTopCountry] = useState("—");
  const [countries, setCountries] = useState([]);

  async function load() {
    setLoading(true); setErr("");
    try {
      const qs = new URLSearchParams({ from, to, limit: "12" }).toString();
      const res = await fetch(`/api/analytics/overview?${qs}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load overview");
      setClicks(data.totals?.clicks || 0);
      setUniques(data.totals?.uniques || 0);
      setTopCountry(data.topCountry || "—");
      setCountries((data.countries || []).map(r => ({ label: r.country, value: r.count })));
    } catch (e) {
      setErr(e?.message || "Network error");
      setClicks(0); setUniques(0); setTopCountry("—"); setCountries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-800">Analytics</h1>

      {/* Date filters */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="text-sm">
            <label className="block mb-1 text-orange-900">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
            />
          </div>
          <div className="text-sm">
            <label className="block mb-1 text-orange-900">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={load}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {loading ? "Loading…" : "Apply"}
            </button>
          </div>
        </div>
        {err && (
          <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            {err}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Total Clicks</p>
          <p className="text-2xl font-semibold text-orange-800">{clicks}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Unique Visitors</p>
          <p className="text-2xl font-semibold text-orange-800">{uniques}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Top Country</p>
          <p className="text-2xl font-semibold text-orange-800">{topCountry}</p>
        </div>
      </div>

      {/* Countries chart */}
      <div className="rounded-xl border border-orange-100 bg-white p-6">
        <p className="text-sm text-orange-900/70 mb-2">Countries</p>
        <BarChartSimple data={countries} />
      </div>
    </div>
  );
}
