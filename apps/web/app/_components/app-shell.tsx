"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteModel } from "@/lib/site/model";
import { CommandPalette } from "./command-palette";
import { PresentationPlayer } from "./presentation-player";
import { BrandMark, Icon, Wordmark } from "./primitives";

export interface Breadcrumb {
  href?: string;
  label: string;
}

export function AppShell({
  activeSection,
  children,
  crumbs,
  model,
  showFooter = true,
}: {
  activeSection?: string | null;
  children: React.ReactNode;
  crumbs: Breadcrumb[];
  model: SiteModel;
  showFooter?: boolean;
}) {
  const [drawer, setDrawer] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const onEntrar = useCallback(() => {
    fireToast("Entrar chega na Fase 2 — por ora, tudo é público e read-only.");
  }, [fireToast]);

  const openPlayer = useCallback(() => setPlayerOpen(true), []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!playerOpen) setPaletteOpen((open) => !open);
      }
    }

    function onOpenPlayer() {
      setPlayerOpen(true);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("epx:open-player", onOpenPlayer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("epx:open-player", onOpenPlayer);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [playerOpen]);

  return (
    <>
      <div className={`app${drawer ? " drawer-open" : ""}`}>
        <button
          aria-label="Fechar menu"
          className="scrim"
          onClick={() => setDrawer(false)}
          type="button"
        />
        <Sidebar
          activeSection={activeSection}
          model={model}
          onClose={() => setDrawer(false)}
          onNavigate={() => setDrawer(false)}
        />
        <div className="main">
          <Header
            crumbs={crumbs}
            onEntrar={onEntrar}
            onMenu={() => setDrawer(true)}
            onSearch={() => setPaletteOpen(true)}
          />
          <main className="content">
            {children}
            {showFooter && <FooterMin model={model} />}
          </main>
        </div>
      </div>

      {paletteOpen && (
        <CommandPalette
          model={model}
          onClose={() => setPaletteOpen(false)}
          onOpenPlayer={openPlayer}
        />
      )}
      {playerOpen && <PresentationPlayer onExit={() => setPlayerOpen(false)} />}
      <Toast message={toast} />
    </>
  );
}

function Sidebar({
  activeSection,
  model,
  onClose,
  onNavigate,
}: {
  activeSection?: string | null;
  model: SiteModel;
  onClose: () => void;
  onNavigate: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <button aria-label="Fechar menu" className="menu-btn" onClick={onClose} type="button">
          <Icon name="x" size={15} />
        </button>
        <BrandMark />
        <Link aria-label="epistemix home" className="wordmark-link" href="/" onClick={onNavigate}>
          <Wordmark />
        </Link>
      </div>

      <div className="sidebar-scroll">
        <div className="nav-label">Sections</div>
        <nav className="nav-list">
          {model.sections.map((section) => {
            const active = activeSection === section.slug;
            const count = section.ready
              ? model.sources.filter((source) => source.sectionSlug === section.slug).length
              : null;

            return (
              <Link
                className={`nav-item${active ? " active" : ""}`}
                href={`/${section.slug}`}
                key={section.slug}
                onClick={onNavigate}
              >
                <span className="nav-ic">
                  <Icon name={section.icon} size={16} />
                </span>
                <span className="nav-name">{section.title}</span>
                {!section.ready && <span className="soon-tag">soon</span>}
                {count !== null && <span className="nav-count">{count}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-foot">
        <a className="foot-link" href={model.repoUrl} rel="noreferrer" target="_blank">
          <Icon name="github" size={15} />
          <span>Repositório OSS</span>
          <span className="foot-link-trail">
            <Icon name="arrowUpRight" size={13} />
          </span>
        </a>
        <Link className="foot-link" href="/about" onClick={onNavigate}>
          <Icon name="info" size={15} />
          <span>Sobre o epistemix</span>
        </Link>
      </div>
    </aside>
  );
}

function Header({
  crumbs,
  onEntrar,
  onMenu,
  onSearch,
}: {
  crumbs: Breadcrumb[];
  onEntrar: () => void;
  onMenu: () => void;
  onSearch: () => void;
}) {
  return (
    <header className="header">
      <button aria-label="Abrir menu" className="menu-btn" onClick={onMenu} type="button">
        <Icon name="menu" size={16} />
      </button>
      <div className="crumbs">
        {crumbs.map((crumb, index) => (
          <span className="crumb-wrap" key={crumb.href ?? crumb.label}>
            {index > 0 && <span className="sep">/</span>}
            {crumb.href && index !== crumbs.length - 1 ? (
              <Link className="crumb" href={crumb.href}>
                {crumb.label}
              </Link>
            ) : (
              <span className={`crumb${index === crumbs.length - 1 ? " crumb-cur" : ""}`}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="header-spacer" />
      <button aria-label="Buscar" className="search-trigger" onClick={onSearch} type="button">
        <Icon name="search" size={15} />
        <span className="st-label">Buscar...</span>
        <span className="kbd">⌘K</span>
      </button>
      <button
        className="btn btn-ghost"
        onClick={onEntrar}
        title="Em breve — autenticação chega na Fase 2"
        type="button"
      >
        <Icon name="lock" size={14} />
        Entrar
      </button>
    </header>
  );
}

function FooterMin({ model }: { model: SiteModel }) {
  return (
    <footer className="footer-min">
      <a href={model.repoUrl} rel="noreferrer" target="_blank">
        github.com/ThiagoPanini/epistemix
      </a>
      <span className="dot">·</span>
      <Link href="/about">Sobre</Link>
      <span className="dot">·</span>
      <span>© 2026 epistemix</span>
      <span className="footer-phase">Fase 1 · read-only</span>
    </footer>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="toast">
      <Icon name="lock" size={14} />
      {message}
    </div>
  );
}
