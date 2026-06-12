"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Presentation } from "@/lib/catalog";
import { Icon, Wordmark } from "./primitives";

export function PresentationPlayer({
  onExit,
  presentation,
}: {
  onExit: () => void;
  presentation: Presentation;
}) {
  const [index, setIndex] = useState(0);
  const total = presentation.slides.length;
  const storageKey = `epx:player:${presentation.slug}`;
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? Number.parseInt(stored, 10) : 0;
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < total) setIndex(parsed);
    window.dispatchEvent(new CustomEvent("epx:player-state", { detail: { open: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent("epx:player-state", { detail: { open: false } }));
    };
  }, [storageKey, total]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(index));
  }, [index, storageKey]);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => Math.min(Math.max(current + delta, 0), total - 1));
    },
    [total],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onExit]);

  const slide = presentation.slides[index];

  return (
    <div aria-label={presentation.title} className="player" ref={stageRef} role="dialog">
      <div className="player-top">
        <i style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <div className="player-stage">
        <article className="slide">
          <span className="kicker mono">{slide.eyebrow}</span>
          <h2>{index === 0 ? <Wordmark /> : slide.title}</h2>
          {slide.body && <p className="sub">{slide.body}</p>}
          {slide.bullets.length > 0 && (
            <ul>
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </article>
      </div>
      <div className="player-bar">
        <button aria-label="Fechar player" onClick={onExit} type="button">
          <Icon name="x" size={14} />
        </button>
        <span className="player-title">{presentation.title}</span>
        <span className="spacer" aria-hidden="true" />
        <span className="player-count">
          {index + 1} / {total}
        </span>
        <span className="nav">
          <button
            aria-label="Slide anterior"
            disabled={index === 0}
            onClick={() => go(-1)}
            type="button"
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          <button
            aria-label="Próximo slide"
            disabled={index === total - 1}
            onClick={() => go(1)}
            type="button"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </span>
      </div>
    </div>
  );
}
