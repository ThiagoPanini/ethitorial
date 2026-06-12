// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

import { useSession } from "@/lib/auth-client";
import { CommentSection } from "./comment-section";

const mockUseSession = vi.mocked(useSession);

const ANON_SESSION = {
  data: null,
  isPending: false,
  error: null,
  refetch: vi.fn(),
};

const AUTHED_SESSION = {
  data: {
    user: {
      id: "u1",
      name: "Thiago Panini",
      email: "t@t.com",
      username: "thiago",
      role: "admin",
      image: null,
    },
    session: {},
  },
  isPending: false,
  error: null,
  refetch: vi.fn(),
};

describe("CommentSection", () => {
  it("renders the DISCUSSÃO heading", () => {
    mockUseSession.mockReturnValue(ANON_SESSION as never);
    render(<CommentSection artifactId="courses/src/post" initialComments={[]} />);
    expect(screen.getByText(/discussão/i)).toBeInTheDocument();
  });

  it("shows login CTA when user is not authenticated", () => {
    mockUseSession.mockReturnValue(ANON_SESSION as never);
    render(<CommentSection artifactId="courses/src/post" initialComments={[]} />);
    expect(screen.getByRole("link", { name: /entre para comentar/i })).toBeInTheDocument();
  });

  it("shows textarea when user is authenticated", () => {
    mockUseSession.mockReturnValue(AUTHED_SESSION as never);
    render(<CommentSection artifactId="courses/src/post" initialComments={[]} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders existing comments", () => {
    mockUseSession.mockReturnValue(ANON_SESSION as never);
    const comments = [
      {
        id: "c1",
        artifact_id: "courses/src/post",
        body: "Great post!",
        created_at: "2026-06-12T10:00:00Z",
        user_id: "u2",
        user_name: "João",
        username: "joao",
        image: null,
        is_author: false,
      },
    ];
    render(<CommentSection artifactId="courses/src/post" initialComments={comments} />);
    expect(screen.getByText("Great post!")).toBeInTheDocument();
    expect(screen.getByText("joao")).toBeInTheDocument();
  });

  it("shows AUTOR badge for admin comments", () => {
    mockUseSession.mockReturnValue(ANON_SESSION as never);
    const comments = [
      {
        id: "c1",
        artifact_id: "courses/src/post",
        body: "Admin says hi",
        created_at: "2026-06-12T10:00:00Z",
        user_id: "u1",
        user_name: "Thiago",
        username: "thiago",
        image: null,
        is_author: true,
      },
    ];
    render(<CommentSection artifactId="courses/src/post" initialComments={comments} />);
    expect(screen.getByText(/autor/i)).toBeInTheDocument();
  });
});
