"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Icon } from "./primitives";

const HAS_GITHUB = process.env.NEXT_PUBLIC_GITHUB_OAUTH === "1";
const HAS_GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_OAUTH === "1";

export const HAS_SOCIAL = HAS_GITHUB || HAS_GOOGLE;

interface AuthSocialProps {
  /** Disabled while the email/password form is submitting. */
  formPending?: boolean;
  onError: (message: string) => void;
  /** Lets the parent disable the email form while a redirect is in flight. */
  onPendingChange?: (pending: boolean) => void;
}

/**
 * Social sign-in buttons (GitHub / Google). OAuth handles both sign-in and
 * sign-up, so the same component is reused on both auth screens. Renders
 * nothing when no provider is configured.
 */
export function AuthSocial({ formPending = false, onError, onPendingChange }: AuthSocialProps) {
  const [pending, setPending] = useState<string | null>(null);

  if (!HAS_SOCIAL) return null;

  async function handleSocial(provider: "github" | "google") {
    setPending(provider);
    onPendingChange?.(true);
    try {
      await signIn.social({ provider, callbackURL: "/" });
    } catch {
      onError(`Erro ao continuar com ${provider}. Tente novamente.`);
      setPending(null);
      onPendingChange?.(false);
    }
  }

  return (
    <div className="auth-social">
      {HAS_GITHUB && (
        <button
          type="button"
          className="auth-social-btn"
          disabled={pending !== null || formPending}
          onClick={() => handleSocial("github")}
        >
          <Icon name="github" size={15} />
          {pending === "github" ? "Redirecionando…" : "Continuar com GitHub"}
        </button>
      )}
      {HAS_GOOGLE && (
        <button
          type="button"
          className="auth-social-btn"
          disabled={pending !== null || formPending}
          onClick={() => handleSocial("google")}
        >
          {pending === "google" ? "Redirecionando…" : "Continuar com Google"}
        </button>
      )}
      <div className="auth-divider">
        <span>ou</span>
      </div>
    </div>
  );
}
