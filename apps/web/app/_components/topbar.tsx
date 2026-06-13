"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountNav } from "./account-nav";

const GITHUB_URL = "https://github.com/ThiagoPanini/epistemix";

const DAYS = [
  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO",
];
const MONTHS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

function LiveDate() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const d = new Date();
    setLabel(`${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }, []);
  return label ? <span className="date-hide">{label}</span> : null;
}

interface TopbarProps {
  onPaletteOpen?: () => void;
}

export function Topbar({ onPaletteOpen }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar-in wrap">
        <Link
          href="/"
          className="brand"
          style={{ visibility: pathname === "/" ? "hidden" : "visible" }}
        >
          epistemix
        </Link>
        <LiveDate />
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
