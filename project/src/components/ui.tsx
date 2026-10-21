import { type ReactNode } from "react";
import { Star } from "lucide-react";

export function Stars({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={i < rounded ? "fill-accent-400 text-accent-400" : "text-ink-300"}
            strokeWidth={2}
            aria-hidden
          />
        ))}
      </span>
      {count !== undefined && (
        <span className="text-xs text-ink-500">({count})</span>
      )}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-ink-200 border-t-ink-900 ${className}`}
      style={{ width: 16, height: 16 }}
      aria-hidden
    />
  );
}

export function EmptyState({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-400">{icon}</div>}
      <p className="font-display text-lg font-medium text-ink-800">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-500">{body}</p>}
    </div>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (src) {
    return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-ink-200 font-medium text-ink-700"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink-100 ${className}`} />;
}
