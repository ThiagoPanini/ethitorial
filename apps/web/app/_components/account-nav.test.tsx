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
import { AccountNav } from "./account-nav";

const mockUseSession = vi.mocked(useSession);

describe("AccountNav", () => {
  it("renders 'ENTRAR' link when user is not logged in", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(<AccountNav />);
    const link = screen.getByRole("link", { name: /entrar/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/auth/sign-in");
  });

  it("renders nothing while session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null,
      refetch: vi.fn(),
    } as never);

    const { container } = render(<AccountNav />);
    expect(container.firstChild).toBeNull();
  });

  it("renders user avatar button when logged in", () => {
    mockUseSession.mockReturnValue({
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
    } as never);

    render(<AccountNav />);
    const btn = screen.getByRole("button", { name: /conta/i });
    expect(btn).toBeInTheDocument();
  });
});
