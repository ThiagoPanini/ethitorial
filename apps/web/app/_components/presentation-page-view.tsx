"use client";

import { useState } from "react";
import type { Presentation } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { PresentationPlayer } from "./presentation-player";
import { Icon } from "./primitives";

export function PresentationPageView({ presentation }: { presentation: Presentation }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="page wrap">
        <div className="page-head">
          <span className="kicker mono">Palestra · Presentation</span>
          <h1>{presentation.title}</h1>
          <p className="desc">{presentation.summary}</p>
          <p className="meta mono">
            {formatDate(presentation.date)} · {presentation.slides.length} slides
          </p>
        </div>
        <button className="btn-read" onClick={() => setOpen(true)} type="button">
          <Icon name="present" size={14} /> Abrir slides
        </button>
      </div>
      {open && <PresentationPlayer onExit={() => setOpen(false)} presentation={presentation} />}
    </>
  );
}
