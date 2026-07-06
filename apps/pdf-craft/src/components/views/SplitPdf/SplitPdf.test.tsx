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

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  splitPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/split.pdf" } }, error: null });
  (getPdfPageCount as any).mockResolvedValue(5);
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("SplitPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows the editor UI with Split PDF and Extract Pages tabs after file selection", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByRole("button", { name: /Split PDF/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Extract Pages/i })).toBeInTheDocument();
    expect(screen.getByText(/Click between pages to mark a split point/i)).toBeInTheDocument();
  });

  it("shows an error when getPdfPageCount rejects (encrypted PDF)", async () => {
    (getPdfPageCount as any).mockRejectedValue(new Error("encrypted"));
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/valid, unencrypted/i),
    );
  });

  it("shows 'Split every page', Reset, and Split buttons", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Split$/i })).toBeInTheDocument();
  });

  it("Split button is disabled when no split points are set", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /^Split$/i }));
    expect(screen.getByRole("button", { name: /^Split$/i })).toBeDisabled();
  });

  it("'Split every page' enables the Split button and shows part count", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Split$/i })).not.toBeDisabled(),
    );
    // 5 pages split after all → 5 files
    expect(screen.getByText(/5 files/i)).toBeInTheDocument();
  });

  it("Reset button clears all split points", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Split$/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Reset/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Split$/i })).toBeDisabled(),
    );
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
    expect(splitPdf).not.toHaveBeenCalled();
  });

  it("shows download link after successful split", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download/i })).toHaveAttribute(
        "href", "https://cdn.test/split.pdf",
      ),
    );
  });

  it("shows an error when splitPdf returns a failure", async () => {
    splitPdf.mockResolvedValue({ data: { success: false, error: "This PDF is password-protected." } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/password-protected/i),
    );
  });

  it("shows pending UI when splitPdf returns a claimToken", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-split" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await user.click(screen.getByRole("button", { name: /^Split$/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("switches to Extract Pages mode", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Extract Pages/i }));
    await user.click(screen.getByRole("button", { name: /Extract Pages/i }));
    await waitFor(() =>
      expect(screen.getByText(/Select the pages you want to extract/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /^Extract$/i })).toBeDisabled();
  });
});
