import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/lib/pdfRender", () => ({
  getPdfPageCount: vi.fn().mockResolvedValue(5),
  renderPdfPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import SplitPdf from "./SplitPdf";
import { splitPdf, checkCredits } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";
import { getPdfPageCount } from "../../../utils/lib/pdfRender";

const pdfFile = new File(["pdf"], "doc.pdf", { type: "application/pdf" });

function selectFile(file = pdfFile) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

/** Wait for the editor panel (post-file-selection) to appear */
async function openEditor() {
  selectFile();
  await waitFor(() => screen.getByRole("button", { name: /Split PDF/i }));
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  splitPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/split.pdf" } }, error: null });
  (getPdfPageCount as any).mockResolvedValue(5);
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

// ── Upload state ───────────────────────────────────────────────────────────────

describe("SplitPdf — upload state", () => {
  it("renders the file dropzone initially", () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows an error when getPdfPageCount rejects", async () => {
    (getPdfPageCount as any).mockRejectedValue(new Error("encrypted"));
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/valid, unencrypted/i));
  });
});

// ── Editor — split mode ────────────────────────────────────────────────────────

describe("SplitPdf — split mode", () => {
  it("shows Split PDF and Extract Pages tabs after file selection", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    expect(screen.getByRole("button", { name: /Extract Pages/i })).toBeInTheDocument();
    expect(screen.getByText(/Click between pages to mark a split point/i)).toBeInTheDocument();
  });

  it("Split button is disabled when no split points are set", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    expect(screen.getByRole("button", { name: /^Split$/i })).toBeDisabled();
  });

  it("'Split every page' enables Split and shows part count", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Split$/i })).not.toBeDisabled());
    expect(screen.getByText(/5 files/i)).toBeInTheDocument();
  });

  it("'Clear split points' appears once all splits are set", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await waitFor(() => expect(screen.getByText(/Clear split points/i)).toBeInTheDocument());
  });

  it("clicking a SplitGap toggles a split point", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    const gaps = screen.getAllByRole("button", { name: /Add split point/i });
    await user.click(gaps[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: /^Split$/i })).not.toBeDisabled());
    // Clicking the same gap again removes it
    await user.click(screen.getAllByRole("button", { name: /Remove split point/i })[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: /^Split$/i })).toBeDisabled());
  });

  it("Reset clears all split points and disables Split", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Split$/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /^Reset$/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Split$/i })).toBeDisabled());
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i));
    expect(splitPdf).not.toHaveBeenCalled();
  });

  it("shows download link after a successful split", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    // 1 split point on 5 pages → 2 ranges → zip output
    await user.click(screen.getAllByRole("button", { name: /Add split point/i })[0]);
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download/i })).toHaveAttribute("href", "https://cdn.test/split.pdf"),
    );
  });

  it("shows zip download link when result has multiple ranges", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/split.zip" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => expect(screen.getByRole("link", { name: /Download zip/i })).toBeInTheDocument());
  });

  it("shows an error when splitPdf returns a failure message", async () => {
    splitPdf.mockResolvedValue({ data: { success: false, error: "This PDF is password-protected." } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/password-protected/i));
  });

  it("'Start over' button resets to the dropzone after a successful download", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download/i }));
    await user.click(screen.getByRole("button", { name: /Start over/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });
});

// ── Editor — pending / anonymous flow ─────────────────────────────────────────

describe("SplitPdf — anonymous pending UI", () => {
  it("shows sign-up and sign-in buttons when splitPdf returns a claimToken", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-split" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("'Sign up to download' stores the token and navigates to /signup", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-split" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => screen.getByRole("button", { name: /Sign up to download/i }));
    await user.click(screen.getByRole("button", { name: /Sign up to download/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-split");
    expect(globalThis.location.href).toBe("/signup");
  });

  it("'Already have an account?' stores the token and navigates to /signin", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-split" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} />);
    await openEditor();
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() => screen.getByRole("button", { name: /Already have an account/i }));
    await user.click(screen.getByRole("button", { name: /Already have an account/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-split");
    expect(globalThis.location.href).toBe("/signin");
  });
});

// ── Editor — toolbar and page operations ──────────────────────────────────────

describe("SplitPdf — toolbar", () => {
  it("toolbar buttons (Move/Rotate/Duplicate/Delete) are disabled by default", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    expect(screen.getByRole("button", { name: /Move left/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Rotate/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Duplicate/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeDisabled();
  });

  it("selecting a page enables Rotate, Duplicate, Delete toolbar buttons", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Page 1/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Rotate/i })).not.toBeDisabled());
    expect(screen.getByRole("button", { name: /Duplicate/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete/i })).not.toBeDisabled();
  });

  it("Move right is enabled when a non-last page is selected", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Page 1/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Move right/i })).not.toBeDisabled());
  });

  it("Move left is disabled for the first page", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Page 1/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Move left/i })).toBeDisabled());
  });

  it("clicking Rotate on a selected page does not crash", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Page 1/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Rotate/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Rotate/i }));
    // Component should still be stable
    expect(screen.getByRole("button", { name: /^Split$/i })).toBeInTheDocument();
  });

  it("clicking Delete on a selected page removes it from the strip", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Page 5/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Delete/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Delete/i }));
    await waitFor(() => expect(screen.queryByRole("button", { name: /Page 5/i })).not.toBeInTheDocument());
  });

  it("clicking Duplicate on a selected page adds a new page", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    const initialPages = screen.getAllByRole("button", { name: /Page \d+/i });
    await user.click(initialPages[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: /Duplicate/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Duplicate/i }));
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /Page \d+/i })).toHaveLength(initialPages.length + 1),
    );
  });
});

// ── Editor — extract mode ─────────────────────────────────────────────────────

describe("SplitPdf — extract mode", () => {
  it("switching to Extract Pages mode shows the extract instruction", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Extract Pages/i }));
    await waitFor(() => expect(screen.getByText(/Select the pages you want to extract/i)).toBeInTheDocument());
  });

  it("Extract button is disabled until a page is selected", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Extract Pages/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Extract$/i })).toBeDisabled());
  });

  it("selecting a page in extract mode enables Extract button", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Extract Pages/i }));
    await waitFor(() => screen.getByRole("button", { name: /^Extract$/i }));
    await user.click(screen.getByRole("button", { name: /Page 1/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Extract$/i })).not.toBeDisabled());
    expect(screen.getByText(/1 page selected/i)).toBeInTheDocument();
  });

  it("'Select all' selects all pages in extract mode", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Extract Pages/i }));
    await waitFor(() => screen.getByText(/Select all/i));
    await user.click(screen.getByText(/Select all/i));
    await waitFor(() => expect(screen.getByText(/5 pages selected/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /^Extract$/i })).not.toBeDisabled();
  });

  it("executes extract action with the selected pages as ranges", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/extract.pdf" } } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    await openEditor();
    await user.click(screen.getByRole("button", { name: /Extract Pages/i }));
    await waitFor(() => screen.getByRole("button", { name: /^Extract$/i }));
    await user.click(screen.getByRole("button", { name: /Page 2/i }));
    await user.click(screen.getByRole("button", { name: /^Extract$/i }));
    await waitFor(() => expect(splitPdf).toHaveBeenCalledWith(expect.any(FormData)));
    const formData: FormData = splitPdf.mock.calls[0][0];
    const ranges = JSON.parse(formData.get("ranges") as string);
    expect(ranges).toEqual([{ from: 2, to: 2 }]);
  });
});
