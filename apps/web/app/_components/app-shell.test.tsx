// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders children content", () => {
    render(
      <AppShell>
        <main>Hello world</main>
      </AppShell>,
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders the topbar with epistemix wordmark", () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    );
    expect(screen.getByText("epistemix")).toBeInTheDocument();
  });

  it("renders the rubrics nav with all 8 sections", () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cursos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Grafo" })).toBeInTheDocument();
  });

  it("renders the footer", () => {
    const { container } = render(
      <AppShell>
        <div />
      </AppShell>,
    );
    expect(container.querySelector(".foot")).toBeInTheDocument();
  });

  it("passes motion attribute to body wrapper", () => {
    const { container } = render(
      <AppShell>
        <div />
      </AppShell>,
    );
    const wrapper = container.querySelector("[data-motion]");
    expect(wrapper).toBeInTheDocument();
  });
});
