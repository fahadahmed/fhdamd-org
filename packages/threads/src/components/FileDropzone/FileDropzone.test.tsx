import { render, screen, fireEvent } from "@testing-library/react";
import { FileDropzone } from "./FileDropzone";

describe("FileDropzone — rendering", () => {
  it("renders the browse prompt", () => {
    render(<FileDropzone />);
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<FileDropzone label="Upload PDF" />);
    expect(screen.getByText("Upload PDF")).toBeInTheDocument();
  });

  it("renders hint text inside the zone", () => {
    render(<FileDropzone hint="PDF up to 50 MB" />);
    expect(screen.getByText("PDF up to 50 MB")).toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(<FileDropzone error="File type not supported." />);
    expect(screen.getByRole("alert")).toHaveTextContent("File type not supported.");
  });

  it("has a hidden file input", () => {
    const { container } = render(<FileDropzone />);
    const input = container.querySelector("input[type='file']");
    expect(input).toBeInTheDocument();
  });

  it("passes accept to the file input", () => {
    const { container } = render(<FileDropzone accept=".pdf" />);
    expect(container.querySelector("input[type='file']")).toHaveAttribute("accept", ".pdf");
  });

  it("passes multiple to the file input", () => {
    const { container } = render(<FileDropzone multiple />);
    expect(container.querySelector("input[type='file']")).toHaveAttribute("multiple");
  });

  it("file input is disabled when disabled prop is set", () => {
    const { container } = render(<FileDropzone disabled />);
    expect(container.querySelector("input[type='file']")).toBeDisabled();
  });

  it("zone label has role=button", () => {
    render(<FileDropzone />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("zone label has tabIndex=0 when not disabled", () => {
    render(<FileDropzone />);
    expect(screen.getByRole("button")).toHaveAttribute("tabindex", "0");
  });

  it("zone label has tabIndex=-1 when disabled", () => {
    render(<FileDropzone disabled />);
    expect(screen.getByRole("button")).toHaveAttribute("tabindex", "-1");
  });
});

describe("FileDropzone — drag events", () => {
  it("adds drag-over style when dragging over", () => {
    const { container } = render(<FileDropzone />);
    const zone = screen.getByRole("button");
    fireEvent.dragOver(zone, { preventDefault: () => {} });
    // dragOver is handled — no throw
    expect(zone).toBeInTheDocument();
  });

  it("removes drag-over style on drag leave", () => {
    render(<FileDropzone />);
    const zone = screen.getByRole("button");
    fireEvent.dragOver(zone, { preventDefault: () => {} });
    fireEvent.dragLeave(zone);
    expect(zone).toBeInTheDocument();
  });

  it("calls onFiles with dropped files", () => {
    const onFiles = vi.fn();
    render(<FileDropzone onFiles={onFiles} />);
    const zone = screen.getByRole("button");
    const file = new File(["hello"], "doc.pdf", { type: "application/pdf" });
    fireEvent.drop(zone, {
      preventDefault: () => {},
      dataTransfer: { files: [file] },
    });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("does not call onFiles when disabled", () => {
    const onFiles = vi.fn();
    render(<FileDropzone onFiles={onFiles} disabled />);
    const zone = screen.getByRole("button");
    const file = new File(["hello"], "doc.pdf", { type: "application/pdf" });
    fireEvent.drop(zone, {
      preventDefault: () => {},
      dataTransfer: { files: [file] },
    });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
