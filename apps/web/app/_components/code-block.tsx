import type { ComponentPropsWithoutRef } from "react";
import { CopyButton } from "./copy-button";

// Server component: no "use client". Avoids serializing complex children
// (rehype-pretty-code tokens) across the RSC→client boundary.
export function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <div className="code-wrap">
      <CopyButton />
      <pre {...props} />
    </div>
  );
}
