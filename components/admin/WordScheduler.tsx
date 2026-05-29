// src/components/admin/WordScheduler.tsx
"use client";
import { useState, useEffect } from "react";

interface ScheduledWord {
  date: string;
  wordHash: string;
  totalPlayers: number;
  createdAt?: string;
}

export function WordScheduler() {
  const [words, setWords] = useState<ScheduledWord[]>([]);
  const [form, setForm] = useState({ word: "", date: "" });
  const [msg, setMsg] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/words", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWords(d.words ?? []))
      .catch(() => {});
  }, []);

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/words", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: `Na-schedule ang salita para sa ${form.date}.`, type: "ok" });
        setForm({ word: "", date: "" });
        setWords((prev) => [
          { date: form.date, wordHash: data.wordHash, totalPlayers: 0 },
          ...prev,
        ]);
      } else {
        setMsg({ text: data.error ?? "May error.", type: "err" });
      }
    } catch {
      setMsg({ text: "Hindi makonekta.", type: "err" });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-cream)",
    padding: "10px 14px",
    borderRadius: 10,
    outline: "none",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    width: "100%",
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <h2 className="font-display text-xl mb-5" style={{ color: "var(--text-cream)" }}>
        Pag-iskedyul ng Salita ng Araw
      </h2>

      {/* Schedule form */}
      <form onSubmit={handleSchedule} className="flex flex-col gap-3 max-w-sm mb-8">
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            Salita (plaintext — hindi itatago)
          </label>
          <input
            value={form.word}
            onChange={(e) => setForm((f) => ({ ...f, word: e.target.value.toLowerCase() }))}
            placeholder="hal. diwa"
            style={inputStyle}
            required
            maxLength={64}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            Petsa (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            style={inputStyle}
            required
          />
        </div>

        {msg && (
          <p
            className="text-sm px-3 py-2 rounded-lg"
            style={{
              color: msg.type === "ok" ? "#4A8E5D" : "#AE433A",
              background: msg.type === "ok" ? "rgba(74,142,93,0.1)" : "rgba(174,67,58,0.1)",
            }}
          >
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="py-2.5 rounded-xl font-display text-sm transition-all"
          style={{
            background: loading ? "rgba(201,168,76,0.2)" : "#C9A84C",
            color: loading ? "#C9A84C" : "#1A120B",
            fontWeight: 700,
          }}
        >
          {loading ? "Sine-schedule..." : "I-schedule"}
        </button>
      </form>

      {/* Scheduled words table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Petsa", "Hash (partial)", "Mga Manlalaro", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left pb-2 pr-4"
                  style={{ color: "var(--text-muted)", fontWeight: 400 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {words.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center" style={{ color: "var(--text-muted)" }}>
                  Walang naka-schedule na salita.
                </td>
              </tr>
            )}
            {words.map((w) => {
              const today = new Date().toISOString().split("T")[0];
              const isPast = w.date < today;
              const isToday = w.date === today;
              return (
                <tr
                  key={w.date}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="py-3 pr-4 font-display" style={{ color: "var(--text-cream)" }}>
                    {w.date}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {w.wordHash.slice(0, 14)}…
                  </td>
                  <td className="py-3 pr-4" style={{ color: "var(--text-cream)" }}>
                    {w.totalPlayers}
                  </td>
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: isToday
                          ? "rgba(74,142,93,0.2)"
                          : isPast
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(249,168,38,0.15)",
                        color: isToday ? "#4A8E5D" : isPast ? "var(--text-muted)" : "#F9A826",
                      }}
                    >
                      {isToday ? "Ngayon" : isPast ? "Tapos na" : "Darating"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}