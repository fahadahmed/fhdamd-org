import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignInAnonymously = vi.fn();
vi.mock("firebase/auth", () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import MultiPdfUploader from "./MultiPdfUploader";
import { checkCredits, mergePdfs, createAnonymousSession } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

function makeFile(name: string) {
  return new File(["pdf"], name, { type: "application/pdf" });
}

function addFiles(files: File[]) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: files, configurable: true });
  fireEvent.change(input);
}

const mockAnonUser = { uid: "anon-uid", isAnonymous: true, getIdToken: vi.fn().mockResolvedValue("anon-id-token") };

beforeEach(() => {
  vi.clearAllMocks();
  // Default: real signed-in user (skips anonymous flow)
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  mergePdfs.mockResolvedValue({ data: { data: { fileUrl: "https://cdn.test/merged.pdf" } }, error: null });
  createAnonymousSession.mockResolvedValue({ data: { success: true }, error: null });
  mockSignInAnonymously.mockResolvedValue({ user: mockAnonUser });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("MultiPdfUploader", () => {
  it("renders the file dropzone initially", () => {
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows uploaded file names after adding files", async () => {
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => {
      expect(screen.getByText("a.pdf")).toBeInTheDocument();
      expect(screen.getByText("b.pdf")).toBeInTheDocument();
    });
  });

  it("shows the max-files callout and hides the dropzone at 5 files", async () => {
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([1, 2, 3, 4, 5].map((n) => makeFile(`file${n}.pdf`)));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Maximum of 5 files reached/i),
    );
    expect(screen.queryByTestId("file-input")).not.toBeInTheDocument();
  });

  it("removes a file when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove a\.pdf/i }));
    await waitFor(() => expect(screen.queryByText("a.pdf")).not.toBeInTheDocument());
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
  });

  it("disables the merge button when fewer than 2 files are added", async () => {
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([makeFile("only.pdf")]);
    await waitFor(() => screen.getByText("only.pdf"));
    expect(screen.getByRole("button", { name: /Merge PDFs/i })).toBeDisabled();
  });

  it("shows insufficient credits error", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows download link after a successful merge", async () => {
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download merged PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/merged.pdf",
      ),
    );
  });

  it("resets to the dropzone when Merge more PDFs is clicked", async () => {
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download merged PDF/i }));
    await user.click(screen.getByRole("button", { name: /Merge more PDFs/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  // ── Anonymous user flow ───────────────────────────────────────────────────

  it("calls signInAnonymously and createAnonymousSession when currentUser is null", async () => {
    (auth as any).currentUser = null;
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    await waitFor(() => expect(createAnonymousSession).toHaveBeenCalledWith({ idToken: "anon-id-token" }));
  });

  it("does not call checkCredits for an anonymous user", async () => {
    (auth as any).currentUser = null;
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() => expect(mergePdfs).toHaveBeenCalled());
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("shows pending UI with sign-up and sign-in buttons when mergePdfs returns a claimToken", async () => {
    mergePdfs.mockResolvedValue({ data: { data: { claimToken: "tok-abc" } }, error: null });
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("stores the claimToken in sessionStorage and navigates to /signup when 'Sign up to download' is clicked", async () => {
    mergePdfs.mockResolvedValue({ data: { data: { claimToken: "tok-abc" } }, error: null });
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() => screen.getByRole("button", { name: /Sign up to download/i }));
    await user.click(screen.getByRole("button", { name: /Sign up to download/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-abc");
    expect(globalThis.location.href).toBe("/signup");
  });

  it("stores the claimToken and navigates to /signin when 'Already have an account?' is clicked", async () => {
    mergePdfs.mockResolvedValue({ data: { data: { claimToken: "tok-abc" } }, error: null });
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() => screen.getByRole("button", { name: /Already have an account/i }));
    await user.click(screen.getByRole("button", { name: /Already have an account/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-abc");
    expect(globalThis.location.href).toBe("/signin");
  });

  it("shows an error when createAnonymousSession fails", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockResolvedValue({ data: { success: false, error: "Session error" }, error: null });
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
    expect(mergePdfs).not.toHaveBeenCalled();
  });

  it("shows an error when createAnonymousSession throws", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
    expect(mergePdfs).not.toHaveBeenCalled();
  });

  it("shows an error when signInAnonymously throws", async () => {
    (auth as any).currentUser = null;
    mockSignInAnonymously.mockRejectedValue(new Error("Auth failed"));
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} isAuthenticated={false} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
  });
});
