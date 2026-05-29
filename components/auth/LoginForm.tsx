// src/components/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../lib/firebase/client";

interface Props {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * After Firebase sign-in, exchange the ID token for a
   * server-side HttpOnly session cookie via /api/auth/session.
   */
  async function createSession(idToken: string) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session creation failed.");
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      await createSession(idToken);
      router.push(redirectTo);
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/wrong-password": "Mali ang password.",
        "auth/user-not-found": "Hindi nahanap ang user.",
        "auth/too-many-requests": "Sobrang daming pagsubok. Sandali lang.",
      };
      setError(msg[err?.code] ?? "May error sa pag-login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      await createSession(idToken);
      router.push(redirectTo);
    } catch {
      setError("Hindi nagtagumpay ang Google sign-in.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-cream)",
    fontFamily: "var(--font-body)",
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    outline: "none",
    fontSize: 16,
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
      }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <h1
          className="font-display text-3xl"
          style={{ color: "#C9A84C", textShadow: "0 0 24px rgba(201,168,76,0.3)" }}
        >
          SalinDiwa
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Admin Portal
        </p>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            aria-required="true"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm rounded-lg px-3 py-2"
            style={{
              color: "#AE433A",
              background: "rgba(174,67,58,0.1)",
              border: "1px solid rgba(174,67,58,0.2)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-display text-base transition-all"
          style={{
            background: loading ? "rgba(201,168,76,0.3)" : "#C9A84C",
            color: loading ? "#C9A84C" : "#1A120B",
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {loading ? "Pumapasok..." : "Mag-login"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>o</span>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* Google login */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-cream)",
        }}
      >
        <GoogleIcon />
        Mag-login gamit ang Google
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}