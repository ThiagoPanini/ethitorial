// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const MOCK_TAGS = [
  { slug: "ai", label: "IA" },
  { slug: "mlops", label: "MLOps" },
  { slug: "python", label: "Python" },
];

const MOCK_POST = {
  slug: "post-with-ai",
  sectionSlug: "courses",
  sourceSlug: "my-course",
  title: "Post sobre IA",
  date: "2026-06-01",
  status: "published" as const,
  tags: ["ai", "mlops"],
  summary: "Um post sobre IA.",
  body: "# Conteúdo",
};

vi.mock("@/lib/catalog", () => ({
  getCatalog: () => ({
    getTags: () => MOCK_TAGS,
    getSections: () => [
      { slug: "courses", title: "Courses", kind: "with_sources", order: 1, description: "" },
    ],
    getSources: () => [
      {
        slug: "my-course",
        sectionSlug: "courses",
        name: "My Course",
        author: "Autor",
        description: "",
        externalUrl: "https://example.com",
        studyStatus: "ongoing",
      },
    ],
    getPosts: () => [MOCK_POST],
    getDirectPosts: () => [],
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("../../_components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import TagPage from "./page";

describe("TagPage", () => {
  it("renders tag title", async () => {
    const jsx = await TagPage({ params: Promise.resolve({ tag: "ai" }) });
    render(jsx as React.ReactElement);
    expect(screen.getByRole("heading", { name: /#IA/ })).toBeInTheDocument();
  });

  it("renders post with that tag", async () => {
    const jsx = await TagPage({ params: Promise.resolve({ tag: "ai" }) });
    render(jsx as React.ReactElement);
    expect(screen.getByText("Post sobre IA")).toBeInTheDocument();
  });

  it("shows post count", async () => {
    const jsx = await TagPage({ params: Promise.resolve({ tag: "ai" }) });
    render(jsx as React.ReactElement);
    expect(screen.getByText("1 post")).toBeInTheDocument();
  });

  it("shows other tags as links on each post", async () => {
    const jsx = await TagPage({ params: Promise.resolve({ tag: "ai" }) });
    render(jsx as React.ReactElement);
    const mlopsLink = screen.getByRole("link", { name: "MLOps" });
    expect(mlopsLink).toHaveAttribute("href", "/tags/mlops");
  });

  it("shows empty state for tag with no posts", async () => {
    const jsx = await TagPage({ params: Promise.resolve({ tag: "python" }) });
    render(jsx as React.ReactElement);
    expect(screen.getByRole("heading", { name: /Nenhum post/ })).toBeInTheDocument();
  });
});
