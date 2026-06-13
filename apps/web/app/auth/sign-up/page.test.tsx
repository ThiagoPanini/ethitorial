// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/auth-client", () => ({
  signUp: { email: vi.fn() },
  signIn: { social: vi.fn() },
}));

import { signUp } from "@/lib/auth-client";
import SignUpPage from "./page";

const mockSignUp = vi.mocked(signUp.email);

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValidForm() {
  fill(/^nome$/i, "Thiago Panini");
  fill(/nome de usuário/i, "thiago");
  fill(/e-mail/i, "t@t.com");
  fill(/senha/i, "supersecret");
}

describe("SignUpPage", () => {
  beforeEach(() => {
    push.mockReset();
    mockSignUp.mockReset();
  });

  it("renders name, username, email and password fields", () => {
    render(<SignUpPage />);
    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("links back to sign-in", () => {
    render(<SignUpPage />);
    expect(screen.getByRole("link", { name: /entrar/i })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("submits name, email, password and username then redirects home", async () => {
    mockSignUp.mockResolvedValue({ error: null } as never);
    render(<SignUpPage />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: "Thiago Panini",
        email: "t@t.com",
        password: "supersecret",
        username: "thiago",
      });
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  });

  it("blocks short passwords before calling the API", () => {
    render(<SignUpPage />);
    fill(/^nome$/i, "Thiago");
    fill(/nome de usuário/i, "thiago");
    fill(/e-mail/i, "t@t.com");
    fill(/senha/i, "short");
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(mockSignUp).not.toHaveBeenCalled();
    expect(screen.getByText(/ao menos 8 caracteres/i)).toBeInTheDocument();
  });

  it("shows a friendly error when the username/email already exists", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "User already exists" } } as never);
    render(<SignUpPage />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => expect(screen.getByText(/já está em uso/i)).toBeInTheDocument());
    expect(push).not.toHaveBeenCalled();
  });
});
