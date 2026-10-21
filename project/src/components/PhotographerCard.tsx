import { Link } from "react-router-dom";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import type { Photographer } from "../lib/types";
import { Avatar } from "./ui";

export function PhotographerCard({ p }: { p: Photographer }) {
  return (
    <Link
      to={`/photographers/${p.id}`}
      className="group card-hover overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {p.cover_url ? (
          <img
            src={p.cover_url}
            alt={`${p.full_name} portfolio cover`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200">
            <Avatar name={p.full_name} src={p.avatar_url} size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {p.status === "approved" && (
          <span className="absolute left-3 top-3 badge bg-white/90 text-ink-800 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-ink-900 truncate">{p.full_name}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ink-800">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            {p.rating_count > 0 ? p.rating_avg.toFixed(1) : "New"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{[p.city, p.country].filter(Boolean).join(", ") || "Remote"}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.specialties.slice(0, 3).map((s) => (
            <span key={s} className="badge bg-ink-100 text-ink-700">{s}</span>
          ))}
        </div>
        {p.price_from != null && (
          <div className="mt-3 flex items-baseline gap-1 border-t border-ink-100 pt-3">
            <span className="text-xs text-ink-500">From</span>
            <span className="font-display text-base font-semibold text-ink-900">{p.price_from.toLocaleString()} RWF</span>
          </div>
        )}
      </div>
    </Link>
  );
}
