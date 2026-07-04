import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockGetToken = vi.fn().mockResolvedValue("captcha-token");
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockLinkWithCredential = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  linkWithCredential: (...args: unknown[]) => mockLinkWithCredential(...args),
  EmailAuthProvider: { credential: vi.fn(() => ({ type: "email" })) },
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
}));

vi.mock("../../../utils", () => ({
  useRecaptcha: () => ({ getToken: mockGetToken }),
}));

vi.mock("../../../utils/lib/analytics", () => ({
  logEvent: vi.fn(),
  setUserId: vi.fn(),
}));

import SignupForm from "./SignupForm";
import { finalizeLinkedUser, migrateFile } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

const mockUser = { uid: "new-uid", isAnonymous: false, getIdToken: async () => "new-id-token" };
const mockAnonUser = { uid: "anon-uid", isAnonymous: true, getIdToken: async () => "anon-id-token" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockResolvedValue("captcha-token");
  // Default: no anonymous session active
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
  mockLinkWithCredential.mockResolvedValue({ user: mockUser });
  mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
  finalizeLinkedUser.mockResolvedValue({ data: { success: true }, error: null });
  migrateFile.mockResolvedValue({ data: { success: true }, error: null });
  vi.stubGlobal("location", { href: "" });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), removeItem: vi.fn(), setItem: vi.fn() });
});

describe("SignupForm", () => {
  it("renders name, email, password inputs and a submit button", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
  });

  it("shows a captcha error when getToken returns null", async () => {
    mockGetToken.mockResolvedValue(null);
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Captcha verification failed/i),
    );
    expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("calls finalizeLinkedUser after creating the account and redirects to /dashboard", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(finalizeLinkedUser).toHaveBeenCalledWith({ idToken: "new-id-token", name: "Jane" }),
    );
    await waitFor(() => expect(globalThis.location.href).toBe("/dashboard"));
  });

  it("shows a weak-password error when Firebase rejects the password", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({ code: "auth/weak-password" });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "abc");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Password must be at least 6 characters/i),
    );
  });

  it("shows an error when finalizeLinkedUser returns success=false", async () => {
    finalizeLinkedUser.mockResolvedValue({ data: { success: false, error: "Failed to set up your account. Please try again." } });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to set up your account/i),
    );
  });

  it("shows email-already-in-use error for duplicate accounts", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({ code: "auth/email-already-in-use" });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/already exists.*sign in/i),
    );
  });

  // ── Anonymous user flows ──────────────────────────────────────────────────

  it("calls linkWithCredential when currentUser is anonymous", async () => {
    (auth as any).currentUser = { ...mockAnonUser };
    mockLinkWithCredential.mockResolvedValue({ user: { ...mockUser, getIdToken: async () => "linked-token" } });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() => expect(mockLinkWithCredential).toHaveBeenCalled());
    expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("redirects to /buy-credits after linking an anonymous account", async () => {
    (auth as any).currentUser = { ...mockAnonUser };
    mockLinkWithCredential.mockResolvedValue({ user: { ...mockUser, getIdToken: async () => "linked-token" } });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() => expect(globalThis.location.href).toBe("/buy-credits"));
  });

  it("falls back to signIn and calls migrateFile when link fails with email-already-in-use", async () => {
    (auth as any).currentUser = { ...mockAnonUser };
    mockLinkWithCredential.mockRejectedValue({ code: "auth/email-already-in-use" });
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: { ...mockUser, getIdToken: async () => "existing-token" } });
    // Simulate sessionStorage has a pending token
    (globalThis.sessionStorage.getItem as any).mockReturnValue("claim-token-abc");
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "existing@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() => expect(mockSignInWithEmailAndPassword).toHaveBeenCalled());
    await waitFor(() => expect(migrateFile).toHaveBeenCalledWith({ claimToken: "claim-token-abc" }));
    await waitFor(() => expect(globalThis.location.href).toBe("/dashboard"));
  });
});
