import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, ShieldCheck, Sparkles, Calendar, Search, Quote } from "lucide-react";
import { PhotographerCard } from "../components/PhotographerCard";
import { Skeleton } from "../components/ui";
import { supabase } from "../lib/supabase";
import type { Photographer } from "../lib/types";

const HERO_IMG = "https://images.pexels.com/photos/36470605/pexels-photo-36470605.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280";
const GALLERY = [
  { src: "https://images.pexels.com/photos/35532983/pexels-photo-35532983.jpeg?auto=compress&cs=tinysrgb&w=800&h=1100", label: "Wedding" },
  { src: "https://images.pexels.com/photos/36470681/pexels-photo-36470681.jpeg?auto=compress&cs=tinysrgb&w=1000&h=750", label: "Kigali" },
  { src: "https://images.pexels.com/photos/10930061/pexels-photo-10930061.jpeg?auto=compress&cs=tinysrgb&w=800&h=1100", label: "Portrait" },
  { src: "https://images.pexels.com/photos/38294706/pexels-photo-38294706.jpeg?auto=compress&cs=tinysrgb&w=1000&h=750", label: "Wildlife" },
  { src: "https://images.pexels.com/photos/30184540/pexels-photo-30184540.jpeg?auto=compress&cs=tinysrgb&w=800&h=1100", label: "Fashion" },
  { src: "https://images.pexels.com/photos/35532990/pexels-photo-35532990.jpeg?auto=compress&cs=tinysrgb&w=1000&h=750", label: "Events" },
]

export default function LandingPage() {
  const [photographers, setPhotographers] = useState<Photographer[] | null>(null);

  useEffect(() => {
    supabase
      .from("photographers")
      .select("id, user_id, full_name, bio, city, country, specialties, price_from, avatar_url, cover_url, status, rating_avg, rating_count, created_at")
      .eq("status", "approved")
      .order("rating_avg", { ascending: false })
      .limit(4)
      .then(({ data }) => setPhotographers(data as Photographer[] | null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 text-ink-50" data-tour="hero">
        <img
          src={HERO_IMG}
          alt="Aerial view of Kigali, Rwanda at dusk"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-ink-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <div className="container-page relative py-24 sm:py-32 lg:py-44">
          <div className="max-w-2xl animate-fade-up">
            <span className="badge border border-white/15 bg-white/5 text-ink-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              Curated · Vetted · Made in Rwanda
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.75rem]">
              Find a photographer who sees Rwanda the way you do.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">
              Ruger connects you with hand-reviewed professional photographers across Rwanda — for weddings,
              portraits, events, and editorial — with transparent pricing and secure booking.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/explore" className="btn-light">
                Explore photographers
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/sign-up" className="btn border border-white/25 text-ink-50 hover:bg-white/10">
                Join as a photographer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-ink-200/60 bg-white" data-tour="trust-strip">
        <div className="container-page grid grid-cols-1 divide-y divide-ink-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: ShieldCheck, title: "Vetted professionals", body: "Every photographer is reviewed and approved before joining Ruger." },
            { icon: Calendar, title: "Secure booking", body: "Request, confirm, and manage sessions in one place." },
            { icon: Camera, title: "Real portfolios", body: "Browse genuine work, specialties, and transparent pricing in RWF." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 px-2 py-8 sm:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-accent-600">
                <f.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-ink-900">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured photographers */}
      <section className="container-page py-16 sm:py-24" data-tour="featured">
    <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">Featured</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Photographers we trust</h2>
            <p className="mt-2 text-sm text-ink-500">A few of our highest-rated, approved professionals.</p>
          </div>
          <Link to="/explore" className="hidden text-sm font-medium text-ink-700 hover:text-ink-900 sm:inline-flex sm:items-center sm:gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {photographers === null
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                    <Skeleton className="mt-3 h-6 w-1/2" />
                  </div>
                </div>
              ))
            : photographers.length === 0
              ? (
                <div className="col-span-full rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-14 text-center">
                  <p className="font-display text-lg font-medium text-ink-800">No approved photographers yet</p>
                  <p className="mt-1 text-sm text-ink-500">Be the first — join as a photographer and submit your portfolio for review.</p>
                  <Link to="/sign-up" className="btn-primary mt-5">Apply to join</Link>
                </div>
              )
              : photographers.map((p) => <PhotographerCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Gallery band */}
      <section className="bg-ink-950 py-16 text-ink-50 sm:py-24">
        <div className="container-page">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Portfolio</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Work that speaks for itself</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              A glimpse of the kind of imagery our photographers create — from intimate portraits to bold editorial.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {GALLERY.map((g, i) => (
              <div key={i} className={`group relative overflow-hidden rounded-xl ${i % 3 === 0 ? "row-span-2" : ""}`}>
                <img
                  src={g.src}
                  alt={`Sample ${g.label} photography`}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105 ${i % 3 === 0 ? "h-full min-h-[300px]" : "aspect-[4/3]"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 text-xs font-medium text-ink-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {g.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / quote */}
      <section className="container-page py-16 sm:py-24">
        <figure className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto h-8 w-8 text-accent-400" strokeWidth={1.5} />
          <blockquote className="mt-5 font-display text-2xl font-medium leading-snug text-ink-900 sm:text-3xl">
            “Boninga muri Ruger byoroshye cyane. Nahuje umunyamwuga mwiza w'ifoto mu gihe gito.”
          </blockquote>
          <figcaption className="mt-5 text-sm text-ink-500">
            <span className="font-medium text-ink-700">Mukamana A.</span> · Client, Kigali
          </figcaption>
        </figure>
      </section>

      {/* CTA */}
      <section className="container-page pb-20 sm:pb-28" data-tour="cta">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-8 text-ink-50 sm:p-12 lg:flex lg:items-center lg:justify-between">
          <img src="https://images.pexels.com/photos/36477481/pexels-photo-36477481.jpeg?auto=compress&cs=tinysrgb&w=1600&h=600" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/60" />
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to book your session?</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-300">
              Browse photographers by specialty, location, and price, then send a booking request in minutes.
            </p>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 lg:mt-0">
            <Link to="/explore" className="btn-light">
              <Search className="h-4 w-4" />
              Find a photographer
            </Link>
            <Link to="/sign-up" className="btn border border-white/25 text-ink-50 hover:bg-white/10">Create an account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
