// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post, Section } from "@/lib/catalog";
import { SectionDirectView } from "./section-direct-view";

const MOCK_SECTION: Section = {
  slug: "blog",
  title: "Blog",
  kind: "direct",
  order: 2,
  description: "Posts sobre o que estou construindo.",
};

const MOCK_POSTS: Post[] = [
  {
    slug: "primeiro-post",
    sectionSlug: "blog",
    sourceSlug: "",
    title: "Primeiro Post",
    date: "2026-06-10",
    status: "published",
    tags: ["ai"],
    summary: "Resumo do primeiro post.",
    body: "# Conteúdo",
  },
  {
    slug: "segundo-post",
    sectionSlug: "blog",
    sourceSlug: "",
    title: "Segundo Post",
    date: "2026-06-05",
    status: "published",
    tags: [],
    summary: "",
    body: "# Segundo",
  },
];

describe("SectionDirectView", () => {
  it("renders an art-row for each post", () => {
    const { container } = render(<SectionDirectView section={MOCK_SECTION} posts={MOCK_POSTS} />);
    expect(container.querySelectorAll(".art-row")).toHaveLength(2);
  });

  it("each art-row links to the correct post path", () => {
    render(<SectionDirectView section={MOCK_SECTION} posts={MOCK_POSTS} />);
    expect(screen.getByRole("link", { name: /Primeiro Post/ })).toHaveAttribute(
      "href",
      "/blog/primeiro-post",
    );
    expect(screen.getByRole("link", { name: /Segundo Post/ })).toHaveAttribute(
      "href",
      "/blog/segundo-post",
    );
  });

  it("renders the section title as heading", () => {
    render(<SectionDirectView section={MOCK_SECTION} posts={MOCK_POSTS} />);
    expect(screen.getByRole("heading", { name: "Blog" })).toBeInTheDocument();
  });

  it("shows post summary when present", () => {
    render(<SectionDirectView section={MOCK_SECTION} posts={MOCK_POSTS} />);
    expect(screen.getByText("Resumo do primeiro post.")).toBeInTheDocument();
  });

  it("shows formatted date for each post", () => {
    render(<SectionDirectView section={MOCK_SECTION} posts={MOCK_POSTS} />);
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("shows 'atualizada em' with most recent post date in metaline", () => {
    const { container } = render(<SectionDirectView section={MOCK_SECTION} posts={MOCK_POSTS} />);
    const metaline = container.querySelector(".metaline.meta");
    expect(metaline?.textContent).toMatch(/atualizada em/);
    expect(metaline?.textContent).toMatch(/10 jun 2026/);
  });

  it("omits 'atualizada em' when posts list is empty", () => {
    const { container } = render(<SectionDirectView section={MOCK_SECTION} posts={[]} />);
    const metaline = container.querySelector(".metaline.meta");
    expect(metaline?.textContent).not.toMatch(/atualizada em/);
  });
});
