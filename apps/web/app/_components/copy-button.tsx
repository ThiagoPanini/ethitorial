"use client";
import { useState } from "react";

export function CopyButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    const text =
      e.currentTarget.closest(".code-wrap")?.querySelector("code")?.textContent ?? "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="copy-btn"
      aria-label={copied ? "Copiado!" : "Copiar código"}
    >
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}
