import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useSensors: () => [],
  useSensor: () => ({}),
  PointerSensor: class PointerSensor {},
  closestCenter: () => null,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, transition: undefined }),
  arrayMove: (arr: any[], from: number, to: number) => {
    const r = [...arr];
    r.splice(to, 0, r.splice(from, 1)[0]);
    return r;
  },
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import MultiPdfUploader from "./MultiPdfUploader";
import { checkCredits, mergePdfs } from "../../../test/mocks/astro-actions";

function makeFile(name: string) {
  return new File(["pdf"], name, { type: "application/pdf" });
}

function addFiles(files: File[]) {
  const input = screen.getByTestId("file-input");
  Object.defineProperty(input, "files", { value: files, configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.clearAllMocks();
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  mergePdfs.mockResolvedValue({ data: { data: { fileUrl: "https://cdn.test/merged.pdf" } }, error: null });
});

describe("MultiPdfUploader", () => {
  it("renders the file dropzone initially", () => {
    render(<MultiPdfUploader creditCost={2} />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows uploaded file names after adding files", async () => {
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => {
      expect(screen.getByText("a.pdf")).toBeInTheDocument();
      expect(screen.getByText("b.pdf")).toBeInTheDocument();
    });
  });

  it("shows the max-files callout and hides the dropzone at 5 files", async () => {
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([1, 2, 3, 4, 5].map((n) => makeFile(`file${n}.pdf`)));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Maximum of 5 files reached/i),
    );
    expect(screen.queryByTestId("file-input")).not.toBeInTheDocument();
  });

  it("removes a file when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove a\.pdf/i }));
    await waitFor(() => expect(screen.queryByText("a.pdf")).not.toBeInTheDocument());
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
  });

  it("disables the merge button when fewer than 2 files are added", async () => {
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([makeFile("only.pdf")]);
    await waitFor(() => screen.getByText("only.pdf"));
    expect(screen.getByRole("button", { name: /Merge PDFs/i })).toBeDisabled();
  });

  it("shows insufficient credits error", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Insufficient credits/i),
    );
  });

  it("shows download link after a successful merge", async () => {
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Download merged PDF/i })).toHaveAttribute(
        "href",
        "https://cdn.test/merged.pdf",
      ),
    );
  });

  it("resets to the dropzone when Merge more PDFs is clicked", async () => {
    const user = userEvent.setup();
    render(<MultiPdfUploader creditCost={2} />);
    addFiles([makeFile("a.pdf"), makeFile("b.pdf")]);
    await waitFor(() => screen.getByText("a.pdf"));
    await user.click(screen.getByRole("button", { name: /Merge PDFs/i }));
    await waitFor(() => screen.getByRole("link", { name: /Download merged PDF/i }));
    await user.click(screen.getByRole("button", { name: /Merge more PDFs/i }));
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
  });
});
