export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-orange-800">Settings</h1>
      <div className="rounded-xl border border-orange-100 bg-white p-6">
        <form className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block mb-1 text-orange-900">Display Name</span>
            <input className="w-full rounded-md border border-orange-200 px-3 py-2 focus:ring-2 focus:ring-orange-600 focus:border-orange-600" />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-orange-900">Country</span>
            <input className="w-full rounded-md border border-orange-200 px-3 py-2 focus:ring-2 focus:ring-orange-600 focus:border-orange-600" />
          </label>
          <div className="sm:col-span-2">
            <button className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
