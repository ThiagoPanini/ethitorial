// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Topbar } from "./topbar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/blog"),
}));

describe("Topbar", () => {
  it("renders the wordmark 'epistemix'", () => {
    render(<Topbar />);
    expect(screen.getByText("epistemix")).toBeInTheDocument();
  });

  it("wordmark is a link to /", () => {
    render(<Topbar />);
    const brand = screen.getByRole("link", { name: "epistemix" });
    expect(brand).toHaveAttribute("href", "/");
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

  it("renders .date-hide element with current date", () => {
    render(<Topbar />);
    expect(document.querySelector(".date-hide")).toBeInTheDocument();
  });

  it("brand is visible when not on home", () => {
    const { container } = render(<Topbar />);
    const brand = container.querySelector(".brand") as HTMLElement;
    expect(brand?.style.visibility).toBe("visible");
  });
});
