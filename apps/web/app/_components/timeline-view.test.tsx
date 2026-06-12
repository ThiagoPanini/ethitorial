// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "@/lib/catalog";
import { TimelineView } from "./timeline-view";

const EVENTS: TimelineEvent[] = [
  {
    id: "publication:blog/primeiro-post",
    type: "publication",
    date: "2026-06-10",
    year: "2026",
    label: "Primeiro Post",
    detail: "Blog",
    href: "/blog/primeiro-post",
    hot: true,
  },
  {
    id: "conquest:certifications/aws-saa-c03",
    type: "conquest",
    date: "2025-12-12",
    year: "2025",
    label: "AWS SAA-C03",
    detail: "Certifications",
    href: "/certifications/aws-saa-c03",
    hot: true,
  },
];

describe("TimelineView", () => {
  it("groups timeline events by year", () => {
    render(<TimelineView events={EVENTS} />);

    expect(screen.getByRole("heading", { name: "2026" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2025" })).toBeInTheDocument();
  });

  it("renders each event as a link to its Artifact or Source", () => {
    render(<TimelineView events={EVENTS} />);

    expect(screen.getByRole("link", { name: /Primeiro Post/ })).toHaveAttribute(
      "href",
      "/blog/primeiro-post",
    );
    expect(screen.getByRole("link", { name: /AWS SAA-C03/ })).toHaveAttribute(
      "href",
      "/certifications/aws-saa-c03",
    );
  });

  it("marks hot event types with accent class", () => {
    const { container } = render(<TimelineView events={EVENTS} />);

    expect(container.querySelectorAll(".tl-type.hot")).toHaveLength(2);
  });
});
