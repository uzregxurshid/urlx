export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-800">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Total Clicks</p>
          <p className="text-2xl font-semibold text-orange-800">—</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Unique Visitors</p>
          <p className="text-2xl font-semibold text-orange-800">—</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-orange-900/70">Top Country</p>
          <p className="text-2xl font-semibold text-orange-800">—</p>
        </div>
      </div>

      <div className="rounded-xl border border-orange-100 bg-white p-6">
        <p className="text-sm text-orange-900/70 mb-2">Countries</p>
        <div className="h-56 rounded bg-orange-50 border border-orange-200 grid place-items-center text-orange-700">
          countries chart (soon)
        </div>
      </div>
    </div>
  );
}
