"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError("E-mail ou senha incorretos.");
      } else {
        router.push("/");
      }
    } catch {
      setError("Erro ao entrar. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-page wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          epistemix
        </Link>
        <h1 className="auth-title">Entrar</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={pending}
          />
          <label className="auth-label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={pending}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
