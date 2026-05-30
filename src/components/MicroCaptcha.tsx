"use client";
import { useState, useCallback } from "react";

interface MicroCaptchaProps {
  onVerified: (token: string) => void;
}

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
        const token = `sd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        onVerified(token);
        setState("done");
      }
    }, 1000);
  }, [state, onVerified]);

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "#4A8E5D" }}>
        ✓ Napatunayan na ikaw ay tao
      </div>
    );
  }

  return (
    <button onClick={start} disabled={state === "waiting"} className="px-4 py-2 rounded-lg text-sm transition-all" style={{ background: "rgba(253,253,255,0.06)", border: "1px solid rgba(253,253,255,0.12)", color: "var(--text-muted)", cursor: state === "waiting" ? "wait" : "pointer" }} aria-label="Bot verification">
      {state === "idle" && "✦ Patunayan na tao ka"}
      {state === "waiting" && `Naghihintay... ${countdown}`}
    </button>
  );
}
