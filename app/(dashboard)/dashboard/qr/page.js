export default function QRDesignerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-orange-800">QR Designer</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-orange-100 rounded-xl p-4">
          <h2 className="font-semibold text-orange-800 mb-2">Design</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex items-center gap-2">
              Size
              <input className="border border-orange-200 rounded px-2 py-1 ml-auto w-24" defaultValue={256} />
            </label>
            <label className="flex items-center gap-2">
              Margin
              <input className="border border-orange-200 rounded px-2 py-1 ml-auto w-24" defaultValue={2} />
            </label>
            <label className="flex items-center gap-2 col-span-2">
              URL
              <input className="border border-orange-200 rounded px-2 py-1 ml-2 flex-1" placeholder="https://..." />
            </label>
          </div>
          <button className="mt-4 px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700">
            Preview
          </button>
        </div>
        <div className="border border-orange-100 rounded-xl p-4 flex items-center justify-center">
          <div className="h-48 w-48 rounded bg-orange-50 border border-orange-200 grid place-items-center text-orange-700">
            QR preview
          </div>
        </div>
      </div>
    </div>
  );
}
