import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignInAnonymously = vi.fn();
vi.mock("firebase/auth", () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import EncryptPdf from "./EncryptPdf";
import { checkCredits, encryptPdf, createAnonymousSession } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

const mockAnonUser = { uid: "anon-uid", isAnonymous: true, getIdToken: vi.fn().mockResolvedValue("anon-token") };

const pdfFile = new File(["pdf"], "doc.pdf", { type: "application/pdf" });

function selectFile(file = pdfFile) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  encryptPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/enc.pdf" } } });
  createAnonymousSession.mockResolvedValue({ data: { success: true }, error: null });
  mockSignInAnonymously.mockResolvedValue({ user: mockAnonUser });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("EncryptPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows the file name and password form after a file is selected", async () => {
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());
    expect(screen.getByLabelText("Open password")).toBeInTheDocument();
  });

  it("hides the dropzone after a file is selected", async () => {
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.queryByTestId("file-input")).not.toBeInTheDocument());
  });

  it("removes the file when the remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText("doc.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove file/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  it("shows an insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows the download link after a successful encrypt", async () => {
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download protected PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/enc.pdf",
      ),
    );
  });

  it("shows an error callout when encryptPdf returns a failure", async () => {
    encryptPdf.mockResolvedValue({ data: { success: false, error: "Encryption failed." } });
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Encryption failed."),
    );
  });

  it("resets to the dropzone when Protect another PDF is clicked", async () => {
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download protected PDF/i }));
    await user.click(screen.getByRole("button", { name: /Protect another PDF/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  // ── Anonymous user flow ───────────────────────────────────────────────────

  it("calls signInAnonymously when currentUser is null and skips checkCredits", async () => {
    (auth as any).currentUser = null;
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("shows pending UI when encryptPdf returns a claimToken", async () => {
    encryptPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-enc" } } });
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("stores claimToken and navigates to /signup on 'Sign up to download'", async () => {
    encryptPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-enc" } } });
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Sign up to download/i }));
    await user.click(screen.getByRole("button", { name: /Sign up to download/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-enc");
    expect(globalThis.location.href).toBe("/signup");
  });

  it("stores claimToken and navigates to /signin on 'Already have an account?'", async () => {
    encryptPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-enc" } } });
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} isAuthenticated={false} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Already have an account/i }));
    await user.click(screen.getByRole("button", { name: /Already have an account/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-enc");
    expect(globalThis.location.href).toBe("/signin");
  });
});
