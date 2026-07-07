import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import CompressPdf from "./CompressPdf";
import { checkCredits, compressPdf } from "../../../test/mocks/astro-actions";
import { auth } from "../../../firebase/client";

const pdfFile = new File(["pdf-content-here"], "report.pdf", { type: "application/pdf" });

function selectFile(file = pdfFile) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "test-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  compressPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/compressed.pdf", alreadyOptimised: false } } });
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("location", { href: "" });
});

describe("CompressPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<CompressPdf creditCost={2} isAuthenticated />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows the file name and quality presets after file selection", async () => {
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => expect(screen.getByText("report.pdf")).toBeInTheDocument());
    expect(screen.getByText(/Maximum compression/i)).toBeInTheDocument();
    expect(screen.getByText(/Balanced/i)).toBeInTheDocument();
    expect(screen.getByText(/Best quality/i)).toBeInTheDocument();
  });

  it("defaults to Balanced quality preset", async () => {
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Balanced/i));
    const balancedRadio = screen.getByRole("radio", { name: /Balanced/i });
    expect(balancedRadio).toBeChecked();
  });

  it("switches quality preset on click", async () => {
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByText(/Maximum compression/i));
    await user.click(screen.getByRole("radio", { name: /Maximum compression/i }));
    expect(screen.getByRole("radio", { name: /Maximum compression/i })).toBeChecked();
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
    expect(compressPdf).not.toHaveBeenCalled();
  });

  it("shows download link after a successful compression", async () => {
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download compressed PDF/i })).toHaveAttribute(
        "href", "https://cdn.test/compressed.pdf",
      ),
    );
  });

  it("shows the 'already optimised' info callout when alreadyOptimised is true", async () => {
    compressPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/compressed.pdf", alreadyOptimised: true } } });
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/already well-optimised/i),
    );
    // Download link still present
    expect(screen.getByRole("link", { name: /Download compressed PDF/i })).toBeInTheDocument();
  });

  it("shows an error when compressPdf returns a failure", async () => {
    compressPdf.mockResolvedValue({ data: { success: false, error: "Compression failed" } });
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Compression failed/i),
    );
  });

  it("shows pending UI when compressPdf returns a claimToken", async () => {
    compressPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-compress" } } });
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign up to download/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Already have an account/i })).toBeInTheDocument();
  });

  it("stores claimToken and navigates to /signup", async () => {
    compressPdf.mockResolvedValue({ data: { success: true, data: { claimToken: "tok-compress" } } });
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() => screen.getByRole("button", { name: /Sign up to download/i }));
    await user.click(screen.getByRole("button", { name: /Sign up to download/i }));
    expect(globalThis.sessionStorage.setItem).toHaveBeenCalledWith("pendingClaimToken", "tok-compress");
    expect(globalThis.location.href).toBe("/signup");
  });

  it("resets to the dropzone when 'Compress another PDF' is clicked", async () => {
    const user = userEvent.setup();
    render(<CompressPdf creditCost={2} isAuthenticated />);
    selectFile();
    await waitFor(() => screen.getByRole("button", { name: /Compress PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress PDF/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download compressed PDF/i }));
    await user.click(screen.getByRole("button", { name: /Compress another PDF/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });
});
