import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignaturePlacement from "./SignaturePlacement";

vi.mock("../../../utils/lib/pdfRender", () => ({
  renderPdfPageToCanvas: vi.fn().mockResolvedValue(undefined),
}));

// jsdom doesn't implement setPointerCapture — stub it
HTMLElement.prototype.setPointerCapture = vi.fn();

const mockOnConfirm = vi.fn();
const mockOnBack = vi.fn();

const PAGE_DIMS = [
  { width: 595, height: 842 },
  { width: 595, height: 842 },
  { width: 595, height: 842 },
];

const SIG: { dataUrl: string; source: 'typed'; signerName: string } = {
  dataUrl: "data:image/png;base64,fakepng",
  source: "typed",
  signerName: "Fahad Ahmed",
};

const pdfFile = new File(["pdf"], "doc.pdf", { type: "application/pdf" });

const defaultProps = {
  file: pdfFile,
  signature: SIG,
  pageDimensions: PAGE_DIMS,
  onConfirm: mockOnConfirm,
  onBack: mockOnBack,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe("SignaturePlacement — rendering", () => {
  it("renders the header and footer", () => {
    render(<SignaturePlacement {...defaultProps} />);
    expect(screen.getByText("Place your signature")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Place Signature/i })).toBeInTheDocument();
  });

  it("shows the page count in the footer", () => {
    render(<SignaturePlacement {...defaultProps} />);
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
  });

  it("renders a thumbnail button for each page", () => {
    render(<SignaturePlacement {...defaultProps} />);
    expect(screen.getByRole("button", { name: /Page 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Page 2/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Page 3/i })).toBeInTheDocument();
  });

  it("renders the signature image in the overlay", () => {
    render(<SignaturePlacement {...defaultProps} />);
    const img = screen.getByRole("img", { name: /Signature/i });
    expect(img).toHaveAttribute("src", SIG.dataUrl);
  });

  it("shows the 'Also stamp initials on other pages' checkbox unchecked by default", () => {
    render(<SignaturePlacement {...defaultProps} />);
    expect(screen.getByRole("checkbox", { name: /Also stamp initials/i })).not.toBeChecked();
  });

  it("shows a zoom range input", () => {
    render(<SignaturePlacement {...defaultProps} />);
    expect(screen.getByRole("slider", { name: /Zoom/i })).toBeInTheDocument();
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe("SignaturePlacement — navigation", () => {
  it("calls onBack when the Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledOnce();
  });

  it("switching to page 2 via thumbnail updates the page counter", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Page 2/i }));
    await waitFor(() => expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument());
  });

  it("switching pages re-renders the main canvas", async () => {
    const { renderPdfPageToCanvas } = await import("../../../utils/lib/pdfRender");
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Page 3/i }));
    await waitFor(() =>
      expect(renderPdfPageToCanvas).toHaveBeenCalledWith(pdfFile, 3, expect.any(HTMLCanvasElement), expect.any(Number)),
    );
  });
});

// ── Placement confirm ─────────────────────────────────────────────────────────

describe("SignaturePlacement — confirm", () => {
  it("calls onConfirm with a single placement when Place Signature is clicked", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    expect(mockOnConfirm).toHaveBeenCalledOnce();
    const [placements] = mockOnConfirm.mock.calls[0];
    expect(placements).toHaveLength(1);
    expect(placements[0].page).toBe(1);
    expect(typeof placements[0].x).toBe("number");
    expect(typeof placements[0].y).toBe("number");
    expect(typeof placements[0].width).toBe("number");
    expect(typeof placements[0].height).toBe("number");
  });

  it("calls onConfirm with placements for all pages when 'stamp all' is checked", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    await user.click(screen.getByRole("checkbox", { name: /Also stamp initials/i }));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    const [placements] = mockOnConfirm.mock.calls[0];
    expect(placements).toHaveLength(3); // one per page
    expect(placements[0].page).toBe(1);
    expect(placements[1].page).toBe(2);
    expect(placements[2].page).toBe(3);
  });

  it("places signature on the correct page when on page 2", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Page 2/i }));
    await waitFor(() => screen.getByText(/Page 2 of 3/i));
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    const [placements] = mockOnConfirm.mock.calls[0];
    expect(placements[0].page).toBe(2);
  });
});

