// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post, Source } from "@/lib/catalog";
import { SourceView } from "./source-view";

const MOCK_SOURCE: Source = {
  slug: "ai-hero",
  sectionSlug: "courses",
  name: "AI Hero",
  externalUrl: "https://aihero.dev",
  author: "Matt Pocock",
  description: "Curso sobre IA em produção.",
};

const MOCK_SOURCE_WITH_STATUS: Source = {
  ...MOCK_SOURCE,
  studyStatus: "ongoing",
};

const MOCK_POSTS: Post[] = [
  {
    slug: "primeiras-impressoes",
    sectionSlug: "courses",
    sourceSlug: "ai-hero",
    title: "Primeiras impressões",
    date: "2026-06-01",
    status: "published",
    tags: ["ai"],
    summary: "Resumo do primeiro módulo.",
    body: "# Conteúdo",
  },
  {
    slug: "janela-de-contexto",
    sectionSlug: "courses",
    sourceSlug: "ai-hero",
    title: "Janela de contexto",
    date: "2026-06-05",
    status: "published",
    tags: ["ai"],
    summary: "Sobre a janela de contexto dos LLMs.",
    body: "# Contexto",
  },
];

describe("SourceView", () => {
  it("renders the source name as heading", () => {
    render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(screen.getByRole("heading", { name: "AI Hero" })).toBeInTheDocument();
  });

  it("renders the author name", () => {
    render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(screen.getByText(/Matt Pocock/)).toBeInTheDocument();
  });

  it("renders a note-row for each post", () => {
    const { container } = render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(container.querySelectorAll(".note-row")).toHaveLength(2);
  });

  it("each note-row links to the correct post path", () => {
    render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(screen.getByRole("link", { name: /Primeiras impressões/ })).toHaveAttribute(
      "href",
      "/courses/ai-hero/primeiras-impressoes",
    );
    expect(screen.getByRole("link", { name: /Janela de contexto/ })).toHaveAttribute(
      "href",
      "/courses/ai-hero/janela-de-contexto",
    );
  });

  it("shows numbered index for each note", () => {
    const { container } = render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    const indices = container.querySelectorAll(".note-idx");
    expect(indices).toHaveLength(2);
    expect(indices[0]).toHaveTextContent("01");
    expect(indices[1]).toHaveTextContent("02");
  });

  it("renders kicker with breadcrumb link to section", () => {
    render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    const link = screen.getByRole("link", { name: "Cursos" });
    expect(link).toHaveAttribute("href", "/courses");
  });

  it("renders NOTAS DO CURSO colhead before the list", () => {
    const { container } = render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(container.querySelector(".colhead")).toHaveTextContent("NOTAS DO CURSO");
  });

  it("renders metaline meta with post count", () => {
    const { container } = render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    const metaline = container.querySelector(".metaline.meta");
    expect(metaline?.textContent).toMatch(/2 notas/);
  });

  it("renders studyStatus chip when ongoing", () => {
    render(
      <SourceView
        source={MOCK_SOURCE_WITH_STATUS}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(document.querySelector(".status-chip")).toHaveTextContent("em andamento");
  });

  it("does not render studyStatus chip when absent", () => {
    render(
      <SourceView
        source={MOCK_SOURCE}
        posts={MOCK_POSTS}
        sectionSlug="courses"
        sectionTitle="Cursos"
      />,
    );
    expect(document.querySelector(".status-chip")).toBeNull();
  });
});
