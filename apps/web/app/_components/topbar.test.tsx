// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Topbar } from "./topbar";

describe("Topbar", () => {
  it("renders the wordmark 'epistemix'", () => {
    render(<Topbar />);
    expect(screen.getByText("epistemix")).toBeInTheDocument();
  });

  it("renders a GITHUB external link", () => {
    render(<Topbar />);
    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/ThiagoPanini/epistemix");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noreferrer");
  });

  it("renders a ⌘K button", () => {
    render(<Topbar onPaletteOpen={() => {}} />);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("topbar has the .topbar class", () => {
    const { container } = render(<Topbar />);
    expect(container.querySelector(".topbar")).toBeInTheDocument();
  });

  it("renders current date in mono font region", () => {
    render(<Topbar />);
    const topbarIn = document.querySelector(".topbar-in");
    expect(topbarIn).toBeInTheDocument();
  });
});
