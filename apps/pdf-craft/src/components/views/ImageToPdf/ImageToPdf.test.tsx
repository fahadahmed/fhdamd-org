import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import ImageToPdf from "./ImageToPdf";
import { checkCredits, imageToPdf } from "../../../test/mocks/astro-actions";

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
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  imageToPdf.mockResolvedValue({ data: { data: { fileUrl: "https://cdn.test/output.pdf" } }, error: null });
});

describe("ImageToPdf", () => {
  it("renders the file dropzone initially", () => {
    render(<ImageToPdf creditCost={2} />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows uploaded image names after adding files", async () => {
    render(<ImageToPdf creditCost={2} />);
    addFiles([makeImage("photo1.png"), makeImage("photo2.png")]);
    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
      expect(screen.getByText("photo2.png")).toBeInTheDocument();
    });
  });

  it("shows the max-files callout and hides the dropzone at 10 images", async () => {
    render(<ImageToPdf creditCost={2} />);
    addFiles([...new Array(10)].map((_, i) => makeImage(`img${i}.png`)));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Maximum of 10 images reached/i),
    );
    expect(screen.queryByTestId("file-input")).not.toBeInTheDocument();
  });

  it("removes an image when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} />);
    addFiles([makeImage("photo1.png"), makeImage("photo2.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Remove photo1\.png/i }));
    await waitFor(() => expect(screen.queryByText("photo1.png")).not.toBeInTheDocument());
    expect(screen.getByText("photo2.png")).toBeInTheDocument();
  });

  it("shows insufficient credits error", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows download link after a successful conversion", async () => {
    const user = userEvent.setup();
    render(<ImageToPdf creditCost={2} />);
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
    render(<ImageToPdf creditCost={2} />);
    addFiles([makeImage("photo1.png")]);
    await waitFor(() => screen.getByText("photo1.png"));
    await user.click(screen.getByRole("button", { name: /Convert to PDF/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download PDF/i }));
    await user.click(screen.getByRole("button", { name: /Convert more images/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });
});
