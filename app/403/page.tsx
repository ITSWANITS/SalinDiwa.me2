// src/app/403/page.tsx

export default function ForbiddenPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <p
        className="font-display text-8xl"
        style={{ color: "rgba(174,67,58,0.4)" }}
      >
        403
      </p>

      <h1
        className="font-display text-2xl"
        style={{ color: "var(--text-cream)" }}
      >
        Walang pahintulot
      </h1>

      <p
        className="text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Kailangan mo ng admin access para makita ang pahinang ito.
      </p>

      <a
        href="/"
        className="mt-4 px-5 py-2.5 rounded-xl text-sm transition-all"
        style={{
          background: "#C9A84C",
          color: "#1A120B",
          fontWeight: 700,
        }}
      >
        Bumalik sa Laro
      </a>
    </main>
  );
}