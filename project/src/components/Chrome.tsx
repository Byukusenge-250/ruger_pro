import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth";

export function Header() {
  const { session, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore" },
    { to: "/about", label: "About" },
  ];

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-ink-50/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Ruger Photography home" data-tour="logo">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-ink-50 transition-transform group-hover:scale-105">
            <LogoMark className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">Ruger</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" data-tour="main-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-px h-px bg-ink-900" aria-hidden />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex" data-tour="auth-buttons">
          {session && profile ? (
            <>
              {profile.role === "admin" && (
                <Link to="/admin" className="btn-secondary">
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn-secondary">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn-ghost" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="btn-ghost">Sign in</Link>
              <Link to="/sign-up" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-200/60 bg-ink-50 md:hidden animate-fade-in">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-ink-200/60 pt-3">
              {session && profile ? (
                <>
                  {profile.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="btn-secondary">Admin panel</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-secondary">Dashboard</Link>
                  <button onClick={() => { setOpen(false); handleSignOut(); }} className="btn-ghost">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" onClick={() => setOpen(false)} className="btn-secondary">Sign in</Link>
                  <Link to="/sign-up" onClick={() => setOpen(false)} className="btn-primary">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const cols = [
    { heading: "Marketplace", links: [["Explore photographers", "/explore"], ["About", "/about"]] },
    { heading: "Account", links: [["Sign in", "/sign-in"], ["Create account", "/sign-up"], ["Dashboard", "/dashboard"]] },
  ];
  return (
    <footer className="border-t border-ink-200/60 bg-ink-50">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-ink-50">
                <LogoMark className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-semibold text-ink-900">Ruger Photography</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              Rwanda's curated marketplace connecting clients with vetted professional photographers.
              Real portfolios, transparent pricing in RWF, secure booking.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{col.heading}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-ink-600 transition-colors hover:text-ink-900">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-200/60 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Ruger Photography. All rights reserved.</p>
          <p>Made in Rwanda. Built for photographers and the people who hire them.</p>
        </div>
      </div>
    </footer>
  );
}

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3 7h3l1.5-2h6L15 7h6v11H3V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
