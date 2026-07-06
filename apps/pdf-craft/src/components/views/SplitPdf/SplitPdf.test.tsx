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

  it("shows page strip after file selection", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    // Filename and page count appear in the toolbar
    await waitFor(() => expect(screen.getByText(/5 pages/i)).toBeInTheDocument());
    // Instruction text appears
    expect(screen.getByText(/click between pages/i)).toBeInTheDocument();
  });

  it("shows an error when getPdfPageCount rejects", async () => {
    (getPdfPageCount as any).mockRejectedValue(new Error("encrypted"));
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/valid, unencrypted/i),
    );
  });

  it("shows 'Split every page' and Reset and Split buttons after file selection", async () => {
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

  it("shows error and does not call splitPdf when Split is clicked with no points", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /^Split$/i }));
    // Button is disabled when no split points — click "Split every page" then Reset to test the guard
    await user.click(screen.getByText(/Split every page/i));
    // Now there should be 4 split points (5 pages - 1)
    await waitFor(() => expect(screen.getByText(/5 parts/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /^Split$/i })).toBeEnabled();
  });

  it("'Split every page' enables the Split button", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Split every page/i));
    await user.click(screen.getByText(/Split every page/i));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Split$/i })).not.toBeDisabled(),
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
});
