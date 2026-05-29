"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

import { MicroCaptcha } from "./MicroCaptcha";
import { GuessHistoryList } from "../components/GuessHistoryList";

import type { GuessEntry } from "../types";

import DOMPurify from "dompurify";

interface GameBoardProps {
  userId?: string;
  idToken?: string;
}

export function GameBoard({
  userId,
  idToken,
}: GameBoardProps) {
  const [input, setInput] = useState("");

  const [guesses, setGuesses] =
    useState<GuessEntry[]>([]);

  const [botToken, setBotToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [won, setWon] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [fontSize, setFontSize] =
    useState(16);

  const [highContrast, setHighContrast] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const liveRegionRef =
    useRef<HTMLDivElement>(null);

  const audioCtx =
    useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (highContrast) {
      document.body.classList.add(
        "high-contrast"
      );
    } else {
      document.body.classList.remove(
        "high-contrast"
      );
    }
  }, [highContrast]);

  const playSound = useCallback(
    (type: "miss" | "close" | "win") => {
      if (
        muted ||
        typeof window === "undefined"
      ) {
        return;
      }

      if (!audioCtx.current) {
        const AudioClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioClass) return;

        audioCtx.current =
          new AudioClass();
      }

      const ctx = audioCtx.current;

      if (!ctx) return;

      const playTone = (
        frequency: number,
        duration: number,
        delay = 0
      ) => {
        const osc =
          ctx.createOscillator();

        const gain =
          ctx.createGain();

        osc.connect(gain);

        gain.connect(ctx.destination);

        osc.frequency.value =
          frequency;

        osc.type = "triangle";

        gain.gain.setValueAtTime(
          0,
          ctx.currentTime + delay
        );

        gain.gain.linearRampToValueAtTime(
          0.15,
          ctx.currentTime + delay + 0.05
        );

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime +
            delay +
            duration
        );

        osc.start(
          ctx.currentTime + delay
        );

        osc.stop(
          ctx.currentTime +
            delay +
            duration
        );
      };

      if (type === "miss") {
        playTone(220, 0.4);
      }

      if (type === "close") {
        playTone(330, 0.5, 0);
        playTone(415, 0.5, 0.08);
        playTone(523, 0.5, 0.16);
      }

      if (type === "win") {
        playTone(523, 0.8, 0);
        playTone(659, 0.8, 0.12);
        playTone(784, 0.8, 0.24);
        playTone(1047, 0.8, 0.36);
      }
    },
    [muted]
  );

  const handleSubmit = useCallback(
    async () => {
      const clean =
        DOMPurify.sanitize(
          input
            .trim()
            .toLowerCase()
        );

      if (!clean) return;

      if (!botToken) {
        setError(
          "Patunayan muna na ikaw ay tao."
        );
        return;
      }

      if (loading || won) return;

      setLoading(true);

      setError(null);

      try {
        const response = await fetch(
          "/api/guess",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(idToken
                ? {
                    Authorization: `Bearer ${idToken}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              word: clean,
              botToken,
              timestamp: Date.now(),
              userId,
            }),
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.valid
        ) {
          setError(
            data.error ??
              "May error. Subukang muli."
          );

          return;
        }

        const entry: GuessEntry = {
          ...data.entry,
          id: crypto.randomUUID(),
        };

        setGuesses((prev) =>
          [entry, ...prev].sort(
            (a, b) =>
              a.rank - b.rank
          )
        );

        setInput("");

        if (data.correct) {
          setWon(true);

          playSound("win");

          if (liveRegionRef.current) {
            liveRegionRef.current.textContent =
              "Tama! Nahulaan mo ang Salita ng Araw!";
          }
        } else {
          if (entry.rank <= 100) {
            playSound("close");
          } else {
            playSound("miss");
          }

          if (liveRegionRef.current) {
            liveRegionRef.current.textContent =
              `Ranggo ${entry.rank}`;
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          "Hindi makonekta sa server. Subukang muli."
        );
      } finally {
        setLoading(false);

        inputRef.current?.focus();
      }
    },
    [
      input,
      botToken,
      loading,
      won,
      idToken,
      playSound,
      userId,
    ]
  );

  return (
    <div
      style={{ fontSize }}
      className="flex flex-col gap-6 max-w-xl mx-auto"
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          placeholder="Isulat ang salita..."
          maxLength={64}
          className="flex-1 px-4 py-3 rounded-xl border"
        />

        <button
          onClick={handleSubmit}
          disabled={
            loading || !botToken
          }
          className="px-5 py-3 rounded-xl"
        >
          {loading
            ? "..."
            : "Hula"}
        </button>
      </div>

      <MicroCaptcha
        onVerified={setBotToken}
      />

      {error && (
        <p
          role="alert"
          className="text-sm text-red-500"
        >
          {error}
        </p>
      )}

      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {won && (
        <div className="rounded-xl p-5 text-center">
          <p className="text-xl">
            🎉 Nahulaan mo ang
            Salita ng Araw!
          </p>

          <p className="text-sm mt-1">
            {guesses.length} na
            hula ang ginamit mo
          </p>
        </div>
      )}

      <GuessHistoryList
        guesses={guesses}
      />
    </div>
  );
}
