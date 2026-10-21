import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Star,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { Avatar, EmptyState, Skeleton, Spinner, Stars } from "../components/ui";
import { supabase } from "../lib/supabase";
import type { Photographer, Review } from "../lib/types";
import { SPECIALTIES } from "../lib/types";

export default function PhotographerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const [p, setP] = useState<Photographer | null | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    if (!id) return;
    setP(undefined);
    setReviews(null);
    supabase
      .from("photographers")
      .select("id, user_id, full_name, bio, city, country, specialties, price_from, avatar_url, cover_url, status, rating_avg, rating_count, created_at")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setP(data as Photographer | null));

    supabase
      .from("reviews")
      .select("id, photographer_id, client_name, rating, comment, created_at")
      .eq("photographer_id", id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setReviews(data as Review[] | null));
  }, [id]);

  if (p === undefined) {
    return (
      <div className="container-page py-16">
        <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
        <div className="mt-6 flex gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (p === null) {
    return (
      <div className="container-page py-20">
        <EmptyState title="Photographer not found" body="This profile may have been removed or is not yet approved." />
      </div>
    );
  }

  const isListed = p.status === "approved";

  return (
    <div>
      <div className="relative h-[44vh] min-h-[300px] w-full overflow-hidden bg-ink-900">
        {p.cover_url && (
          <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/30 to-transparent" />
        <div className="container-page relative flex h-full items-end">
          <Link to="/explore" className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-ink-900 backdrop-blur transition-colors hover:bg-white sm:left-8">
            <ArrowLeft className="h-4 w-4" /> Back to explore
          </Link>
        </div>
      </div>

      <div className="container-page relative -mt-14 pb-20">
        <div className="card overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="ring-4 ring-white rounded-full">
                <Avatar name={p.full_name} src={p.avatar_url} size={80} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{p.full_name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[p.city, p.country].filter(Boolean).join(", ") || "Remote"}</span>
                  {p.rating_count > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Stars value={p.rating_avg} />
                      <span className="text-ink-700">{p.rating_avg.toFixed(1)} · {p.rating_count} review{p.rating_count === 1 ? "" : "s"}</span>
                    </span>
                  ) : <span className="text-ink-400">No reviews yet</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.specialties.map((s) => <span key={s} className="badge bg-ink-100 text-ink-700">{s}</span>)}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              {isListed ? (
                <span className="badge bg-emerald-50 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Approved & available</span>
              ) : (
                <span className="badge bg-amber-50 text-amber-700">Status: {p.status}</span>
              )}
              {p.price_from != null && (
                <p className="text-sm text-ink-600">From <span className="font-display text-lg font-semibold text-ink-900">{p.price_from.toLocaleString()} RWF</span></p>
              )}
            </div>
          </div>

          {p.bio && (
            <div className="mt-7 border-t border-ink-100 pt-6">
              <h2 className="font-display text-lg font-semibold text-ink-900">About</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{p.bio}</p>
            </div>
          )}
        </div>

        {/* Booking + Contact actions */}
        {isListed && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <BookingForm photographer={p} signedIn={!!session} />
            <ReviewForm photographer={p} signedIn={!!session} onSubmitted={() => reloadReviews(id!, setReviews)} />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold text-ink-900">Reviews</h2>
            {p.rating_count > 0 && (
              <span className="text-sm text-ink-500">{p.rating_count} review{p.rating_count === 1 ? "" : "s"}</span>
            )}
          </div>
          <div className="mt-4">
            {reviews === null ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState icon={<Star className="h-7 w-7" />} title="No reviews yet" body="Reviews appear here after clients complete a booking." />
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="card p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-ink-900">{r.client_name}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{r.comment}</p>
                    <p className="mt-2 text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function reloadReviews(photoId: string, setter: (v: Review[] | null) => void) {
  supabase
    .from("reviews")
    .select("id, photographer_id, client_name, rating, comment, created_at")
    .eq("photographer_id", photoId)
    .order("created_at", { ascending: false })
    .limit(10)
    .then(({ data }) => setter(data as Review[] | null));
}

function BookingForm({ photographer, signedIn }: { photographer: Photographer; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [type, setType] = useState(photographer.specialties[0] ?? "Portrait");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date) return setError("Please choose a session date.");
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError("You must be signed in to book.");
      setBusy(false);
      return;
    }
    const { error: insertError } = await supabase.from("bookings").insert({
      photographer_id: photographer.id,
      client_id: user.id,
      client_name: user.user_metadata?.full_name ?? user.email ?? "Client",
      client_email: user.email ?? "",
      session_date: date,
      session_type: type,
      location: location || null,
      message: message || null,
      status: "pending",
    });
    setBusy(false);
    if (insertError) return setError("Could not submit your request. Please try again.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="card p-6 lg:col-span-2">
        <div className="flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
          <p className="font-display text-lg font-semibold">Booking request sent</p>
        </div>
        <p className="mt-2 text-sm text-ink-600">
          {photographer.full_name} will review your request and confirm shortly. You can track the status in your dashboard.
        </p>
        <Link to="/dashboard" className="btn-secondary mt-4">Go to dashboard</Link>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="card flex items-center justify-between gap-4 p-5 lg:col-span-2">
        <div>
          <p className="font-display text-base font-semibold text-ink-900">Book a session</p>
          <p className="mt-0.5 text-sm text-ink-500">Request a date and the photographer will confirm.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="btn-primary"
          disabled={!signedIn}
          title={!signedIn ? "Sign in to book a session" : undefined}
        >
          <Calendar className="h-4 w-4" /> {signedIn ? "Request booking" : "Sign in to book"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 lg:col-span-2">
      <div className="flex items-center justify-between border-b border-ink-100 pb-3">
        <h3 className="font-display text-lg font-semibold text-ink-900">Request a booking</h3>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bk-date">Session date</label>
          <input id="bk-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <label className="label" htmlFor="bk-type">Session type</label>
          <select id="bk-type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="bk-loc">Location (optional)</label>
        <input id="bk-loc" className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Studio, venue, or city" />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="bk-msg">Message (optional)</label>
        <textarea id="bk-msg" className="input min-h-[90px] resize-y" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the photographer what you're looking for..." />
      </div>
      <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
        {busy ? <Spinner /> : <>Send request <Calendar className="h-4 w-4" /></>}
      </button>
    </form>
  );
}

function ReviewForm({ photographer, signedIn, onSubmitted }: { photographer: Photographer; signedIn: boolean; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!comment.trim()) return setError("Please write a short review.");
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError("You must be signed in to leave a review.");
      setBusy(false);
      return;
    }
    const { error: insertError } = await supabase.from("reviews").insert({
      photographer_id: photographer.id,
      client_name: user.user_metadata?.full_name ?? user.email ?? "Client",
      rating,
      comment: comment.trim(),
    });
    setBusy(false);
    if (insertError) return setError("Could not submit your review. Please try again.");
    setComment("");
    setRating(5);
    setOpen(false);
    onSubmitted();
  }

  if (!open) {
    return (
      <div className="card flex items-center justify-between gap-4 p-5">
        <div>
          <p className="font-display text-base font-semibold text-ink-900">Leave a review</p>
          <p className="mt-0.5 text-sm text-ink-500">Share your experience working with this photographer.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-secondary" disabled={!signedIn} title={!signedIn ? "Sign in to leave a review" : undefined}>
          <Star className="h-4 w-4" /> {signedIn ? "Write a review" : "Sign in"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <div className="flex items-center justify-between border-b border-ink-100 pb-3">
        <h3 className="font-display text-lg font-semibold text-ink-900">Write a review</h3>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}
      <div className="mt-4">
        <label className="label">Your rating</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className="rounded p-1 transition-transform hover:scale-110"
              aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
            >
              <Star className={`h-6 w-6 ${i < rating ? "fill-accent-400 text-accent-400" : "text-ink-300"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="rv-comment">Your review</label>
        <textarea id="rv-comment" className="input min-h-[100px] resize-y" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your experience?" />
      </div>
      <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
        {busy ? <Spinner /> : <>Submit review <Star className="h-4 w-4" /></>}
      </button>
    </form>
  );
}
