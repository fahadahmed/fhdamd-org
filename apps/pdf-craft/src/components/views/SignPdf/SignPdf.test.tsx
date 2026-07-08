import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/lib/pdfRender", () => ({
  getPdfPageCount: vi.fn().mockResolvedValue(3),
  getPdfPageDimensions: vi.fn().mockResolvedValue([
    { width: 595, height: 842 },
    { width: 595, height: 842 },
    { width: 595, height: 842 },
  ]),
  renderPdfPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

// Mock SignatureModal so we can control when it fires onConfirm
vi.mock("./SignatureModal", () => ({
  default: ({ isOpen, onClose, onConfirm }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="signature-modal">
        <button onClick={onClose}>Close modal</button>
        <button onClick={() => onConfirm({ dataUrl: "data:image/png;base64,sig", source: "typed", signerName: "Fahad" })}>
          Confirm signature
        </button>
      </div>
    );
  },
}));

// Mock SignaturePlacement similarly
vi.mock("./SignaturePlacement", () => ({
  default: ({ onConfirm, onBack }: any) => (
    <div data-testid="signature-placement">
      <button onClick={onBack}>Back</button>
      <button onClick={() => onConfirm([{ page: 1, x: 100, y: 200, width: 160, height: 60 }])}>
        Place Signature
      </button>
    </div>
  ),
}));

import SignPdf from "./SignPdf";
import { signPdf, checkCredits } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

const pdfFile = new File(["pdf"], "doc.pdf", { type: "application/pdf" });

function selectFile() {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [pdfFile], configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "user-1", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  signPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/signed.pdf" } }, error: null });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("SignPdf orchestrator", () => {
  it("renders the file dropzone initially", () => {
    render(<SignPdf creditCost={3} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows the SignatureModal after a file is selected", async () => {
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByTestId("signature-modal")).toBeInTheDocument());
  });

  it("returns to upload step when modal is closed", async () => {
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Close modal/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  it("shows SignaturePlacement after signature is confirmed in modal", async () => {
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => expect(screen.getByTestId("signature-placement")).toBeInTheDocument());
  });

  it("goes back to modal when Back is clicked in placement", async () => {
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => screen.getByTestId("signature-placement"));
    await user.click(screen.getByRole("button", { name: /Back/i }));
    await waitFor(() => expect(screen.getByTestId("signature-modal")).toBeInTheDocument());
  });

  it("shows download link after successful sign", async () => {
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => screen.getByTestId("signature-placement"));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download signed PDF/i })).toHaveAttribute(
        "href", "https://cdn.test/signed.pdf",
      ),
    );
  });

  it("shows pending UI when signPdf returns a claimToken", async () => {
    signPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-sign" } }, error: null });
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => screen.getByTestId("signature-placement"));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("shows error when signPdf returns failure", async () => {
    signPdf.mockResolvedValue({ data: { success: false, error: "This PDF is password-protected." } });
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => screen.getByTestId("signature-placement"));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/password-protected/i),
    );
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => screen.getByTestId("signature-placement"));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
    expect(signPdf).not.toHaveBeenCalled();
  });

  it("'Sign another PDF' resets to upload step", async () => {
    const user = userEvent.setup();
    render(<SignPdf creditCost={3} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByTestId("signature-modal"));
    await user.click(screen.getByRole("button", { name: /Confirm signature/i }));
    await waitFor(() => screen.getByTestId("signature-placement"));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download signed PDF/i }));
    await user.click(screen.getByRole("button", { name: /Sign another PDF/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });
});
