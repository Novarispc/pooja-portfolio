"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <form onSubmit={onSubmit} className="w-full max-w-sm card p-8">
        <h1 className="font-display italic text-2xl mb-1" style={{ color: "var(--text-head)" }}>
          Admin Sign In
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-mute)" }}>
          Pooja Raviendran Kutty — Portfolio Dashboard
        </p>

        <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-mute)" }}>
          Username
        </label>
        <input
          className="w-full mb-4 px-3 py-2 border rounded text-sm"
          style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-mute)" }}>
          Password
        </label>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded text-sm"
          style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-sm mb-4" style={{ color: "var(--clay)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-xs uppercase tracking-widest text-white disabled:opacity-60"
          style={{ background: "var(--sage)" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </main>
  );
}
