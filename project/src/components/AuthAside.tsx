import { ShieldCheck, Sparkles, Camera } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthAside({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <aside className="relative hidden overflow-hidden bg-ink-950 text-ink-50 lg:block">
      <img
        src="https://images.pexels.com/photos/6874070/pexels-photo-6874070.jpeg?auto=compress&cs=tinysrgb&w=900&h=1400"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/85 to-ink-950" />
      <div className="relative flex h-full flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2.5 text-ink-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <Camera className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Ruger</span>
        </Link>

        <div className="max-w-md">
          <span className="badge border border-white/15 bg-white/5 text-ink-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            {eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-300">{body}</p>
          <ul className="mt-8 space-y-3 text-sm text-ink-200">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-accent-300" /> Vetted, reviewed professionals
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-accent-300" /> Transparent pricing, no surprises
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-accent-300" /> Secure, private booking
            </li>
          </ul>
        </div>

        <p className="text-xs text-ink-400">© {new Date().getFullYear()} Ruger Photography</p>
      </div>
    </aside>
  );
}
