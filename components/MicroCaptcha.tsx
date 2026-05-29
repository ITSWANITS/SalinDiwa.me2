// src/components/MicroCaptcha.tsx
"use client";
import { useState, useCallback } from "react";

interface MicroCaptchaProps {
  onVerified: (token: string) => void;
}

/**
 * Simple click-delay bot guard.
 * Generates a time-bound token after a short delay to trip up bots.
 */
export function MicroCaptcha({ onVerified }: MicroCaptchaProps) {
  const [state, setState] = useState<"idle" | "waiting" | "done">("idle");
  const [countdown, setCountdown] = useState(0);

  const start = useCallback(() => {
    if (state !== "idle") return;
    setState("waiting");
    let count = 2;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        // Generate time-bound token
        const token = `sd_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 10)}`;
        onVerified(token);
        setState("done");
      }
    }, 1000);
  }, [state, onVerified]);

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "#4A8E5D" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#4A8E5D" strokeWidth="1.5" />
          <path d="M5 8l2 2 4-4" stroke="#4A8E5D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Napatunayan na ikaw ay tao
      </div>
    );
  }

  return (
    <button
      onClick={start}
      disabled={state === "waiting"}
      className="px-4 py-2 rounded-lg text-sm transition-all"
      style={{
        background: "rgba(253,253,255,0.06)",
        border: "1px solid rgba(253,253,255,0.12)",
        color: "var(--text-muted)",
        cursor: state === "waiting" ? "wait" : "pointer",
      }}
      aria-label="Bot verification"
    >
      {state === "idle" && "✦ Patunayan na tao ka"}
      {state === "waiting" && `Naghihintay... ${countdown}`}
    </button>
  );
}