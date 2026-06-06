"use client";

import { Icon } from "./primitives";

export function OpenPlayerButton() {
  return (
    <button
      className="btn btn-primary"
      onClick={() => window.dispatchEvent(new Event("epx:open-player"))}
      type="button"
    >
      <Icon name="present" size={14} /> Abrir player demo
    </button>
  );
}
