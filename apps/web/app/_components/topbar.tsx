"use client";

import { AccountNav } from "./account-nav";

const GITHUB_URL = "https://github.com/ThiagoPanini/epistemix";

function LiveDot() {
  return <span className="live-dot" aria-hidden="true" />;
}

function FormattedDate() {
  const now = new Date();
  const formatted = now.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return <span>{formatted}</span>;
}

interface TopbarProps {
  onPaletteOpen?: () => void;
}

export function Topbar({ onPaletteOpen }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-in wrap">
        <span className="brand">epistemix</span>
        <LiveDot />
        <span className="date-hide">
          <FormattedDate />
        </span>
        <span className="spacer" aria-hidden="true" />
        <button
          type="button"
          className="kbtn"
          aria-label="Abrir paleta de comandos"
          onClick={onPaletteOpen}
        >
          <span>Buscar</span>
          <kbd>⌘K</kbd>
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="kbtn gh-hide"
          aria-label="GitHub"
        >
          GITHUB
        </a>
        <AccountNav />
      </div>
    </header>
  );
}
