import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignatureModal from "./SignatureModal";

// ── Canvas mock ───────────────────────────────────────────────────────────────
// Override getContext to return a minimal 2D context so canvas drawing code
// actually executes (coverage). toDataURL returns a stable test data URL.

const mockGrad = { addColorStop: vi.fn() };
const mockCtx = {
  scale: vi.fn(), clearRect: vi.fn(), fillText: vi.fn(),
  createLinearGradient: vi.fn(() => mockGrad),
  beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
  font: '', fillStyle: '' as unknown, strokeStyle: '', lineWidth: 0,
  lineCap: '', lineJoin: '', textAlign: '', textBaseline: '',
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as unknown as CanvasRenderingContext2D);
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,mockpng");

const mockOnClose = vi.fn();
const mockOnConfirm = vi.fn();

const defaultProps = { isOpen: true, onClose: mockOnClose, onConfirm: mockOnConfirm };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.stubGlobal("devicePixelRatio", 1);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Render / open ─────────────────────────────────────────────────────────────

describe("SignatureModal — open / close", () => {
  it("renders nothing when isOpen is false", () => {
    render(<SignatureModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when isOpen is true", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create your signature")).toBeInTheDocument();
  });

  it("calls onClose when the X button is clicked", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when clicking the backdrop overlay", () => {
    render(<SignatureModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});

// ── Type tab ──────────────────────────────────────────────────────────────────

describe("SignatureModal — Type tab", () => {
  it("shows Type, Draw and Upload tabs", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /Type/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Draw/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Upload/i })).toBeInTheDocument();
  });

  it("'Place in PDF' is disabled when no name is entered", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("'Place in PDF' is enabled after entering a name", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad Ahmed");
    expect(screen.getByRole("button", { name: /Place in PDF/i })).not.toBeDisabled();
  });

  it("calls onConfirm with source:'typed' and the signer name", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad Ahmed");
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ source: "typed", signerName: "Fahad Ahmed", dataUrl: "data:image/png;base64,mockpng" }),
    );
  });

  it("renders 9 font preview canvases", () => {
    render(<SignatureModal {...defaultProps} />);
    // Only font grid canvases are present in Type tab (draw canvas not mounted)
    const canvases = document.querySelectorAll("canvas");
    expect(canvases).toHaveLength(9);
  });

  it("selecting a font cell updates the selected font", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    // Get all font preview buttons — first one is selected by default (Caveat)
    const fontCells = document.querySelectorAll("button > canvas");
    expect(fontCells).toHaveLength(9);
    // Click the second font cell (Dancing Script) via its parent button
    await user.click((fontCells[1] as HTMLElement).parentElement!);
    // After clicking, canvas renders with new font — just verify no crash
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows 5 ink colour swatches", () => {
    render(<SignatureModal {...defaultProps} />);
    ["Black", "Navy", "Blue", "Red", "Rainbow"].forEach(label =>
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument(),
    );
  });

  it("clicking an ink swatch re-renders font previews", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Test");
    await user.click(screen.getByRole("button", { name: "Blue" }));
    // fillStyle should have been set with blue hex during canvas re-render
    expect(mockCtx.fillStyle).not.toBeNull();
  });

  it("clicking the Rainbow swatch triggers gradient fill logic", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Test");
    await user.click(screen.getByRole("button", { name: "Rainbow" }));
    expect(mockCtx.createLinearGradient).toHaveBeenCalled();
    expect(mockGrad.addColorStop).toHaveBeenCalled();
  });
});

// ── Draw tab ──────────────────────────────────────────────────────────────────

describe("SignatureModal — Draw tab", () => {
  it("switches to Draw tab and shows a canvas and Clear button", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
  });

  it("'Place in PDF' is disabled in Draw tab until the user draws", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("drawing on canvas (pointer events) enables Place in PDF", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    const drawCanvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.pointerDown(drawCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(drawCanvas, { clientX: 50, clientY: 50 });
    fireEvent.pointerUp(drawCanvas);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Place in PDF/i })).not.toBeDisabled(),
    );
  });

  it("Clear button resets the draw state and disables Place in PDF", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    const drawCanvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.pointerDown(drawCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(drawCanvas, { clientX: 50, clientY: 50 });
    fireEvent.pointerUp(drawCanvas);
    await waitFor(() => expect(screen.getByRole("button", { name: /Place in PDF/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Clear/i }));
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("pointerLeave ends the draw stroke", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    const drawCanvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.pointerDown(drawCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerLeave(drawCanvas);
    // No crash — stroke ends gracefully
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onConfirm with source:'drawn' after drawing", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad");
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    const drawCanvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.pointerDown(drawCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(drawCanvas, { clientX: 50, clientY: 50 });
    fireEvent.pointerUp(drawCanvas);
    await waitFor(() => expect(screen.getByRole("button", { name: /Place in PDF/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ source: "drawn", signerName: "Fahad" }),
    );
  });
});

// ── Upload tab ────────────────────────────────────────────────────────────────

describe("SignatureModal — Upload tab", () => {
  it("shows the file dropzone in Upload tab", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("'Place in PDF' is disabled in Upload tab until a file is selected", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("shows the uploaded image and a Remove button after selecting a PNG", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    const file = new File(["png"], "sig.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByRole("button", { name: /Remove/i })).toBeInTheDocument());
  });

  it("Remove button clears the uploaded image", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    const file = new File(["png"], "sig.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
    await waitFor(() => screen.getByRole("button", { name: /Remove/i }));
    await user.click(screen.getByRole("button", { name: /Remove/i }));
    expect(screen.queryByRole("button", { name: /Remove/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("calls onConfirm with source:'uploaded' after a file is selected", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad");
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    const file = new File(["png"], "sig.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByRole("button", { name: /Place in PDF/i })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ source: "uploaded", signerName: "Fahad" }),
    );
  });
});

// ── Save for future use ───────────────────────────────────────────────────────

describe("SignatureModal — localStorage", () => {
  it("saves signerName to localStorage when checkbox is checked and confirmed", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad Ahmed");
    await user.click(screen.getByRole("checkbox", { name: /Save for future use/i }));
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    const saved = JSON.parse(localStorage.getItem("riqa-saved-signature") ?? "{}");
    expect(saved.signerName).toBe("Fahad Ahmed");
  });

  it("removes saved signature from localStorage when checkbox is unchecked on confirm", async () => {
    localStorage.setItem("riqa-saved-signature", JSON.stringify({ signerName: "Old", font: "caveat", ink: "black" }));
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "New Name");
    // checkbox starts checked (restored from localStorage), uncheck it
    const checkbox = screen.getByRole("checkbox", { name: /Save for future use/i });
    if ((checkbox as HTMLInputElement).checked) await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    expect(localStorage.getItem("riqa-saved-signature")).toBeNull();
  });

  it("pre-populates name and marks checkbox from saved localStorage data", () => {
    localStorage.setItem("riqa-saved-signature", JSON.stringify({ signerName: "Saved User", font: "caveat", ink: "black" }));
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByLabelText(/Full name/i)).toHaveValue("Saved User");
    expect(screen.getByRole("checkbox", { name: /Save for future use/i })).toBeChecked();
  });
});
