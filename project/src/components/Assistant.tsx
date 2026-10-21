import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  X,
  Sparkles,
  ArrowRight,
  Search,
  LayoutDashboard,
  ShieldCheck,
  HelpCircle,
  Check,
  Circle,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../lib/auth";

type StepId =
  | "greeting"
  | "what_is_ruger"
  | "how_signup"
  | "pick_role"
  | "client_benefits"
  | "photographer_benefits"
  | "how_explore"
  | "how_book"
  | "dashboard_help"
  | "contact"
  | "main_menu"
  | "client_onboarding"
  | "photographer_onboarding"
  | "pending_help"
  | "approved_help";

interface Step {
  id: StepId;
  bot: string[];
  options: { label: string; next: StepId; action?: string }[];
}

const STEPS: Record<StepId, Step> = {
  greeting: {
    id: "greeting",
    bot: [
      "Hi there! I'm Ruger's guide.",
      "I can help you create an account, find photographers, or learn how the marketplace works. What brings you here?",
    ],
    options: [
      { label: "I want to create an account", next: "how_signup" },
      { label: "How does Ruger work?", next: "what_is_ruger" },
      { label: "I want to find a photographer", next: "how_explore" },
      { label: "I'm a photographer — how do I join?", next: "photographer_benefits" },
    ],
  },
  what_is_ruger: {
    id: "what_is_ruger",
    bot: [
      "Ruger is a curated marketplace that connects clients with vetted professional photographers.",
      "Every photographer is reviewed and approved before being listed. You get real portfolios, transparent pricing, and secure booking — all in one place.",
    ],
    options: [
      { label: "Create an account", next: "how_signup", action: "/sign-up" },
      { label: "Browse photographers", next: "how_explore", action: "/explore" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  how_signup: {
    id: "how_signup",
    bot: [
      "Creating an account takes about a minute. Here's how:",
      "1. Pick whether you're joining as a client or a photographer.\n2. Enter your name, email, and a password.\n3. Agree to the terms and submit.\n4. If email confirmation is on, check your inbox and click the link.",
      "Ready? I can take you to the sign-up page now.",
    ],
    options: [
      { label: "Take me to sign up", next: "main_menu", action: "/sign-up" },
      { label: "What's the difference between roles?", next: "pick_role" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  pick_role: {
    id: "pick_role",
    bot: [
      "Two roles to choose from:",
      "Client — book photographers for sessions, manage your requests, and leave reviews.\n\nPhotographer — list your portfolio, set your specialties and pricing, and receive booking requests. New photographers start in a review queue and go live once an admin approves them.",
    ],
    options: [
      { label: "Join as a client", next: "client_benefits", action: "/sign-up" },
      { label: "Join as a photographer", next: "photographer_benefits", action: "/sign-up" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  client_benefits: {
    id: "client_benefits",
    bot: [
      "As a client you can:",
      "• Browse vetted photographers by specialty, location, and budget\n• View real portfolios and reviews\n• Send booking requests in minutes\n• Track everything from your dashboard",
      "Want me to open the sign-up page?",
    ],
    options: [
      { label: "Sign up as a client", next: "main_menu", action: "/sign-up" },
      { label: "Explore photographers first", next: "how_explore", action: "/explore" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  photographer_benefits: {
    id: "photographer_benefits",
    bot: [
      "As a photographer on Ruger you can:",
      "• Build a public portfolio with your best work\n• List your specialties and starting price\n• Receive booking requests from qualified clients\n• Track your status and reviews from your dashboard",
      "New photographers start in a pending review queue. Once an admin approves your profile, you'll appear in the marketplace.",
      "Ready to apply?",
    ],
    options: [
      { label: "Apply to join", next: "main_menu", action: "/sign-up" },
      { label: "Learn more about Ruger", next: "what_is_ruger", action: "/about" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  how_explore: {
    id: "how_explore",
    bot: [
      "Finding the right photographer is easy:",
      "1. Go to the Explore page.\n2. Filter by specialty (wedding, portrait, fashion, etc.), location, or max price.\n3. Click any photographer to see their portfolio, reviews, and pricing.\n4. Hit \"Request booking\" when you've found your match.",
      "Want me to open the explore page?",
    ],
    options: [
      { label: "Explore photographers", next: "main_menu", action: "/explore" },
      { label: "I need an account first", next: "how_signup", action: "/sign-up" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  how_book: {
    id: "how_book",
    bot: [
      "To book a photographer:",
      "1. Find a photographer you like on the Explore page.\n2. Open their profile to review their portfolio and pricing.\n3. Click \"Request booking\" and provide your event details.\n4. The photographer confirms, and you'll see the booking in your dashboard.",
      "You'll need an account to send a booking request.",
    ],
    options: [
      { label: "Explore photographers", next: "main_menu", action: "/explore" },
      { label: "Create an account", next: "how_signup", action: "/sign-up" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  dashboard_help: {
    id: "dashboard_help",
    bot: [
      "Your dashboard is your command center.",
      "Here you can see your upcoming bookings, unread messages, your rating (for photographers), and your profile details — including your approval status if you're a photographer.",
    ],
    options: [
      { label: "Go to my dashboard", next: "main_menu", action: "/dashboard" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  contact: {
    id: "contact",
    bot: [
      "Need more help? You can reach out through the About page, or if you're signed in, check your dashboard for booking and message details.",
      "If you're a photographer waiting for approval, an admin will review your profile — you'll see the status update on your dashboard.",
    ],
    options: [
      { label: "View About page", next: "main_menu", action: "/about" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  client_onboarding: {
    id: "client_onboarding",
    bot: [
      "Welcome to Ruger! Here's how to get the most out of your client account:",
      "1. Explore photographers and filter by what matters to you.\n2. Open a photographer's profile to see their portfolio and reviews.\n3. Send a booking request when you've found the right match.\n4. Track your bookings from your dashboard.",
    ],
    options: [
      { label: "Explore photographers", next: "main_menu", action: "/explore" },
      { label: "Go to my dashboard", next: "main_menu", action: "/dashboard" },
      { label: "How does booking work?", next: "how_book" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  photographer_onboarding: {
    id: "photographer_onboarding",
    bot: [
      "Welcome aboard! Here's the path to getting listed on Ruger:",
      "1. Go to your dashboard and set up your photographer profile.\n2. Add your bio, city, specialties, and starting price.\n3. Your profile enters the review queue.\n4. Once an admin approves it, you'll appear in the marketplace and can receive bookings.",
    ],
    options: [
      { label: "Go to my dashboard", next: "main_menu", action: "/dashboard" },
      { label: "What can I do while pending?", next: "pending_help" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  pending_help: {
    id: "pending_help",
    bot: [
      "While your profile is pending review:",
      "• You can still browse the marketplace and see other photographers.\n• You can update your profile details anytime — changes go into the next review.\n• An admin typically reviews new profiles within 1–2 business days.\n• You'll see your status change on your dashboard once reviewed.",
    ],
    options: [
      { label: "Go to my dashboard", next: "main_menu", action: "/dashboard" },
      { label: "Explore the marketplace", next: "main_menu", action: "/explore" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  approved_help: {
    id: "approved_help",
    bot: [
      "Your profile is approved and live in the marketplace!",
      "Here's what you can do now:",
      "• Check your dashboard for incoming booking requests.\n• Keep your portfolio and pricing up to date.\n• Respond to booking requests promptly to maintain a good rating.\n• Ask satisfied clients to leave reviews — they boost your visibility.",
    ],
    options: [
      { label: "Go to my dashboard", next: "main_menu", action: "/dashboard" },
      { label: "View my public profile", next: "main_menu", action: "/explore" },
      { label: "Back to main menu", next: "main_menu" },
    ],
  },
  main_menu: {
    id: "main_menu",
    bot: ["What else can I help you with?"],
    options: [
      { label: "Create an account", next: "how_signup" },
      { label: "Find a photographer", next: "how_explore" },
      { label: "How does booking work?", next: "how_book" },
      { label: "I'm a photographer", next: "photographer_benefits" },
      { label: "Dashboard help", next: "dashboard_help" },
      { label: "Contact / more help", next: "contact" },
    ],
  },
};

interface ChatMsg {
  id: number;
  from: "bot" | "user";
  text: string;
  options?: { label: string; next: StepId; action?: string }[];
  checklist?: ChecklistItem[];
}

interface ChecklistItem {
  label: string;
  done: boolean;
  action?: string;
}

const PROGRESS_KEY = "ruger_progress";

interface Progress {
  visitedExplore: boolean;
  visitedPhotographerProfile: boolean;
  visitedDashboard: boolean;
  hasAccount: boolean;
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* ignore */ }
  return { visitedExplore: false, visitedPhotographerProfile: false, visitedDashboard: false, hasAccount: false };
}

function saveProgress(p: Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function Assistant() {
  const { session, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [, setStep] = useState<StepId>("greeting");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const msgId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAuthPage = ["/sign-in", "/sign-up"].includes(location.pathname);

  const updateProgress = useCallback((updates: Partial<Progress>) => {
    setProgress((prev) => {
      const next = { ...prev, ...updates };
      saveProgress(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (session) updateProgress({ hasAccount: true });
  }, [session, updateProgress]);

  useEffect(() => {
    if (location.pathname === "/explore") updateProgress({ visitedExplore: true });
    if (location.pathname.startsWith("/photographers/")) updateProgress({ visitedPhotographerProfile: true });
    if (location.pathname === "/dashboard") updateProgress({ visitedDashboard: true });
  }, [location.pathname, updateProgress]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, typing]);

  const isClient = profile?.role === "client";
  const isPhotographer = profile?.role === "photographer";

  const checklist = buildChecklist(progress, isClient, isPhotographer);

  const greetingStep = computeGreetingStep(session, profile, progress);

  function pushBot(id: StepId, includeChecklist = false) {
    const s = STEPS[id];
    setTyping(true);
    setStep(id);
    let delay = 500;
    s.bot.forEach((text, i) => {
      setTimeout(() => {
        if (i === s.bot.length - 1) setTyping(false);
        setMsgs((prev) => [...prev, {
          id: msgId.current++,
          from: "bot",
          text,
          options: i === s.bot.length - 1 ? s.options : undefined,
          checklist: i === s.bot.length - 1 && includeChecklist ? checklist : undefined,
        }]);
      }, delay);
      delay += 700;
    });
  }

  function handleOption(opt: { label: string; next: StepId; action?: string }) {
    setMsgs((prev) => [...prev, { id: msgId.current++, from: "user", text: opt.label }]);
    if (opt.action) {
      setTimeout(() => navigate(opt.action!), 200);
    }
    setTimeout(() => pushBot(opt.next), 350);
  }

  function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && !seen) {
      setSeen(true);
      pushBot(greetingStep, true);
    }
  }

  function reset() {
    setMsgs([]);
    setTyping(false);
    setStep("greeting");
    pushBot(greetingStep, true);
  }

  const contextGreeting = session && profile
    ? `Welcome back, ${profile.full_name.split(" ")[0]}!`
    : "New to Ruger? I can help you get started.";

  const completedCount = checklist.filter((c) => c.done).length;
  const totalCount = checklist.length;

  return (
    <>
      {/* Floating bubble */}
      {!open && !isAuthPage && (
        <button
          onClick={toggle}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-ink-900 px-4 py-3 text-sm font-medium text-ink-50 shadow-lg shadow-ink-900/20 transition-all hover:scale-105 hover:bg-ink-800 sm:bottom-6 sm:right-6"
          aria-label="Open assistant"
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-20" />
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">{contextGreeting}</span>
          <span className="sm:hidden">Help</span>
          {totalCount > 0 && completedCount < totalCount && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-ink-950">
              {completedCount}/{totalCount}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[34rem] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl shadow-ink-900/15 animate-fade-up sm:bottom-6 sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-100 bg-ink-900 px-4 py-3 text-ink-50">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-4 w-4 text-accent-300" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold">Ruger Guide</p>
                <p className="text-xs text-ink-300">
                  {session && profile
                    ? `${completedCount} of ${totalCount} steps done`
                    : "Here to help you get started"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="rounded-md p-1.5 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-50"
                aria-label="Restart conversation"
                title="Restart"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-50"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="border-b border-ink-100 bg-ink-50 px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-600">Your progress</span>
                <span className="text-ink-400">{completedCount}/{totalCount}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-200">
                <div
                  className="h-full rounded-full bg-accent-500 transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/50 px-4 py-4">
            {msgs.map((m) => (
              <div key={m.id}>
                {m.from === "bot" ? (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-ink-50">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <div className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-800 shadow-sm">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink-900 px-3.5 py-2.5 text-sm leading-relaxed text-ink-50">
                      {m.text}
                    </div>
                  </div>
                )}
                {m.checklist && m.checklist.length > 0 && (
                  <Checklist items={m.checklist} onAction={(action) => { if (action) navigate(action); }} />
                )}
                {m.options && m.options.length > 0 && (
                  <div className="mt-2.5 ml-8 flex flex-wrap gap-2">
                    {m.options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleOption(opt)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-all hover:border-ink-400 hover:bg-ink-50 hover:text-ink-900 active:scale-95"
                      >
                        {opt.action && <ArrowRight className="h-3 w-3 text-accent-500" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-ink-50">
                  <Sparkles className="h-3 w-3" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                  <Dot delay="0ms" />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>

          {/* Quick links footer */}
          <div className="border-t border-ink-100 bg-white px-4 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <QuickLink icon={<Search className="h-3.5 w-3.5" />} label="Explore" onClick={() => { navigate("/explore"); }} />
              {session ? (
                <QuickLink icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Dashboard" onClick={() => { navigate("/dashboard"); }} />
              ) : (
                <QuickLink icon={<UserPlus className="h-3.5 w-3.5" />} label="Sign up" onClick={() => { navigate("/sign-up"); }} />
              )}
              <QuickLink icon={<ShieldCheck className="h-3.5 w-3.5" />} label="About" onClick={() => { navigate("/about"); }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function buildChecklist(progress: Progress, isClient: boolean, isPhotographer: boolean): ChecklistItem[] {
  if (!progress.hasAccount) {
    return [
      { label: "Create an account", done: false, action: "/sign-up" },
      { label: "Explore photographers", done: progress.visitedExplore, action: "/explore" },
      { label: "View a photographer's portfolio", done: progress.visitedPhotographerProfile },
      { label: "Send a booking request", done: false },
    ];
  }
  if (isClient) {
    return [
      { label: "Create an account", done: true },
      { label: "Explore photographers", done: progress.visitedExplore, action: "/explore" },
      { label: "View a photographer's portfolio", done: progress.visitedPhotographerProfile },
      { label: "Send a booking request", done: false, action: "/explore" },
      { label: "Check your dashboard", done: progress.visitedDashboard, action: "/dashboard" },
    ];
  }
  if (isPhotographer) {
    return [
      { label: "Create an account", done: true },
      { label: "Set up your photographer profile", done: progress.visitedDashboard, action: "/dashboard" },
      { label: "Get approved by admin", done: false },
      { label: "Appear in the marketplace", done: false },
      { label: "Receive your first booking", done: false },
    ];
  }
  return [];
}

function computeGreetingStep(
  session: ReturnType<typeof useAuth>["session"],
  profile: ReturnType<typeof useAuth>["profile"],
  progress: Progress,
): StepId {
  if (!session || !profile) {
    return "greeting";
  }
  if (profile.role === "client") {
    if (!progress.visitedExplore) return "client_onboarding";
    return "main_menu";
  }
  if (profile.role === "photographer") {
    if (!progress.visitedDashboard) return "photographer_onboarding";
    return "main_menu";
  }
  return "main_menu";
}

function Checklist({ items, onAction }: { items: ChecklistItem[]; onAction: (action?: string) => void }) {
  return (
    <div className="ml-8 mt-2 rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Getting started</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => onAction(item.action)}
              disabled={!item.action}
              className={`flex w-full items-center gap-2 text-left text-xs transition-colors ${
                item.done ? "text-ink-400" : item.action ? "text-ink-700 hover:text-ink-900" : "text-ink-600"
              }`}
            >
              {item.done ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-ink-300" />
              )}
              <span className={item.done ? "line-through" : ""}>{item.label}</span>
              {item.action && !item.done && (
                <ArrowRight className="ml-auto h-3 w-3 text-accent-500" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400"
      style={{ animationDelay: delay }}
    />
  );
}

function QuickLink({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
    >
      {icon}
      {label}
    </button>
  );
}
