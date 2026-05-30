// src/app/page.tsx
import { GameBoard } from "@/components/GameBoard";
import { BadgeRenderer } from "@/components/BadgeRenderer";

export default function HomePage() {
  const today = new Date().toLocaleDateString("fil-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="min-h-screen py-10 px-4" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="text-center mb-10">
        <h1
          className="font-display text-5xl mb-2 tracking-tight"
          style={{
            color: "#C9A84C",
            textShadow: "0 0 40px rgba(201,168,76,0.3)",
          }}
        >
          SalinDiwa
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {today}
        </p>
        <p className="mt-2 text-base" style={{ color: "var(--text-muted)" }}>
          Hulaan ang <strong style={{ color: "var(--text-cream)" }}>Salita ng Araw</strong>.
          Ang mas mababang numero, mas malapit ka.
        </p>
      </header>

      {/* Game */}
      <GameBoard />

      {/* Footer ad slot */}
      <footer className="mt-12 max-w-xl mx-auto">
        <div
          className="rounded-xl flex items-center justify-center text-xs"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.07)",
            height: 90,
            color: "var(--text-muted)",
          }}
          aria-label="Patalastas"
        >
          Patalastas — 728×90
        </div>
      </footer>
    </main>
  );
}

