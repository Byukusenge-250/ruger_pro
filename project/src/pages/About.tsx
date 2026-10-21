import { ShieldCheck, Users, Camera, BadgeCheck, Calendar, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div>
      {/* Hero band */}
      <section className="relative overflow-hidden bg-ink-950 text-ink-50">
        <img
          src="https://images.pexels.com/photos/36470605/pexels-photo-36470605.jpeg?auto=compress&cs=tinysrgb&w=1920&h=900"
          alt="Aerial view of Kigali, Rwanda at dusk"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />
        <div className="container-page relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <span className="badge border border-white/15 bg-white/5 text-ink-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" /> Our story
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Rwanda's home for professional photography.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">
              Ruger Photography was founded in Kigali on a simple idea: finding the right photographer in Rwanda
              should feel as considered as the images themselves. We curate our roster, verify every professional,
              and give clients and photographers a clean, trustworthy place to work together.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
      <div className="mt-0 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Trust by design", body: "Every photographer in Rwanda passes an application and review process before being listed." },
          { icon: Users, title: "Two-sided marketplace", body: "Clients book with confidence. Photographers get a professional home for their work." },
          { icon: BadgeCheck, title: "Transparent pricing", body: "No hidden fees. Starting prices in RWF and specialties are shown up front." },
        ].map((f) => (
          <div key={f.title} className="card-hover p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-accent-600">
              <f.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card-hover p-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-accent-600">
            <Camera className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">For photographers</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Build a portfolio, list your specialties and pricing in RWF, and receive booking requests from
            qualified clients across Rwanda. New photographers start in a review queue and are listed once approved.
          </p>
          <Link to="/sign-up" className="btn-primary mt-5">Apply to join</Link>
        </div>
        <div className="card-hover p-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-accent-600">
            <Heart className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">For clients</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Browse vetted photographers across Rwanda by specialty, location, and budget. Review real portfolios
            and send a booking request in minutes.
          </p>
          <Link to="/explore" className="btn-primary mt-5"><Calendar className="h-4 w-4" /> Find a photographer</Link>
        </div>
      </div>
      </section>
    </div>
  );
}
