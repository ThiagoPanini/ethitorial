"use client";

import { useEffect, useRef, useState } from "react";
import { Rubrics } from "./rubrics";
import { Topbar } from "./topbar";

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in wrap">
        <span>© 2026 epistemix</span>
        <span className="spacer" aria-hidden="true" />
        <a href="https://github.com/ThiagoPanini/epistemix" rel="noreferrer" target="_blank">
          github.com/ThiagoPanini/epistemix
        </a>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  useEffect(() => {
    if (paletteOpen) paletteInputRef.current?.focus();
  }, [paletteOpen]);

  return (
    <div data-motion="on">
      <Topbar onPaletteOpen={() => setPaletteOpen((open) => !open)} />
      <Rubrics />
      <div className="view">{children}</div>
      <Footer />
      {paletteOpen && (
        <div className="scrim" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
          <div className="pal">
            <div className="pal-in">
              <input ref={paletteInputRef} type="text" placeholder="Buscar posts, seções..." />
            </div>
            <div className="pal-empty mono">Em breve — catálogo ainda sendo construído.</div>
            <div className="pal-foot">
              <span>
                <kbd>↵</kbd> abrir
              </span>
              <span>
                <kbd>↑↓</kbd> navegar
              </span>
              <span>
                <kbd>esc</kbd> fechar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
