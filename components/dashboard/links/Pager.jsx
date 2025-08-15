"use client";

export default function Pager({ page, pagesCount, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <button
        onClick={onPrev}
        className="px-3 py-1.5 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-60"
        disabled={page <= 1}
      >
        Prev
      </button>
      <div className="text-orange-900/80">
        Page {page} / {pagesCount}
      </div>
      <button
        onClick={onNext}
        className="px-3 py-1.5 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-60"
        disabled={page >= pagesCount}
      >
        Next
      </button>
    </div>
  );
}
