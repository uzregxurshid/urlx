export default function LinksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-orange-800 mb-4">Links</h1>
      <div className="rounded-xl border border-orange-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50/60 text-orange-900">
            <tr>
              <th className="text-left px-3 py-2">Slug</th>
              <th className="text-left px-3 py-2">Destination</th>
              <th className="text-left px-3 py-2">Clicks</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-orange-100">
              <td className="px-3 py-2">acme</td>
              <td className="px-3 py-2 truncate">https://example.com/very/long/path</td>
              <td className="px-3 py-2">42</td>
              <td className="px-3 py-2">Active</td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-xs rounded border border-orange-300 hover:bg-orange-50">Copy</button>
                  <button className="px-2 py-1 text-xs rounded border border-orange-300 hover:bg-orange-50">Edit</button>
                  <button className="px-2 py-1 text-xs rounded border border-orange-300 hover:bg-orange-50">Delete</button>
                </div>
              </td>
            </tr>
            {/* map real data later */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
