"use client";

import { useEffect, useMemo, useState } from "react";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import BarChartSimple from "@/components/charts/BarChartSimple";
import PieChartSimple from "@/components/charts/PieChartSimple";

function isoDate(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function AnalyticsClient({ slug }) {
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(isoDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [totals, setTotals] = useState({ clicks: 0, uniques: 0 });
  const [devices, setDevices] = useState([]);     // from summary
  const [series, setSeries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [oses, setOses] = useState([]);           // NEW

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const qs = new URLSearchParams({ slug, from, to }).toString();

      const [sumRes, tsRes, coRes, osRes] = await Promise.all([
        fetch(`/api/analytics/summary?${qs}`, { credentials: "include", cache: "no-store" }),
        fetch(`/api/analytics/timeseries?${qs}`, { credentials: "include", cache: "no-store" }),
        fetch(`/api/analytics/countries?slug=${encodeURIComponent(slug)}&limit=12`, { credentials: "include", cache: "no-store" }),
        fetch(`/api/analytics/os?${qs}`, { credentials: "include", cache: "no-store" }), // NEW
      ]);

      const [sum, ts, co, os] = await Promise.all([
        sumRes.json(), tsRes.json(), coRes.json(), osRes.json()
      ]);

      if (!sumRes.ok || !sum?.ok) throw new Error(sum?.error || "Failed summary");
      if (!tsRes.ok || !ts?.ok) throw new Error(ts?.error || "Failed timeseries");
      if (!coRes.ok || !co?.ok) throw new Error(co?.error || "Failed countries");
      if (!osRes.ok || !os?.ok) throw new Error(os?.error || "Failed OS");

      setTotals(sum.totals || { clicks: 0, uniques: 0 });
      setDevices(sum.devices || []);
      setSeries((ts.items || []).map(r => ({ x: r.date.slice(0, 10), y: r.count })));
      setCountries((co.items || []).map(r => ({ label: r.country, value: r.count })));
      setOses((os.items || []).map(r => ({ label: r.os, value: r.count }))); // NEW
    } catch (e) {
      setErr(e?.message || "Failed to load analytics");
      setTotals({ clicks: 0, uniques: 0 });
      setDevices([]); setSeries([]); setCountries([]); setOses([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // devices -> pie data
  const devicePie = useMemo(() => {
    const order = ["DESKTOP", "MOBILE", "TABLET", "OTHER", "BOT"];
    const map = new Map(devices.map(d => [d.device, d.count]));
    return order
      .filter(k => map.has(k))
      .map(k => ({ label: k.toLowerCase(), value: map.get(k) }));
  }, [devices]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="text-sm">
            <label className="block mb-1 text-orange-900">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 focus:ring-2 focus:ring-orange-600 focus:border-orange-600" />
          </div>
          <div className="text-sm">
            <label className="block mb-1 text-orange-900">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 focus:ring-2 focus:ring-orange-600 focus:border-orange-600" />
          </div>
          <div className="flex items-end">
            <button onClick={load} disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60">
              {loading ? "Loading…" : "Apply"}
            </button>
          </div>
        </div>
        {err && <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">{err}</div>}
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

      {/* Devices (Pie) */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Engagement by device</p>
        <PieChartSimple data={devicePie} />
      </div>

      {/* Time series */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Engagement over time</p>
        <TimeSeriesChart data={series} />
      </div>

      {/* Countries */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Top countries</p>
        <BarChartSimple data={countries} />
      </div>

      {/* NEW: Operating Systems */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <p className="text-sm text-orange-900/70 mb-2">Operating systems</p>
        <BarChartSimple data={oses} />
      </div>
    </div>
  );
}
