import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockSignIn, mockGetToken, mockGetIdToken } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockGetToken: vi.fn().mockResolvedValue("captcha-token"),
  mockGetIdToken: vi.fn().mockResolvedValue("id-token"),
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: mockSignIn,
}));

vi.mock("../../../utils", () => ({
  useRecaptcha: () => ({ getToken: mockGetToken }),
}));

vi.mock("../../../utils/lib/analytics", () => ({
  logEvent: vi.fn(),
  setUserId: vi.fn(),
}));

import SigninForm from "./SigninForm";
import { verifyUser, migrateFile } from "../../../test/mocks/astro-actions";

const mockSessionStorage = { getItem: vi.fn(() => null), removeItem: vi.fn(), setItem: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockResolvedValue("captcha-token");
  mockSignIn.mockResolvedValue({ user: { uid: "uid-1", getIdToken: mockGetIdToken } });
  verifyUser.mockResolvedValue({ data: { redirected: true, url: "/dashboard" }, error: null });
  migrateFile.mockResolvedValue({ data: { success: true }, error: null });
  mockSessionStorage.getItem.mockReturnValue(null);
  vi.stubGlobal("sessionStorage", mockSessionStorage);
  vi.stubGlobal("location", { assign: vi.fn(), href: "" } as any);
});

describe("SigninForm", () => {
  it("renders email input, password input, and submit button", () => {
    render(<SigninForm />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("shows a captcha error when getToken returns null", async () => {
    mockGetToken.mockResolvedValue(null);
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Captcha verification failed/i),
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("calls signInWithEmailAndPassword with email and password", async () => {
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith(expect.anything(), "user@test.com", "secret"),
    );
  });

  it("calls actions.user.verifyUser with the id token and captcha token", async () => {
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() =>
      expect(verifyUser).toHaveBeenCalledWith({ idToken: "id-token", captchaToken: "captcha-token" }),
    );
  });

  it("navigates when verifyUser returns redirected=true", async () => {
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => expect(globalThis.location.assign).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error when signInWithEmailAndPassword throws", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "bad@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to sign in/i),
    );
  });

  // ── Pending claim token migration ─────────────────────────────────────────

  it("does not call migrateFile when sessionStorage has no pending token", async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => expect(globalThis.location.assign).toHaveBeenCalled());
    expect(migrateFile).not.toHaveBeenCalled();
  });

  it("calls migrateFile with the pending claim token before redirecting", async () => {
    mockSessionStorage.getItem.mockReturnValue("claim-token-abc");
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => expect(migrateFile).toHaveBeenCalledWith({ claimToken: "claim-token-abc" }));
  });

  it("removes the claim token from sessionStorage after calling migrateFile", async () => {
    mockSessionStorage.getItem.mockReturnValue("claim-token-abc");
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => expect(mockSessionStorage.removeItem).toHaveBeenCalledWith("pendingClaimToken"));
  });

  it("still redirects to dashboard even when migrateFile throws", async () => {
    mockSessionStorage.getItem.mockReturnValue("claim-token-abc");
    migrateFile.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<SigninForm />);
    await user.type(screen.getByLabelText("Email address"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => expect(globalThis.location.assign).toHaveBeenCalledWith("/dashboard"));
  });
});
