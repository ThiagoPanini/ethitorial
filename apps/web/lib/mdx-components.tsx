import type { ComponentPropsWithoutRef } from "react";

// Tipografia mínima para a prosa MDX dos Posts (sem plugin typography ainda).
// O wrapper <article> já define cor/leading base; aqui só os elementos.
export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-4 text-2xl font-semibold text-neutral-100" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-2 text-xl font-semibold text-neutral-100" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-cyan-400 underline underline-offset-2 transition-colors hover:text-cyan-300"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="ml-5 flex list-disc flex-col gap-2" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="ml-5 flex list-decimal flex-col gap-2" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-neutral-100" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-neutral-800/70 px-1.5 py-0.5 font-mono text-sm text-neutral-200"
      {...props}
    />
  ),
};
