import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import DecryptPdf from "./DecryptPdf";
import { checkCredits, decryptPdf } from "../../../test/mocks/astro-actions";

const pdfFile = new File(["pdf"], "locked.pdf", { type: "application/pdf" });

function selectFile(file = pdfFile) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  decryptPdf.mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/dec.pdf" } } });
});

describe("DecryptPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<DecryptPdf creditCost={2} />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows file name and password form after file selection", async () => {
    render(<DecryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => expect(screen.getByText("locked.pdf")).toBeInTheDocument());
    expect(screen.getByLabelText("PDF password")).toBeInTheDocument();
  });

  it("removes the file when the remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByText("locked.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove file/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });

  it("shows insufficient credits error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows the download link after a successful decrypt", async () => {
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "secret");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download unlocked PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/dec.pdf",
      ),
    );
  });

  it("shows an error callout when decryptPdf returns a failure", async () => {
    decryptPdf.mockResolvedValue({ data: { success: false, error: "Wrong password." } });
    const user = userEvent.setup();
    render(<DecryptPdf creditCost={2} />);
    selectFile();
    await waitFor(() => screen.getByLabelText("PDF password"));
    await user.type(screen.getByLabelText("PDF password"), "wrong");
    await user.click(screen.getByRole("button", { name: /Unlock PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Wrong password."),
    );
  });
});
