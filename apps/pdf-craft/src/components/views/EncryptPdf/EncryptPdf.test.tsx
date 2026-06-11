import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import EncryptPdf from "./EncryptPdf";
import { checkCredits, encryptPdf } from "../../../test/mocks/astro-actions";

const pdfFile = new File(["pdf"], "doc.pdf", { type: "application/pdf" });

function selectFile(file = pdfFile) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  encryptPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/enc.pdf" } } });
});

describe("EncryptPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<EncryptPdf creditCost={2} />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows the file name and password form after a file is selected", async () => {
    render(<EncryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());
    expect(screen.getByLabelText("Open password")).toBeInTheDocument();
  });

  it("hides the dropzone after a file is selected", async () => {
    render(<EncryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => expect(screen.queryByTestId("file-input")).not.toBeInTheDocument());
  });

  it("removes the file when the remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByText("doc.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove file/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  it("shows an insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<EncryptPdf creditCost={2} />);
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
    render(<EncryptPdf creditCost={2} />);
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
    render(<EncryptPdf creditCost={2} />);
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
    render(<EncryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("Open password"));
    await user.type(screen.getByLabelText("Open password"), "secret");
    await user.click(screen.getByRole("button", { name: /Protect PDF/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download protected PDF/i }));
    await user.click(screen.getByRole("button", { name: /Protect another PDF/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });
});