// ── Drag interactions ─────────────────────────────────────────────────────────

describe("SignaturePlacement — drag", () => {
  it("dragging the signature overlay calls setSigRect (no crash)", () => {
    render(<SignaturePlacement {...defaultProps} />);
    const overlay = screen.getByRole("img", { name: /Signature/i }).parentElement!;
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(overlay, { clientX: 120, clientY: 130, pointerId: 1 });
    fireEvent.pointerUp(overlay, { pointerId: 1 });
    // Component stays stable
    expect(screen.getByRole("button", { name: /Place Signature/i })).toBeInTheDocument();
  });

  it("pointer move without prior pointer down does nothing (early return)", () => {
    render(<SignaturePlacement {...defaultProps} />);
    const overlay = screen.getByRole("img", { name: /Signature/i }).parentElement!;
    // No pointerDown first
    fireEvent.pointerMove(overlay, { clientX: 120, clientY: 130 });
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
  });

  it("drag is constrained to canvas bounds (clamps to 0 minimum)", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    const overlay = screen.getByRole("img", { name: /Signature/i }).parentElement!;
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 100, pointerId: 1 });
    // Move far negative — should clamp to 0
    fireEvent.pointerMove(overlay, { clientX: -9999, clientY: -9999, pointerId: 1 });
    fireEvent.pointerUp(overlay);
    // After confirm the x and y should be ≥ 0 in PDF points
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    const [[placements]] = mockOnConfirm.mock.calls;
    expect(placements[0].x).toBeGreaterThanOrEqual(0);
    expect(placements[0].y).toBeGreaterThanOrEqual(0);
  });
});

// ── Resize interactions ───────────────────────────────────────────────────────

describe("SignaturePlacement — resize", () => {
  it("dragging the resize handle updates the signature size without crashing", () => {
    render(<SignaturePlacement {...defaultProps} />);
    const handle = screen.getByRole("button", { name: /Resize signature/i });
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 250, clientY: 350, pointerId: 1 });
    fireEvent.pointerUp(handle);
    expect(screen.getByRole("button", { name: /Place Signature/i })).toBeInTheDocument();
  });

  it("resize pointer move without prior down does nothing (early return)", () => {
    render(<SignaturePlacement {...defaultProps} />);
    const handle = screen.getByRole("button", { name: /Resize signature/i });
    fireEvent.pointerMove(handle, { clientX: 250, clientY: 350 });
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
  });

  it("resize is constrained to minimum size", async () => {
    const user = userEvent.setup();
    render(<SignaturePlacement {...defaultProps} />);
    const handle = screen.getByRole("button", { name: /Resize signature/i });
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 300, pointerId: 1 });
    // Drag far negative — width/height should clamp to MIN_SIG_W/H
    fireEvent.pointerMove(handle, { clientX: -9999, clientY: -9999, pointerId: 1 });
    fireEvent.pointerUp(handle);
    await user.click(screen.getByRole("button", { name: /Place Signature/i }));
    const [[placements]] = mockOnConfirm.mock.calls;
    expect(placements[0].width).toBeGreaterThan(0);
    expect(placements[0].height).toBeGreaterThan(0);
  });
});

// ── Zoom ──────────────────────────────────────────────────────────────────────

describe("SignaturePlacement — zoom", () => {
  it("changing the zoom slider triggers a canvas re-render", async () => {
    const { renderPdfPageToCanvas } = await import("../../../utils/lib/pdfRender");
    render(<SignaturePlacement {...defaultProps} />);
    const slider = screen.getByRole("slider", { name: /Zoom/i });
    fireEvent.change(slider, { target: { value: "0.8" } });
    await waitFor(() =>
      expect(renderPdfPageToCanvas).toHaveBeenCalledWith(
        pdfFile, 1, expect.any(HTMLCanvasElement), 0.8,
      ),
    );
  });
});
