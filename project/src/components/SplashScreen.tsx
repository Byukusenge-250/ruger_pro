import { useEffect, useState } from "react";

/**
 * SplashScreen — shown for ~1.2 s on first load, then fades out.
 * Displays the Ruger camera logo mark centered on a dark background.
 */
export function SplashScreen() {
  // "visible" drives the fade-in; "hiding" drives the fade-out; "gone" unmounts
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "gone">("in");

  useEffect(() => {
    // fade in → 300 ms
    const t1 = setTimeout(() => setPhase("hold"), 300);
    // hold → 900 ms (total visible ≈ 1.2 s)
    const t2 = setTimeout(() => setPhase("out"), 1200);
    // fade out → 500 ms, then unmount
    const t3 = setTimeout(() => setPhase("gone"), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        background: "#111111",
        opacity: phase === "out" ? 0 : 1,
        transition: phase === "in"
          ? "opacity 0.3s ease-out"
          : phase === "out"
          ? "opacity 0.5s ease-in"
          : "none",
        pointerEvents: "none",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          transform: phase === "in" ? "scale(0.88)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
          transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease-out",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Camera SVG — matches LogoMark in Chrome.tsx but inverted colours */}
          <svg viewBox="0 0 24 24" fill="none" width={38} height={38} aria-hidden>
            <path
              d="M3 7h3l1.5-2h9L18 7h3v11H3V7z"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12.5" r="3.2" stroke="#111111" strokeWidth="1.8" />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      <div
        style={{
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.4s ease-out 0.15s, transform 0.4s ease-out 0.15s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Ruger
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.7rem",
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Photography
        </span>
      </div>

      {/* Subtle pulsing dot loader */}
      <div
        style={{
          display: "flex",
          gap: "0.35rem",
          marginTop: "0.5rem",
          opacity: phase === "in" ? 0 : 0.5,
          transition: "opacity 0.4s ease-out 0.3s",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ffffff",
              animation: `splashDot 1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
