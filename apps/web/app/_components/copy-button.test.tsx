// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

function renderInCodeWrap(codeText = "const x = 1;") {
  const { container } = render(
    <div className="code-wrap">
      <CopyButton />
      <pre>
        <code>{codeText}</code>
      </pre>
    </div>,
  );
  return container;
}

describe("CopyButton", () => {
  it("renders a copy button", () => {
    renderInCodeWrap();
    expect(screen.getByRole("button", { name: /cop/i })).toBeInTheDocument();
  });

  it("copies code text from sibling pre > code on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    });
    renderInCodeWrap("const x = 1;");
    fireEvent.click(screen.getByRole("button", { name: /cop/i }));
    expect(writeText).toHaveBeenCalledWith("const x = 1;");
  });

  it("shows a confirmation after copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    });
    renderInCodeWrap("x");
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/cop/i)).toBeInTheDocument();
  });
});
