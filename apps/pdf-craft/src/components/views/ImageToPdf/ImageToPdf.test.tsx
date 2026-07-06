import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignInAnonymously = vi.fn();
vi.mock("firebase/auth", () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import ImageToPdf from "./ImageToPdf";
import { checkCredits, imageToPdf, createAnonymousSession } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

const mockAnonUser = { uid: "anon-uid", isAnonymous: true, getIdToken: vi.fn().mockResolvedValue("anon-token") };

function makeImage(name: string) {
  return new File(["img"], name, { type: "image/png" });
}

function addFiles(files: File[]) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: files, configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  imageToPdf.mockResolvedValue({ data: { data: { fileUrl: "https://cdn.test/output.pdf" } }, error: null });
  createAnonymousSession.mockResolvedValue({ data: { success: true }, error: null });
  mockSignInAnonymously.mockResolvedValue({ user: mockAnonUser });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("ImageToPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows uploaded image names after adding files", async () => {
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    addFiles([makeImage("photo1.png"), makeImage("photo2.png")]);
    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
      expect(screen.getByText("photo2.png")).toBeInTheDocument();
    });
  });

  it("shows the max-files callout and hides the dropzone at 10 images", async () => {
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    addFiles(Array.from({ length: 10 }, (_, i) => makeImage(`img${i}.png`)));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Maximum of 10 images reached/i),
    );
    expect(screen.queryByTestId("file-input")).not.toBeInTheDocument();
  });

  it("removes an image when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    addFiles([makeImage("photo1.png"), makeImage("photo2.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Remove photo1\.png/i }));
    await waitFor(() => expect(screen.queryByText("photo1.png")).not.toBeInTheDocument());
    expect(screen.getByText("photo2.png")).toBeInTheDocument();
  });

  it("shows insufficient credits error", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows download link after a successful conversion", async () => {
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/output.pdf",
      ),
    );
  });

  it("resets to dropzone when Convert more images is clicked", async () => {
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download PDF/i }));
    await user.click(screen.getByRole("button", { name: /Convert more images/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  // ── Anonymous user flow ───────────────────────────────────────────────────

  it("calls signInAnonymously when currentUser is null and skips checkCredits", async () => {
    (auth as any).currentUser = null;
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated={false} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("shows pending UI when imageToPdf returns a claimToken", async () => {
    imageToPdf.mockResolvedValue({ data: { data: { claimToken: "tok-img" } }, error: null });
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated={false} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("stores claimToken and navigates to /signup on 'Sign up to download'", async () => {
    imageToPdf.mockResolvedValue({ data: { data: { claimToken: "tok-img" } }, error: null });
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated={false} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Sign up to download/i }));
    await user.click(screen.getByRole("button", { name: /Sign up to download/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-img");
    expect(globalThis.location.href).toBe("/signup");
  });

  it("stores claimToken and navigates to /signin on 'Already have an account?'", async () => {
    imageToPdf.mockResolvedValue({ data: { data: { claimToken: "tok-img" } }, error: null });
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated={false} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Already have an account/i }));
    await user.click(screen.getByRole("button", { name: /Already have an account/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-img");
    expect(globalThis.location.href).toBe("/signin");
  });

  it("shows an error when createAnonymousSession returns failure", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockResolvedValue({ data: { success: false }, error: null });
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated={false} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
    expect(imageToPdf).not.toHaveBeenCalled();
  });

  it("shows an error when createAnonymousSession throws", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockRejectedValue(new Error("Network failure"));
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} isAuthenticated={false} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Failed to start session/i),
    );
  });
});
