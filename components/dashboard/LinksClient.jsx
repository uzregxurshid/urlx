"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LinksFilters from "@/components/dashboard/links/Filters";
import LinkCard from "@/components/dashboard/links/LinkCard";
import Pager from "@/components/dashboard/links/Pager";

export default function LinksClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // filters & paging
  const [q, setQ] = useState(sp.get("q") || "");
  const [from, setFrom] = useState(sp.get("from") || "");
  const [to, setTo] = useState(sp.get("to") || "");
  const [page, setPage] = useState(Number(sp.get("page") || 1));
  const pageSize = 12;

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ui state
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());
  const [toggling, setToggling] = useState(new Set()); // for activate/deactivate

  const fetchLinks = async (opts) => {
    const p = opts?.page ?? page;
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/links?${params.toString()}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Failed to load links");
        setItems([]); setTotal(0);
      } else {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
      }
    } catch {
      setErr("Network error");
      setItems([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLinks(); /* eslint-disable-next-line */ }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", "1");
    router.replace(`/dashboard/links?${params.toString()}`);
    setSelected(new Set());
    fetchLinks({ page: 1 });
  };

  const resetFilters = () => {
    setQ(""); setFrom(""); setTo("");
    router.replace("/dashboard/links");
    setSelected(new Set());
    fetchLinks({ page: 1 });
  };

  const goPage = (np) => {
    if (np < 1 || (np - 1) * pageSize >= total) return;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(np));
    router.replace(`/dashboard/links?${params.toString()}`);
    fetchLinks({ page: np });
  };

  const toggleSel = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  async function onDelete(id) {
    if (!id) return;
    const confirm = window.confirm("Delete this link and its analytics?");
    if (!confirm) return;

    setDeleting((s) => new Set(s).add(id));
    try {
      const res = await fetch(`/api/links/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Failed to delete");
      } else {
        setItems((list) => list.filter((x) => x.id !== id));
        setSelected((sel) => { const n = new Set(sel); n.delete(id); return n; });
        setTotal((t) => Math.max(0, t - 1));
      }
    } catch { alert("Network error"); }
    finally { setDeleting((s) => { const n = new Set(s); n.delete(id); return n; }); }
  }

  async function onToggle(id, isActive) {
    if (!id) return;
    setToggling((s) => new Set(s).add(id));
    try {
      const res = await fetch(`/api/links/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Failed to update");
      } else {
        setItems((list) => list.map((x) => (x.id === id ? { ...x, isActive: data.link.isActive } : x)));
      }
    } catch { alert("Network error"); }
    finally { setToggling((s) => { const n = new Set(s); n.delete(id); return n; }); }
  }

  const pagesCount = Math.ceil((total || 0) / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-orange-800">Links</h1>

      <LinksFilters
        q={q} setQ={setQ}
        from={from} setFrom={setFrom}
        to={to} setTo={setTo}
        selectedCount={selected.size}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {err && (
        <div className="rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          {err}
        </div>
      )}

      {/* Vertical list (up & down) */}
      <div className="flex flex-col gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl border border-orange-100 bg-orange-50/40 animate-pulse" />
        ))}

        {!loading && items.map((it) => (
          <LinkCard
            key={it.id}
            item={it}
            selected={selected.has(it.id)}
            onSelect={() => toggleSel(it.id)}
            onDelete={() => onDelete(it.id)}
            deleting={deleting.has(it.id)}
            onToggle={() => onToggle(it.id, it.isActive)}
            toggling={toggling.has(it.id)}
          />
        ))}

        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-orange-100 bg-white p-6 text-orange-900/70">
            No links found. Try adjusting filters.
          </div>
        )}
      </div>

      {!loading && total > pageSize && (
        <Pager
          page={page}
          pagesCount={pagesCount}
          onPrev={() => goPage(page - 1)}
          onNext={() => goPage(page + 1)}
        />
      )}
    </div>
  );
}
