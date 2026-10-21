import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check, Camera, Heart, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Spinner } from "../components/ui";
import { AuthAside } from "../components/AuthAside";
import type { Role } from "../lib/types";

const PW_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "An uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "A lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "A number" },
];

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const passed = useMemo(() => PW_RULES.filter((r) => r.test(password)).map((r) => r.label), [password]);
  const mismatch = confirm.length > 0 && confirm !== password;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Passwords do not match.");
    if (passed.length < PW_RULES.length) return setError("Your password doesn't meet all the requirements.");
    if (!agree) return setError("Please agree to the Terms and Privacy Policy to continue.");
    setBusy(true);
    const { error } = await signUp({ email: email.trim(), password, fullName: fullName.trim(), role });
    setBusy(false);
    if (error) return setError(error);
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
        <AuthAside eyebrow="Account created" title="You&apos;re in. Welcome to Ruger." body="Your account is ready. Complete your profile to start booking or listing your work." />
        <div className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">Check your email</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              We&apos;ve created your account. If email confirmation is enabled, follow the link in your inbox
              to activate it, then sign in.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/sign-in" className="btn-primary w-full">Continue to sign in</Link>
              <button onClick={() => navigate("/")} className="btn-ghost">Back to home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      <AuthAside
        eyebrow="Join Ruger"
        title="Where photographers and clients meet with intent."
        body="Create an account to book vetted photographers, or apply to list your portfolio and receive booking requests."
      />
      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-xl">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink-900">Create your account</h1>
            <p className="mt-2 text-sm text-ink-500">Join Ruger as a client or apply as a photographer.</p>
          </div>

        <form onSubmit={onSubmit} className="card mt-8 space-y-5 p-6 sm:p-8" noValidate>
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selection */}
          <fieldset>
            <legend className="label">I want to join as a</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <RoleCard
                selected={role === "client"}
                onSelect={() => setRole("client")}
                icon={<Heart className="h-5 w-5" />}
                title="Client"
                body="Book photographers for your sessions and manage your requests."
              />
              <RoleCard
                selected={role === "photographer"}
                onSelect={() => setRole("photographer")}
                icon={<Camera className="h-5 w-5" />}
                title="Photographer"
                body="Apply to list your portfolio and receive booking requests."
                badge="Approval required"
              />
            </div>
            {role === "photographer" && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent-50 px-3 py-2 text-xs text-accent-800">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                New photographers start in a review queue. Restricted features unlock once an admin approves your application.
              </p>
            )}
          </fieldset>

          <div>
            <label htmlFor="name" className="label">Full name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                className="input pl-9"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="input pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  aria-describedby="pw-rules"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm" className="label">Confirm password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="confirm"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`input pl-9 ${mismatch ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
              {mismatch && <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>}
            </div>
          </div>

          <ul id="pw-rules" className="flex flex-wrap gap-x-4 gap-y-1.5">
            {PW_RULES.map((r) => {
              const ok = passed.includes(r.label);
              return (
                <li key={r.label} className={`inline-flex items-center gap-1.5 text-xs ${ok ? "text-emerald-700" : "text-ink-500"}`}>
                  <Check className={`h-3 w-3 ${ok ? "opacity-100" : "opacity-30"}`} />
                  {r.label}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-ink-400">Avoid common or easily-guessed passwords (e.g. "Password1").</p>

          <label className="flex items-start gap-2.5 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-900"
            />
            <span>
              I agree to the <a className="font-medium text-ink-900 hover:underline" href="#">Terms of Service</a> and{" "}
              <a className="font-medium text-ink-900 hover:underline" href="#">Privacy Policy</a>.
            </span>
          </label>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Spinner /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/sign-in" className="link-underline">Sign in</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  selected, onSelect, icon, title, body, badge,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-ink-900 bg-ink-50 ring-2 ring-ink-900/10"
          : "border-ink-200 bg-white hover:border-ink-400"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${selected ? "bg-ink-900 text-ink-50" : "bg-ink-100 text-ink-700"}`}>
        {icon}
      </span>
      <span className="font-display text-base font-semibold text-ink-900">{title}</span>
      <span className="text-xs text-ink-500">{body}</span>
      {badge && <span className="badge bg-accent-50 text-accent-700">{badge}</span>}
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-ink-50">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
