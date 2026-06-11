import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

import Header from "./Header";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { signOutUser } from "../../../test/mocks/astro-actions";

function authAs(user: object | null) {
  (onAuthStateChanged as any).mockImplementation((_auth: any, cb: Function) => {
    cb(user);
    return () => {};
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authAs(null);
  (signOut as any).mockResolvedValue(undefined);
  signOutUser.mockResolvedValue({ data: { success: true }, error: null });
  vi.stubGlobal("location", { href: "" });
  document.documentElement.removeAttribute("data-theme");
});

describe("Header — unauthenticated", () => {
  it("renders the nav links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Tools" })).toHaveAttribute("href", "/#tools");
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/#how-it-works");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/#pricing");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/#faq");
  });

  it("shows Log in and Sign up CTAs", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
  });

  it("does not show Dashboard or Log out", () => {
    render(<Header />);
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  it("toggles theme from light to dark on button click", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("th-theme")).toBe("dark");
  });

  it("toggles theme from dark to light on button click", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("th-theme")).toBe("light");
  });
});

describe("Header — authenticated", () => {
  beforeEach(() => {
    authAs({ uid: "user-1", email: "user@test.com" });
  });

  it("shows Dashboard and Buy credits links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Buy credits" })).toHaveAttribute("href", "/buy-credits");
  });

  it("shows a Log out button instead of Log in", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });

  it("calls signOutUser and signOut then redirects to / on logout", async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => expect(signOutUser).toHaveBeenCalled());
    expect(signOut).toHaveBeenCalled();
    expect(window.location.href).toBe("/");
  });

  it("does not redirect when signOutUser returns success=false", async () => {
    signOutUser.mockResolvedValue({ data: { success: false }, error: "Session error" });
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => expect(signOutUser).toHaveBeenCalled());
    expect(signOut).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });
});
