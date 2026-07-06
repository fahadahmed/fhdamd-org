import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// pdf.js and pdfRender need full browser APIs — mock at the module level
vi.mock("../../../utils/lib/pdfRender", () => ({
  getPdfPageCount: vi.fn().mockResolvedValue(10),
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
  (getPdfPageCount as any).mockResolvedValue(10);
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("SplitPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows page count and two range inputs after file selection", async () => {
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByText(/10 pages/i)).toBeInTheDocument());
    // One range row = two spinbutton inputs (from + to)
    expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
  });

  it("shows an error when getPdfPageCount rejects (encrypted PDF)", async () => {
    (getPdfPageCount as any).mockRejectedValue(new Error("encrypted"));
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/valid, unencrypted/i),
    );
  });

  it("adds a range row when 'Add range' is clicked", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Add range/i }));
    await user.click(screen.getByRole("button", { name: /Add range/i }));
    // 2 ranges × 2 inputs each
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(4));
  });

  it("removes a range row when 'Remove' is clicked", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Add range/i }));
    await user.click(screen.getByRole("button", { name: /Add range/i }));
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(4));
    await user.click(screen.getAllByRole("button", { name: /Remove/i })[0]);
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(2));
  });

  it("shows a bounds-validation error when from > to", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(2));
    const [fromInput, toInput] = screen.getAllByRole("spinbutton");
    await user.clear(fromInput);
    await user.type(fromInput, "8");
    await user.clear(toInput);
    await user.type(toInput, "3");
    await user.click(screen.getByRole("button", { name: /Split PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/invalid/i),
    );
    expect(splitPdf).not.toHaveBeenCalled();
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(2));
    await user.click(screen.getByRole("button", { name: /Split PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
    expect(splitPdf).not.toHaveBeenCalled();
  });

  it("shows a PDF download link after a successful single-range split", async () => {
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(2));
    await user.click(screen.getByRole("button", { name: /Split PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/split.pdf",
      ),
    );
  });

  it("shows a zip download link after a successful multi-range split", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/split.zip" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Add range/i }));
    await user.click(screen.getByRole("button", { name: /Add range/i }));
    await user.click(screen.getByRole("button", { name: /Split PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download zip/i })).toHaveAttribute(
        "href",
        "https://cdn.test/split.zip",
      ),
    );
  });

  it("shows an error when splitPdf returns a failure", async () => {
    splitPdf.mockResolvedValue({ data: { success: false, error: "This PDF is password-protected." } });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(2));
    await user.click(screen.getByRole("button", { name: /Split PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/password-protected/i),
    );
  });

  it("shows pending UI with sign-up/sign-in buttons when splitPdf returns a claimToken", async () => {
    splitPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-split" } }, error: null });
    const user = userEvent.setup();
    render(<SplitPdf creditCost={2} />);
    selectFile();
    await waitFor(() => expect(screen.getAllByRole("spinbutton")).toHaveLength(2));
    await user.click(screen.getByRole("button", { name: /Split PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });
});
