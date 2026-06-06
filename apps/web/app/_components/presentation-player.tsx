"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, Wordmark } from "./primitives";

type Slide =
  | {
      eyebrow: string;
      lead: string;
      title: string;
      type: "cover" | "closing";
    }
  | {
      bullets: string[];
      eyebrow: string;
      title: string;
      type: "bullets";
    }
  | {
      eyebrow: string;
      lead: string;
      nodes: { k: string; v: string }[];
      title: string;
      type: "flow";
    }
  | {
      eyebrow: string;
      phases: { items: string[]; n: string; on: boolean }[];
      title: string;
      type: "phases";
    };

const DECK: { slides: Slide[]; title: string } = {
  title: "epistemix — visão & arquitetura",
  slides: [
    {
      eyebrow: "/presentations/visao-arquitetura",
      lead: "Aprender em público — com notas, código e o raciocínio por trás.",
      title: "epistemix",
      type: "cover",
    },
    {
      bullets: [
        "Notas espalhadas em apps, prints e abas que nunca mais abro.",
        "O porquê de cada decisão evapora semanas depois.",
        "Nada disso é público, então não ajuda mais ninguém — nem o eu do futuro.",
      ],
      eyebrow: "01 · o problema",
      title: "O que aprendo se perde",
      type: "bullets",
    },
    {
      eyebrow: "02 · modelo de conteúdo",
      lead: "Sections do tipo with_sources agrupam Sources; do tipo direct guardam Posts soltos.",
      nodes: [
        { k: "Section", v: "Courses, Books..." },
        { k: "Source", v: "AI Hero, Rust Book..." },
        { k: "Post", v: "uma nota MDX" },
      ],
      title: "Section → Source → Post",
      type: "flow",
    },
    {
      bullets: [
        "Quase-preto frio, hierarquia por luminância e hairlines.",
        "Um único acento violeta. Sections se distinguem por ícone, nunca por cor.",
        "Movimento a serviço da leitura: micro-interações contidas, aurora que respira.",
      ],
      eyebrow: "03 · direção visual",
      title: "Dark-first, sabor Linear",
      type: "bullets",
    },
    {
      eyebrow: "04 · honestidade de fase",
      phases: [
        { items: ["Catálogo MDX", "Leitura + TOC", "Busca ⌘K", "Player"], n: "Fase 1", on: true },
        { items: ["Auth", "Votos", "Comentários", "Views"], n: "Fase 2", on: false },
      ],
      title: "O que é real agora",
      type: "phases",
    },
    {
      eyebrow: "fim",
      lead: "github.com/ThiagoPanini/epistemix",
      title: "Construído em público.",
      type: "closing",
    },
  ],
};

export function PresentationPlayer({ onExit }: { onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = DECK.slides.length;

  const wake = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2600);
  }, []);

  const go = useCallback(
    (delta: number) => {
      wake();
      setIndex((current) => Math.min(Math.max(current + delta, 0), total - 1));
    },
    [total, wake],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
        event.preventDefault();
        go(1);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(-1);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onExit]);

  useEffect(() => {
    wake();
    window.addEventListener("mousemove", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [wake]);

  return (
    <div className="player">
      <div className="player-stage">
        <div className="slide-frame">
          <RenderedSlide index={index} slide={DECK.slides[index]} total={total} />
        </div>
      </div>
      <div className={`player-bar${idle ? " idle" : ""}`}>
        <button className="player-exit" onClick={onExit} type="button">
          <Icon name="x" size={14} /> Sair <span className="kbd">esc</span>
        </button>
        <span className="player-divider" />
        <span className="player-title">{DECK.title}</span>
        <div className="player-progress">
          <div className="fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="player-count">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          aria-label="Slide anterior"
          className="player-ctrl"
          disabled={index === 0}
          onClick={() => go(-1)}
          type="button"
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        <button
          aria-label="Próximo slide"
          className="player-ctrl"
          disabled={index === total - 1}
          onClick={() => go(1)}
          type="button"
        >
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </div>
  );
}

function RenderedSlide({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const wm = <span className="slide-wm wordmark">epistemix</span>;
  const num = (
    <span className="slide-num">
      {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  );

  if (slide.type === "cover" || slide.type === "closing") {
    return (
      <div className="slide cover">
        <SlideAuroraMini />
        <div className="slide-main">
          <div className="slide-eyebrow">{slide.eyebrow}</div>
          <h2>{slide.type === "cover" ? <Wordmark /> : slide.title}</h2>
          <p className="s-lead">{slide.lead}</p>
        </div>
        {wm}
        {num}
      </div>
    );
  }

  if (slide.type === "flow") {
    return (
      <div className="slide">
        <div className="slide-eyebrow">{slide.eyebrow}</div>
        <h2>{slide.title}</h2>
        <div className="slide-flow">
          {slide.nodes.map((node, nodeIndex) => (
            <div className="flow-step" key={node.k}>
              {nodeIndex > 0 && (
                <span className="flow-arrow">
                  <Icon name="arrowRight" size={20} />
                </span>
              )}
              <div className="flow-node">
                <div className="fn-k">{node.k}</div>
                <div className="fn-v">{node.v}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="s-lead flow-lead">{slide.lead}</p>
        {wm}
        {num}
      </div>
    );
  }

  if (slide.type === "phases") {
    return (
      <div className="slide">
        <div className="slide-eyebrow">{slide.eyebrow}</div>
        <h2>{slide.title}</h2>
        <div className="slide-flow phase-flow">
          {slide.phases.map((phase) => (
            <div className={`flow-node phase-node${phase.on ? " on" : ""}`} key={phase.n}>
              <div className="fn-k phase-title">
                <span className="phase-dot" />
                {phase.n} {phase.on ? "· no ar" : "· em breve"}
              </div>
              <div className="phase-items">
                {phase.items.map((item) => (
                  <div className="phase-item" key={item}>
                    <Icon name={phase.on ? "check" : "clock"} size={14} /> {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {wm}
        {num}
      </div>
    );
  }

  if (slide.type === "bullets") {
    return (
      <div className="slide">
        <div className="slide-eyebrow">{slide.eyebrow}</div>
        <h2>{slide.title}</h2>
        <ul className="slide-bullets">
          {slide.bullets.map((bullet) => (
            <li key={bullet}>
              <span className="bi" />
              {bullet}
            </li>
          ))}
        </ul>
        {wm}
        {num}
      </div>
    );
  }

  return null;
}

function SlideAuroraMini() {
  return (
    <div aria-hidden="true" className="slide-aurora">
      <div className="blob b1" />
      <div className="blob b2" />
    </div>
  );
}
