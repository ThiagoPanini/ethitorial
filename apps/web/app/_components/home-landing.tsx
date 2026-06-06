"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteModel } from "@/lib/site/model";
import { CommandPalette } from "./command-palette";
import { PresentationPlayer } from "./presentation-player";
import { BrandMark, Icon, Wordmark } from "./primitives";
import { Aurora } from "./surfaces";

export function HomeLanding({ model }: { model: SiteModel }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!playerOpen) setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [playerOpen]);

  function onEntrar() {
    fireToast("Entrar chega na Fase 2 — por ora, tudo é público e read-only.");
  }

  return (
    <>
      <main className="home">
        <Aurora />
        <nav className="home-nav">
          <BrandMark />
          <Wordmark />
          <div className="home-nav-spacer" />
          <button className="btn btn-ghost" onClick={() => setPaletteOpen(true)} type="button">
            <Icon name="search" size={14} /> Buscar <span className="kbd">⌘K</span>
          </button>
          <button
            className="btn btn-ghost"
            onClick={onEntrar}
            title="Em breve — Fase 2"
            type="button"
          >
            <Icon name="lock" size={14} /> Entrar
          </button>
        </nav>

        <section className="home-stage">
          <div className="home-badge">
            <span className="pulse" />
            Hub pessoal de aprendizado · open source
          </div>
          <h1>
            Aprender em
            <br />
            <span className="grad">público.</span>
          </h1>
          <p className="tagline">
            Cursos, livros, certificações e ideias — com minhas notas, código e o raciocínio por
            trás.
          </p>
          <div className="home-cta">
            <Link className="btn btn-primary" href="/courses">
              Explorar Courses <Icon name="arrowRight" size={15} />
            </Link>
            <button className="btn btn-ghost" onClick={onEntrar} type="button">
              Entrar
            </button>
          </div>
        </section>

        <footer className="home-foot">
          <a href={model.repoUrl} rel="noreferrer" target="_blank">
            <Icon name="github" size={14} /> ThiagoPanini/epistemix
          </a>
          <span className="spacer" />
          <span className="home-phase">Fase 1 · read-only · WCAG AA</span>
        </footer>
      </main>

      {paletteOpen && (
        <CommandPalette
          model={model}
          onClose={() => setPaletteOpen(false)}
          onOpenPlayer={() => setPlayerOpen(true)}
        />
      )}
      {playerOpen && <PresentationPlayer onExit={() => setPlayerOpen(false)} />}
      {toast && (
        <div className="toast">
          <Icon name="lock" size={14} />
          {toast}
        </div>
      )}
    </>
  );
}
