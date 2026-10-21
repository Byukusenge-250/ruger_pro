import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Search,
  Users,
  Camera,
  Star,
  ShieldCheck,
  Ban,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { Avatar, EmptyState, Skeleton, Stars } from "../components/ui";
import { supabase } from "../lib/supabase";
import type { Photographer, Profile, Review } from "../lib/types";

type Tab = "photographers" | "users" | "reviews";

export default function AdminPage() {
  const { session, profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("photographers");
  const [photographers, setPhotographers] = useState<Photographer[] | null>(null);
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const loadPhotographers = useCallback(async () => {
    const { data } = await supabase
      .from("photographers")
      .select("id, user_id, full_name, bio, city, country, specialties, price_from, avatar_url, cover_url, status, rating_avg, rating_count, created_at")
      .order("created_at", { ascending: false });
    setPhotographers(data as Photographer[] | null);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, created_at")
      .order("created_at", { ascending: false });
    setUsers(data as Profile[] | null);
  }, []);

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, photographer_id, client_name, rating, comment, created_at")
      .order("created_at", { ascending: false });
    setReviews(data as Review[] | null);
  }, []);

  useEffect(() => {
    if (!session || profile?.role !== "admin") return;
    if (tab === "photographers" && photographers === null) loadPhotographers();
    if (tab === "users" && users === null) loadUsers();
    if (tab === "reviews" && reviews === null) loadReviews();
  }, [tab, session, profile, photographers, users, reviews, loadPhotographers, loadUsers, loadReviews]);

  if (loading) return <div className="container-page py-16"><Skeleton className="h-48 w-full" /></div>;
  if (!session || !profile) return <Navigate to="/sign-in" replace />;
  if (profile.role !== "admin") return <Navigate to="/dashboard" replace />;

  async function updateStatus(id: string, status: Photographer["status"]) {
    setBusy(id);
    await supabase.from("photographers").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setBusy(null);
    loadPhotographers();
  }

  async function deletePhotographer(id: string) {
    if (!confirm("Delete this photographer listing permanently?")) return;
    setBusy(id);
    await supabase.from("photographers").delete().eq("id", id);
    setBusy(null);
    loadPhotographers();
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    await supabase.from("reviews").delete().eq("id", id);
    setBusy(null);
    loadReviews();
  }

  async function setUserRole(id: string, role: Profile["role"]) {
    setBusy(id);
    await supabase.from("profiles").update({ role }).eq("id", id);
    setBusy(null);
    loadUsers();
  }

  const query = q.trim().toLowerCase();

  const filteredPhotographers = photographers?.filter((p) =>
    !query || `${p.full_name} ${p.city ?? ""} ${p.status} ${p.specialties.join(" ")}`.toLowerCase().includes(query)
  ) ?? [];

  const filteredUsers = users?.filter((u) =>
    !query || `${u.full_name} ${u.email} ${u.role}`.toLowerCase().includes(query)
  ) ?? [];

  const filteredReviews = reviews?.filter((r) =>
    !query || `${r.client_name} ${r.comment}`.toLowerCase().includes(query)
  ) ?? [];

  const pendingCount = photographers?.filter((p) => p.status === "pending").length ?? 0;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-ink-50">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">Admin control</p>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Admin dashboard</h1>
          <p className="text-sm text-ink-500">{profile.full_name} · {profile.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Camera className="h-5 w-5" />} label="Photographers" value={photographers?.length ?? "—"} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending review" value={pendingCount || "—"} highlight={pendingCount > 0 ? "warn" : undefined} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Users" value={users?.length ?? "—"} />
        <StatCard icon={<Star className="h-5 w-5" />} label="Reviews" value={reviews?.length ?? "—"} />
      </div>

      {/* Search */}
      <div className="mt-8 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          className="input pl-9"
          placeholder="Search across everything..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-ink-200">
        <TabBtn active={tab === "photographers"} onClick={() => setTab("photographers")} icon={<Camera className="h-4 w-4" />} label="Photographers" count={photographers?.length} />
        <TabBtn active={tab === "users"} onClick={() => setTab("users")} icon={<Users className="h-4 w-4" />} label="Users" count={users?.length} />
        <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")} icon={<Star className="h-4 w-4" />} label="Reviews" count={reviews?.length} />
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === "photographers" && (
          photographers === null ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : filteredPhotographers.length === 0 ? (
            <EmptyState icon={<Camera className="h-8 w-8" />} title="No photographers found" body={query ? "Try a different search." : "No photographer listings exist yet."} />
          ) : (
            <div className="space-y-3">
              {filteredPhotographers.map((p) => (
                <div key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={p.full_name} src={p.avatar_url} size={48} />
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-ink-900 truncate">{p.full_name}</p>
                      <p className="text-sm text-ink-500 truncate">{[p.city, p.country].filter(Boolean).join(", ") || "Remote"} · {p.specialties.join(", ") || "No specialties"}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        {p.rating_count > 0 && <span className="text-xs text-ink-500">{p.rating_avg.toFixed(1)} ({p.rating_count})</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status !== "approved" && (
                      <button onClick={() => updateStatus(p.id, "approved")} disabled={busy === p.id} className="btn-secondary text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Approve
                      </button>
                    )}
                    {p.status !== "rejected" && (
                      <button onClick={() => updateStatus(p.id, "rejected")} disabled={busy === p.id} className="btn-secondary text-xs">
                        <XCircle className="h-3.5 w-3.5 text-red-600" /> Reject
                      </button>
                    )}
                    {p.status !== "suspended" && (
                      <button onClick={() => updateStatus(p.id, "suspended")} disabled={busy === p.id} className="btn-secondary text-xs">
                        <Ban className="h-3.5 w-3.5 text-amber-600" /> Suspend
                      </button>
                    )}
                    <button onClick={() => deletePhotographer(p.id)} disabled={busy === p.id} className="btn-secondary text-xs hover:border-red-300">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "users" && (
          users === null ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState icon={<Users className="h-8 w-8" />} title="No users found" />
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div key={u.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.full_name} src={u.avatar_url} size={40} />
                    <div>
                      <p className="font-medium text-ink-900">{u.full_name}</p>
                      <p className="text-sm text-ink-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={u.role} />
                    {u.id !== profile.id && (
                      <select
                        value={u.role}
                        onChange={(e) => setUserRole(u.id, e.target.value as Profile["role"])}
                        disabled={busy === u.id}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 focus:border-ink-900 focus:outline-none"
                      >
                        <option value="client">Client</option>
                        <option value="photographer">Photographer</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "reviews" && (
          reviews === null ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : filteredReviews.length === 0 ? (
            <EmptyState icon={<Star className="h-8 w-8" />} title="No reviews found" />
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((r) => (
                <div key={r.id} className="card flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-ink-900">{r.client_name}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{r.comment}</p>
                    <p className="mt-2 text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteReview(r.id)} disabled={busy === r.id} className="btn-secondary shrink-0 text-xs hover:border-red-300">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <button onClick={() => { loadPhotographers(); loadUsers(); loadReviews(); }} className="btn-ghost mt-8 text-sm">
        <RefreshCw className="h-4 w-4" /> Refresh all data
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number | string; highlight?: "warn" }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight === "warn" ? "bg-amber-50 text-amber-600" : "bg-ink-50 text-ink-700"}`}>{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
        <p className="font-display text-xl font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{count}</span>}
    </button>
  );
}

function StatusBadge({ status }: { status: Photographer["status"] }) {
  const map = {
    approved: { icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-emerald-50 text-emerald-700" },
    pending: { icon: <Clock className="h-3 w-3" />, cls: "bg-amber-50 text-amber-700" },
    rejected: { icon: <XCircle className="h-3 w-3" />, cls: "bg-red-50 text-red-700" },
    suspended: { icon: <Ban className="h-3 w-3" />, cls: "bg-ink-100 text-ink-600" },
  };
  const s = map[status];
  return <span className={`badge ${s.cls}`}>{s.icon} <span className="capitalize">{status}</span></span>;
}

function RoleBadge({ role }: { role: Profile["role"] }) {
  const cls = role === "admin" ? "bg-ink-900 text-ink-50" : role === "photographer" ? "bg-accent-50 text-accent-700" : "bg-ink-100 text-ink-600";
  return <span className={`badge ${cls} capitalize`}>{role}</span>;
}
