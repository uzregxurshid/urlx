"use client";

import { useEffect, useMemo, useState } from "react";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import BarChartSimple from "@/components/charts/BarChartSimple";

function isoDate(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function AnalyticsClient({ slug }) {
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(isoDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [totals, setTotals] = useState({ clicks: 0, uniques: 0 });
  const [devices, setDevices] = useState([]);
  const [series, setSeries] = useState([]);
  const [countries, setCountries] = useState([]);

   const load = async () => {
    setLoading(true); setErr("");
    try {
      const qs = new URLSearchParams({ slug, from, to }).toString();

      const [sumRes, tsRes, coRes] = await Promise.all([
        // ⬇️ now includes from/to so totals include "today"
        fetch(`/api/analytics/summary?${qs}`, { credentials: "include", cache: "no-store" }),
        fetch(`/api/analytics/timeseries?${qs}`, { credentials: "include", cache: "no-store" }),
        fetch(`/api/analytics/countries?slug=${encodeURIComponent(slug)}&limit=12`, { credentials: "include", cache: "no-store" }),
      ]);
      
      const [sum, ts, co] = await Promise.all([sumRes.json(), tsRes.json(), coRes.json()]);
      if (!sumRes.ok || !sum?.ok) throw new Error(sum?.error || "Failed summary");
      if (!tsRes.ok || !ts?.ok) throw new Error(ts?.error || "Failed timeseries");
      if (!coRes.ok || !co?.ok) throw new Error(co?.error || "Failed countries");

      setTotals(sum.totals || { clicks: 0, uniques: 0 });
      setDevices(sum.devices || []);
      setSeries((ts.items || []).map(r => ({ x: r.date.slice(0, 10), y: r.count })));
      setCountries((co.items || []).map(r => ({ label: r.country, value: r.count })));
    } catch (e) {
      setErr(e?.message || "Failed to load analytics");
      setTotals({ clicks: 0, uniques: 0 });
      setDevices([]); setSeries([]); setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // turn [{device, count}] into [{label, value}]
  const deviceBars = useMemo(() => {
    const order = ["DESKTOP", "MOBILE", "TABLET", "OTHER", "BOT"];
    const map = new Map(devices.map(d => [d.device, d.count]));
    return order.filter(k => map.has(k)).map(k => ({ label: k.toLowerCase(), value: map.get(k) }));
  }, [devices]);

  return (
    <div className="space-y-5">
      {/* Filters */}
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Total Engagement</p>
          <p className="text-3xl font-semibold text-orange-800">{totals.clicks}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Unique Visitors</p>
          <p className="text-3xl font-semibold text-orange-800">{totals.uniques}</p>
        </div>
      </div>

      {/* Devices */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Engagement by device</p>
        <BarChartSimple data={deviceBars} />
      </div>

      {/* Time series */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Engagement over time (Y: clicks, X: date)</p>
        <TimeSeriesChart data={series} />
      </div>

      {/* Countries */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Top countries</p>
        <BarChartSimple data={countries} />
      </div>
    </div>
  );
}
