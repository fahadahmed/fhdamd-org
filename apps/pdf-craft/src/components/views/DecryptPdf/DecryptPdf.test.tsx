import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignInAnonymously = vi.fn();
vi.mock("firebase/auth", () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import DecryptPdf from "./DecryptPdf";
import { checkCredits, decryptPdf, createAnonymousSession } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

const mockAnonUser = { uid: "anon-uid", isAnonymous: true, getIdToken: vi.fn().mockResolvedValue("anon-token") };

const pdfFile = new File(["pdf"], "locked.pdf", { type: "application/pdf" });

function selectFile(file = pdfFile) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  decryptPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/dec.pdf" } } });
  createAnonymousSession.mockResolvedValue({ data: { success: true }, error: null });
  mockSignInAnonymously.mockResolvedValue({ user: mockAnonUser });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("DecryptPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<DecryptPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows file name and password form after file selection", async () => {
    render(<DecryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByText("locked.pdf")).toBeInTheDocument());
    expect(screen.getByLabelText("PDF password")).toBeInTheDocument();
  });

  it("removes the file when the remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText("locked.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove file/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows the download link after a successful decrypt", async () => {
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download unlocked PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/dec.pdf",
      ),
    );
  });

  it("shows an error callout when decryptPdf returns a failure", async () => {
    decryptPdf.mockResolvedValue({ data: { success: false, error: "Wrong password." } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "wrong");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Wrong password."),
    );
  });

  // ── Anonymous user flow ───────────────────────────────────────────────────

  it("shows an error when signInAnonymously throws", async () => {
    (auth as any).currentUser = null;
    mockSignInAnonymously.mockRejectedValue(new Error("Auth failed"));
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("shows an error when createAnonymousSession returns failure", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockResolvedValue({ data: { success: false }, error: null });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("shows an error when createAnonymousSession throws", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
  });

  it("calls signInAnonymously and createAnonymousSession when currentUser is null", async () => {
    (auth as any).currentUser = null;
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    expect(createAnonymousSession).toHaveBeenCalledWith({ idToken: "anon-token" });
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("shows pending UI with sign-up/sign-in buttons when decryptPdf returns a claimToken", async () => {
    decryptPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-xyz" } } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("stores claimToken and navigates to /signup on 'Sign up to download'", async () => {
    decryptPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-xyz" } } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Sign up to download/i }));
    await user.click(screen.getByRole("button", { name: /Sign up to download/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-xyz");
    expect(globalThis.location.href).toBe("/signup");
  });

  it("stores claimToken and navigates to /signin on 'Already have an account?'", async () => {
    decryptPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-xyz" } } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Already have an account/i }));
    await user.click(screen.getByRole("button", { name: /Already have an account/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-xyz");
    expect(globalThis.location.href).toBe("/signin");
  });
});
