"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { MicroCaptcha } from "./MicroCaptcha";
import { GuessHistoryList } from "./GuessHistoryList";
import type { GuessEntry } from "@/types";
import DOMPurify from "dompurify";

interface GameBoardProps {
  userId?: string;
  idToken?: string;
}

export function GameBoard({ userId, idToken }: GameBoardProps) {
  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [botToken, setBotToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const playSound = useCallback(
    (type: "miss" | "close" | "win") => {
      if (muted) return;
      if (!audioCtx.current) {
        audioCtx.current = new AudioContext();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "miss") {
        osc.frequency.value = 220;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "close") {
        [330, 415, 523].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = "triangle";
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.08 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);
          o.start(ctx.currentTime + i * 0.08);
          o.stop(ctx.currentTime + i * 0.08 + 0.5);
        });
      } else if (type === "win") {
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = "triangle";
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.8);
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.8);
        });
      }
    },
    [muted]
  );

  const handleSubmit = useCallback(async () => {
    const clean = DOMPurify.sanitize(input.trim().toLowerCase());
    if (!clean) return;
    if (!botToken) {
      setError("Patunayan muna na ikaw ay tao.");
      return;
    }
    if (loading || won) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          word: clean,
          botToken,
          timestamp: Date.now(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error ?? "May error. Subukang muli.");
        return;
      }
      const entry: GuessEntry = { ...data.entry, id: crypto.randomUUID() };
      setGuesses((prev) => [entry, ...prev].sort((a, b) => a.rank - b.rank));
      setInput("");
      if (data.correct) {
        setWon(true);
        playSound("win");
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "Tama! Nahulaan mo ang Salita ng Araw!";
        }
      } else {
        if (entry.rank <= 100) {
          playSound("close");
        } else {
          playSound("miss");
        }
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `Ranggo ${entry.rank}.`;
        }
      }
    } catch {
      setError("Hindi makonekta sa server. Subukang muli.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, botToken, loading, won, idToken, playSound]);

  return (
    <div style={{ fontSize }} className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "var(--text-muted)" }}>
        <button onClick={() => setFontSize((s) => Math.min(s + 2, 24))} aria-label="Palakihin ang teksto" className="px-2 py-1 rounded border" style={{ borderColor: "var(--border-subtle)" }}>A+</button>
        <button onClick={() => setFontSize((s) => Math.max(s - 2, 12))} aria-label="Paliitin ang teksto" className="px-2 py-1 rounded border" style={{ borderColor: "var(--border-subtle)" }}>A−</button>
        <button onClick={() => setHighContrast((h) => !h)} aria-pressed={highContrast} className="px-2 py-1 rounded border" style={{ borderColor: "var(--border-subtle)" }}>{highContrast ? "Normal" : "High Contrast"}</button>
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "I-unmute" : "I-mute"} className="px-2 py-1 rounded border ml-auto" style={{ borderColor: "var(--border-subtle)" }}>{muted ? "🔇" : "🔊"}</button>
      </div>
      <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {won && (
        <div className="rounded-xl p-5 text-center" style={{ background: "rgba(74,142,93,0.15)", border: "1px solid #4A8E5D55" }}>
          <p className="font-display text-xl" style={{ color: "#4A8E5D" }}>🎉 Nahulaan mo ang Salita ng Araw!</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{guesses.length} na hula ang ginamit mo</p>
        </div>
      )}
      {!won && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Isulat ang salita..."
              maxLength={64}
              className="flex-1 px-4 py-3 rounded-xl outline-none transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-cream)", fontFamily: "var(--font-body)" }}
              aria-label="Input ng salita"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !botToken}
              className="px-5 py-3 rounded-xl font-display transition-all"
              style={{ background: loading ? "rgba(201,168,76,0.2)" : "#C9A84C", color: loading ? "#C9A84C" : "#1A120B", fontWeight: 600, opacity: !botToken ? 0.5 : 1 }}
              aria-label="Isumite ang hula"
            >
              {loading ? "..." : "Hula"}
            </button>
          </div>
          <MicroCaptcha onVerified={setBotToken} />
          {error && <p className="text-sm" style={{ color: "#AE433A" }} role="alert">{error}</p>}
        </div>
      )}
      <div className="rounded-xl flex items-center justify-center text-xs" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)", height: 90, color: "var(--text-muted)" }} aria-label="Patalastas">
        Patalastas — 728×90
      </div>
      <GuessHistoryList guesses={guesses} />
    </div>
  );
}
