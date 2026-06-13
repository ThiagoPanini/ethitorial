"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/app/_components/auth-layout";
import { AuthSocial } from "@/app/_components/auth-social";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);

  const busy = pending || socialPending;

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
    <AuthLayout>
      <h1 className="auth-title">Entrar</h1>

      <AuthSocial formPending={pending} onError={setError} onPendingChange={setSocialPending} />

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
          disabled={busy}
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
          disabled={busy}
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="auth-alt">
        Ainda não tem conta?{" "}
        <Link href="/auth/sign-up" className="auth-alt-link">
          Criar conta →
        </Link>
      </p>
    </AuthLayout>
  );
}
