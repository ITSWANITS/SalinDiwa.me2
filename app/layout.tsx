// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalinDiwa.me — Salita ng Araw",
  description: "Hulaan ang Salita ng Araw sa Filipino. Isang laro ng diwa at salita.",
  openGraph: {
    title: "SalinDiwa.me",
    description: "Ang Filipino na laro ng salita at diwa.",
    locale: "fil_PH",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fil">
      <body className="antialiased">{children}</body>
    </html>
  );
}
