import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import { PhotographerCard } from "../components/PhotographerCard";
import { EmptyState, Skeleton } from "../components/ui";
import { supabase } from "../lib/supabase";
import { SPECIALTIES, CITIES, type Photographer } from "../lib/types";

export default function ExplorePage() {
  const [all, setAll] = useState<Photographer[] | null>(null);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    supabase
      .from("photographers")
      .select("id, user_id, full_name, bio, city, country, specialties, price_from, avatar_url, cover_url, status, rating_avg, rating_count, created_at")
      .eq("status", "approved")
      .order("rating_avg", { ascending: false })
      .then(({ data }) => setAll(data as Photographer[] | null));
  }, []);

  const results = useMemo(() => {
    if (!all) return null;
    const query = q.trim().toLowerCase();
    const max = maxPrice ? Number(maxPrice) : null;
    return all.filter((p) => {
      if (city && p.city !== city) return false;
      if (specialty && !p.specialties.includes(specialty)) return false;
      if (max != null && (p.price_from == null || p.price_from > max)) return false;
      if (query) {
        const hay = `${p.full_name} ${p.bio ?? ""} ${p.specialties.join(" ")} ${p.city ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [all, q, city, specialty, maxPrice]);

  const hasFilters = Boolean(city || specialty || maxPrice || q);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">Marketplace</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">Explore photographers</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Filter by specialty, location, and budget. All photographers listed are approved and in good standing.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 card p-4 sm:p-5" data-tour="filters">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-9"
              placeholder="Search name, bio, or specialty"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search photographers"
            />
          </div>
          <select className="input" value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
            <option value="">All locations</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} aria-label="Filter by specialty">
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="number"
              min={0}
              className="input pl-9"
              placeholder="Max price (RWF)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum starting price"
            />
          </div>
        </div>
        {hasFilters && (
          <button
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
            onClick={() => { setQ(""); setCity(""); setSpecialty(""); setMaxPrice(""); }}
          >
            <X className="h-3 w-3" /> Clear all filters
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-ink-100 pb-3">
        <p className="text-sm text-ink-500">
          {results === null ? "Loading…" : `${results.length} photographer${results.length === 1 ? "" : "s"}`}
        </p>
        <p className="hidden text-xs text-ink-400 sm:block">Sorted by rating</p>
      </div>

      <div className="mt-6">
        {results === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                  <Skeleton className="mt-3 h-6 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-8 w-8" />}
            title="No photographers match your filters"
            body="Try widening your location, specialty, or budget to see more results."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((p) => <PhotographerCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
