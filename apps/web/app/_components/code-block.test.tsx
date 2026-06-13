// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  it("renders children inside a pre element", () => {
    const { container } = render(
      <CodeBlock>
        <code>const x = 1;</code>
      </CodeBlock>,
    );
    expect(container.querySelector("pre")).toBeInTheDocument();
    expect(container.querySelector("code")).toBeInTheDocument();
  });

  it("renders a copy button", () => {
    render(
      <CodeBlock>
        <code>const x = 1;</code>
      </CodeBlock>,
    );
    expect(screen.getByRole("button", { name: /cop/i })).toBeInTheDocument();
  });

  it("copy button copies code text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    });
    render(
      <CodeBlock>
        <code>const answer = 42;</code>
      </CodeBlock>,
    );
    fireEvent.click(screen.getByRole("button", { name: /cop/i }));
    expect(writeText).toHaveBeenCalledWith("const answer = 42;");
  });

  it("CodeBlock is a server component (no 'use client' directive)", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const { dirname, join } = await import("node:path");
    const dir = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(dir, "code-block.tsx"), "utf8");
    // First non-empty line must not be the "use client" directive
    const firstLine = src.split("\n").find((l) => l.trim().length > 0) ?? "";
    expect(firstLine.trim()).not.toBe('"use client";');
  });
});
