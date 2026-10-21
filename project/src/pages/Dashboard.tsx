import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Camera,
  CalendarClock,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  User2,
  ArrowRight,
  ShieldCheck,
  Save,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { Avatar, EmptyState, Skeleton, Spinner } from "../components/ui";
import { supabase } from "../lib/supabase";
import type { Booking, Photographer } from "../lib/types";
import { CITIES, SPECIALTIES } from "../lib/types";

export default function DashboardPage() {
  const { session, profile, loading } = useAuth();
  const [photo, setPhoto] = useState<Photographer | null | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("photographers")
      .select("id, user_id, full_name, bio, city, country, specialties, price_from, avatar_url, cover_url, status, rating_avg, rating_count, created_at")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setPhoto(data as Photographer | null));

    supabase
      .from("bookings")
      .select("id, photographer_id, client_id, client_name, client_email, session_date, session_type, location, message, status, created_at")
      .eq("client_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings(data as Booking[] | null));
  }, [session]);

  if (loading) {
    return <div className="container-page py-16"><Skeleton className="h-48 w-full" /></div>;
  }
  if (!session || !profile) return <Navigate to="/sign-in" replace />;

  const isPhotographer = profile.role === "photographer";
  const isAdmin = profile.role === "admin";
  const greeting = greetingFor();

  if (isAdmin) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-ink-50">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">{greeting}</p>
            <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{profile.full_name}</h1>
            <p className="text-sm capitalize text-ink-500">Administrator · {profile.email}</p>
          </div>
        </div>

        <div className="mt-8 card overflow-hidden bg-gradient-to-br from-ink-900 to-ink-800 p-8 text-ink-50">
          <h2 className="font-display text-xl font-semibold">Admin control center</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-300">
            You have full authority over the marketplace. Manage photographer approvals, user roles, and review moderation from the admin panel.
          </p>
          <Link to="/admin" className="btn-light mt-6">
            Open admin panel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const activeBookings = bookings?.filter((b) => b.status === "pending" || b.status === "confirmed") ?? [];

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex items-center gap-4">
        <Avatar name={profile.full_name} src={profile.avatar_url} size={56} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">{greeting}</p>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{profile.full_name}</h1>
          <p className="text-sm capitalize text-ink-500">{profile.role} account · {profile.email}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Active bookings" value={activeBookings.length > 0 ? String(activeBookings.length) : "0"} />
        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Total bookings" value={bookings ? String(bookings.length) : "—"} />
        <StatCard icon={<Star className="h-5 w-5" />} label="Rating" value={isPhotographer && photo && photo.rating_count > 0 ? photo.rating_avg.toFixed(1) : "—"} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bookings list */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 pb-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">Your bookings</h2>
            <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-ink-900">
              Find photographers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            {bookings === null ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="h-8 w-8" />}
                title="No bookings yet"
                body="When you request a session with a photographer, it will appear here with status updates."
              />
            ) : (
              <ul className="space-y-3">
                {bookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 p-4">
                    <div>
                      <p className="font-medium text-ink-900">{b.session_type} session</p>
                      <p className="mt-0.5 text-sm text-ink-500">
                        {new Date(b.session_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                        {b.location && ` · ${b.location}`}
                      </p>
                    </div>
                    <BookingBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Profile sidebar */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 border-b border-ink-100 pb-4">Profile</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <Row icon={<User2 className="h-4 w-4" />} label="Name" value={profile.full_name} />
            <Row icon={<Camera className="h-4 w-4" />} label="Role" value={profile.role} />
            {isPhotographer && photo && (
              <Row
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Status"
                value={photo.status}
                highlight={photo.status === "approved" ? "good" : photo.status === "pending" ? "warn" : "bad"}
              />
            )}
            {isPhotographer && photo === null && (
              <li className="rounded-xl bg-accent-50 p-3 text-xs leading-relaxed text-accent-800">
                You haven&apos;t created your photographer profile yet. After approval, your portfolio will be visible in the marketplace.
              </li>
            )}
            {isPhotographer && photo === undefined && <Skeleton className="h-12 w-full" />}
          </ul>
        </div>
      </div>

      {/* Photographer profile editor */}
      {isPhotographer && (
        <PhotographerEditor
          userId={session.user.id}
          fullName={profile.full_name}
          photo={photo}
          onSaved={() => {
            supabase
              .from("photographers")
              .select("id, user_id, full_name, bio, city, country, specialties, price_from, avatar_url, cover_url, status, rating_avg, rating_count, created_at")
              .eq("user_id", session.user.id)
              .maybeSingle()
              .then(({ data }) => setPhoto(data as Photographer | null));
          }}
        />
      )}
    </div>
  );
}

function PhotographerEditor({
  userId,
  fullName,
  photo,
  onSaved,
}: {
  userId: string;
  fullName: string;
  photo: Photographer | null | undefined;
  onSaved: () => void;
}) {
  const [bio, setBio] = useState(photo?.bio ?? "");
  const [city, setCity] = useState(photo?.city ?? "");
  const [country, setCountry] = useState(photo?.country ?? "");
  const [priceFrom, setPriceFrom] = useState(photo?.price_from?.toString() ?? "");
  const [avatarUrl, setAvatarUrl] = useState(photo?.avatar_url ?? "");
  const [coverUrl, setCoverUrl] = useState(photo?.cover_url ?? "");
  const [specialties, setSpecialties] = useState<string[]>(photo?.specialties ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (photo) {
      setBio(photo.bio ?? "");
      setCity(photo.city ?? "");
      setCountry(photo.country ?? "");
      setPriceFrom(photo.price_from?.toString() ?? "");
      setAvatarUrl(photo.avatar_url ?? "");
      setCoverUrl(photo.cover_url ?? "");
      setSpecialties(photo.specialties ?? []);
    }
  }, [photo]);

  function toggleSpecialty(s: string) {
    setSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const payload = {
      user_id: userId,
      full_name: fullName,
      bio: bio || null,
      city: city || null,
      country: country || null,
      specialties,
      price_from: priceFrom ? Number(priceFrom) : null,
      avatar_url: avatarUrl || null,
      cover_url: coverUrl || null,
      updated_at: new Date().toISOString(),
    };
    const { error: upsertError } = await supabase
      .from("photographers")
      .upsert(payload, { onConflict: "user_id" });
    setBusy(false);
    if (upsertError) return setError("Could not save your profile. Please try again.");
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 3000);
  }

  if (photo === undefined) {
    return (
      <div className="mt-10 card p-6">
        <Skeleton className="h-8 w-48" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 card p-6 sm:p-8">
      <div className="border-b border-ink-100 pb-4">
        <h2 className="font-display text-lg font-semibold text-ink-900">Photographer profile</h2>
        <p className="mt-1 text-sm text-ink-500">
          {photo === null
            ? "Create your portfolio listing. It will be reviewed by an admin before going live."
            : "Update your portfolio listing. Changes are subject to admin review."}
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}
      {saved && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Profile saved successfully.</span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ed-bio">Bio</label>
          <textarea id="ed-bio" className="input min-h-[100px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about your style and experience..." />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label" htmlFor="ed-city">City</label>
            <select id="ed-city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-country">Country</label>
            <input id="ed-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Rwanda" />
          </div>
          <div>
            <label className="label" htmlFor="ed-price">Starting price (RWF)</label>
            <input id="ed-price" type="number" min={0} className="input" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="150000" />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <label className="label">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => {
            const active = specialties.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "bg-ink-900 text-ink-50" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                }`}
              >
                {active ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ed-avatar">Avatar image URL</label>
          <input id="ed-avatar" className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label" htmlFor="ed-cover">Cover image URL</label>
          <input id="ed-cover" className="input" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {(avatarUrl || coverUrl) && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {coverUrl && (
            <div className="relative overflow-hidden rounded-xl">
              <img src={coverUrl} alt="Cover preview" className="aspect-[4/3] w-full object-cover" />
              <span className="absolute bottom-2 left-2 badge bg-ink-950/80 text-ink-50 backdrop-blur">Cover</span>
            </div>
          )}
          {avatarUrl && (
            <div className="relative overflow-hidden rounded-xl">
              <img src={avatarUrl} alt="Avatar preview" className="aspect-square w-full object-cover" />
              <span className="absolute bottom-2 left-2 badge bg-ink-950/80 text-ink-50 backdrop-blur">Avatar</span>
            </div>
          )}
        </div>
      )}

      <button type="submit" disabled={busy} className="btn-primary mt-6">
        {busy ? <Spinner /> : <><Save className="h-4 w-4" /> {photo === null ? "Create profile" : "Save changes"}</>}
      </button>
    </form>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-700">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
        <p className="font-display text-xl font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function Row({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: "good" | "warn" | "bad" }) {
  const tone = highlight === "good" ? "text-emerald-700" : highlight === "warn" ? "text-amber-700" : highlight === "bad" ? "text-red-700" : "text-ink-800";
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-ink-500"><span className="text-ink-400">{icon}</span>{label}</span>
      <span className={`inline-flex items-center gap-1.5 font-medium capitalize ${tone}`}>
        {highlight === "warn" && <Clock className="h-3.5 w-3.5" />}
        {value}
      </span>
    </li>
  );
}

function BookingBadge({ status }: { status: Booking["status"] }) {
  const map = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    completed: "bg-ink-100 text-ink-600",
    cancelled: "bg-red-50 text-red-700",
  };
  return <span className={`badge capitalize ${map[status]}`}>{status}</span>;
}

function greetingFor() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
