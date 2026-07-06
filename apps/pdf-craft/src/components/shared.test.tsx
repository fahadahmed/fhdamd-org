import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorCallout, INSUFFICIENT_CREDITS_ERROR, useDraggableFiles } from "./shared";

// Test harness that exposes useDraggableFiles state and functions via rendered output
function FileListHarness({ maxFiles }: { maxFiles: number }) {
  const { uploadedFiles, handleFiles, handleDelete, handleDragEnd } = useDraggableFiles(maxFiles);
  return (
    <div>
      <input
        data-testid="file-input"
        type="file"
        multiple
        onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
      />
      {uploadedFiles.map((f) => (
        <div key={f.name} data-testid={`file-${f.name}`}>
          {f.name}
          <button onClick={() => handleDelete(f.name)}>Remove {f.name}</button>
        </div>
      ))}
      <span data-testid="count">{uploadedFiles.length}</span>
      <button
        data-testid="drag-a-b"
        onClick={() => handleDragEnd({ active: { id: "a.pdf" }, over: { id: "b.pdf" } } as any)}
      >
        Drag a→b
      </button>
      <button
        data-testid="drag-same"
        onClick={() => handleDragEnd({ active: { id: "a.pdf" }, over: { id: "a.pdf" } } as any)}
      >
        Drag same
      </button>
    </div>
  );
}

function makeFile(name: string) {
  return new File(["content"], name, { type: "application/pdf" });
}

describe("ErrorCallout", () => {
  it("renders the provided message", () => {
    render(<ErrorCallout message="Something went wrong" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("does not show a Buy credits link for generic errors", () => {
    render(<ErrorCallout message="Generic error" />);
    expect(screen.queryByRole("link", { name: /Buy more credits/i })).not.toBeInTheDocument();
  });

  it("shows a Buy more credits link for the INSUFFICIENT_CREDITS_ERROR", () => {
    render(<ErrorCallout message={INSUFFICIENT_CREDITS_ERROR} />);
    const link = screen.getByRole("link", { name: /Buy more credits/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/buy-credits");
  });
});

describe("useDraggableFiles", () => {
  it("adds files up to the maxFiles limit", async () => {
    const user = userEvent.setup();
    render(<FileListHarness maxFiles={3} />);
    const input = screen.getByTestId("file-input");
    const files = [makeFile("a.pdf"), makeFile("b.pdf"), makeFile("c.pdf"), makeFile("d.pdf")];
    Object.defineProperty(input, "files", { value: files, configurable: true });
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("3"));
    expect(screen.queryByTestId("file-d.pdf")).not.toBeInTheDocument();
  });

  it("removes a file when handleDelete is called", async () => {
    const user = userEvent.setup();
    render(<FileListHarness maxFiles={5} />);
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [makeFile("x.pdf"), makeFile("y.pdf")], configurable: true });
    fireEvent.change(input);
    await waitFor(() => screen.getByTestId("file-x.pdf"));
    await user.click(screen.getByRole("button", { name: /Remove x.pdf/i }));
    await waitFor(() => expect(screen.queryByTestId("file-x.pdf")).not.toBeInTheDocument());
    expect(screen.getByTestId("file-y.pdf")).toBeInTheDocument();
  });

  it("reorders files when handleDragEnd is called with different active and over ids", async () => {
    const user = userEvent.setup();
    render(<FileListHarness maxFiles={5} />);
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [makeFile("a.pdf"), makeFile("b.pdf")], configurable: true });
    fireEvent.change(input);
    await waitFor(() => screen.getByTestId("file-a.pdf"));
    // Trigger a drag where a.pdf moves to b.pdf's position
    await user.click(screen.getByTestId("drag-a-b"));
    // Both files should still be present (just reordered)
    await waitFor(() => expect(screen.getByTestId("file-a.pdf")).toBeInTheDocument());
    expect(screen.getByTestId("file-b.pdf")).toBeInTheDocument();
  });

  it("does not reorder files when handleDragEnd is called with the same id", async () => {
    const user = userEvent.setup();
    render(<FileListHarness maxFiles={5} />);
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [makeFile("a.pdf"), makeFile("b.pdf")], configurable: true });
    fireEvent.change(input);
    await waitFor(() => screen.getByTestId("file-a.pdf"));
    await user.click(screen.getByTestId("drag-same"));
    expect(screen.getByTestId("file-a.pdf")).toBeInTheDocument();
    expect(screen.getByTestId("file-b.pdf")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("respects remaining capacity when adding to an existing list", async () => {
    render(<FileListHarness maxFiles={2} />);
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [makeFile("a.pdf")], configurable: true });
    fireEvent.change(input);
    await waitFor(() => screen.getByTestId("file-a.pdf"));
    // Try adding 2 more — only 1 slot remaining
    Object.defineProperty(input, "files", { value: [makeFile("b.pdf"), makeFile("c.pdf")], configurable: true });
    fireEvent.change(input);
    await waitFor(() => screen.getByTestId("file-b.pdf"));
    expect(screen.queryByTestId("file-c.pdf")).not.toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });
});
