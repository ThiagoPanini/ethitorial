"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/app/_components/auth-layout";
import { AuthSocial } from "@/app/_components/auth-social";
import { signUp } from "@/lib/auth-client";

const PASSWORD_MIN = 8;

function mapSignUpError(message?: string): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("exist") || m.includes("unique") || m.includes("already")) {
    return "Esse e-mail ou nome de usuário já está em uso.";
  }
  if (m.includes("password")) {
    return `A senha precisa ter ao menos ${PASSWORD_MIN} caracteres.`;
  }
  return "Não foi possível criar a conta. Confira os dados e tente novamente.";
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);

  const busy = pending || socialPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < PASSWORD_MIN) {
      setError(`A senha precisa ter ao menos ${PASSWORD_MIN} caracteres.`);
      return;
    }

    setPending(true);
    try {
      const result = await signUp.email({ name, email, password, username });
      if (result.error) {
        setError(mapSignUpError(result.error.message));
      } else {
        // emailAndPassword sign-up auto-creates a session; land on the home view.
        router.push("/");
      }
    } catch {
      setError("Erro ao criar a conta. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Criar conta</h1>

      <AuthSocial formPending={pending} onError={setError} onPendingChange={setSocialPending} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          type="text"
          className="auth-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          disabled={busy}
        />
        <label className="auth-label" htmlFor="username">
          Nome de usuário
        </label>
        <input
          id="username"
          type="text"
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          pattern="[a-zA-Z0-9_\-]+"
          title="Apenas letras, números, hífen e underscore."
          disabled={busy}
        />
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
          minLength={PASSWORD_MIN}
          autoComplete="new-password"
          disabled={busy}
        />
        <p className="auth-hint">Ao menos {PASSWORD_MIN} caracteres.</p>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>
          {pending ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="auth-alt">
        Já tem conta?{" "}
        <Link href="/auth/sign-in" className="auth-alt-link">
          Entrar →
        </Link>
      </p>
    </AuthLayout>
  );
}
