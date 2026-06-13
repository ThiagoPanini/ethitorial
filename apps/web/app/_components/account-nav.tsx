"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, hueFromText } from "./primitives";

export function AccountNav() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reserve the slot while the session resolves so the topbar doesn't reflow
  // (and the "ENTRAR" button doesn't pop in a few frames after everything else).
  if (isPending) {
    return <span className="acct-skeleton" aria-hidden="true" />;
  }

  const user = session?.user;

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="kbtn">
        ENTRAR
      </Link>
    );
  }

  async function handleSignOut() {
    await signOut();
    setOpen(false);
  }

  return (
    <div className="acct-wrap" ref={menuRef}>
      <button
        type="button"
        className="acct-btn"
        aria-label="Conta"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar hue={hueFromText(user.name)} name={user.name} src={user.image ?? undefined} />
        <span className="acct-name">{user.username}</span>
      </button>

      {open && (
        <div
          className="acct-menu"
          role="menu"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <Link
            href={`/authors/${user.username}`}
            className="acct-item"
            onClick={() => setOpen(false)}
          >
            Meu perfil
          </Link>
          <button type="button" className="acct-item acct-item--out" onClick={handleSignOut}>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
