// src/app/login/page.tsx
import { LoginForm } from "../../components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — SalinDiwa Admin",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <LoginForm redirectTo={searchParams.next ?? "/admin"} />
    </main>
  );
}