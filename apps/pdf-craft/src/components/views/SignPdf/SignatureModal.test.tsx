import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignatureModal from "./SignatureModal";

// canvas.toDataURL is not implemented in jsdom
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,test");

const mockOnClose = vi.fn();
const mockOnConfirm = vi.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onConfirm: mockOnConfirm,
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.stubGlobal("devicePixelRatio", 1);
});

describe("SignatureModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(<SignatureModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the modal when isOpen is true", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create your signature")).toBeInTheDocument();
  });

  it("shows Type, Draw, and Upload tabs", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /Type/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Draw/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Upload/i })).toBeInTheDocument();
  });

  it("calls onClose when the X button is clicked", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when clicking the backdrop", async () => {
    render(<SignatureModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it("'Place in PDF' is disabled when no name is entered in Type tab", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("'Place in PDF' is enabled after entering a name in Type tab", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad Ahmed");
    expect(screen.getByRole("button", { name: /Place in PDF/i })).not.toBeDisabled();
  });

  it("calls onConfirm with typed source when Place in PDF is clicked", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad Ahmed");
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ source: "typed", signerName: "Fahad Ahmed" }),
    );
  });

  it("switches to Draw tab and shows Clear button", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
  });

  it("'Place in PDF' is disabled in Draw tab with no drawing", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Draw/i }));
    expect(screen.getByRole("button", { name: /Place in PDF/i })).toBeDisabled();
  });

  it("switches to Upload tab and shows the file dropzone", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("shows 'Save for future use' checkbox unchecked by default", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByRole("checkbox", { name: /Save for future use/i })).not.toBeChecked();
  });

  it("saves signerName to localStorage when 'Save for future use' is checked", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/Full name/i), "Fahad Ahmed");
    await user.click(screen.getByRole("checkbox", { name: /Save for future use/i }));
    await user.click(screen.getByRole("button", { name: /Place in PDF/i }));
    const saved = JSON.parse(localStorage.getItem("riqa-saved-signature") ?? "{}");
    expect(saved.signerName).toBe("Fahad Ahmed");
  });

  it("pre-populates name from localStorage on open", () => {
    localStorage.setItem("riqa-saved-signature", JSON.stringify({ signerName: "Saved User", font: "caveat", ink: "black" }));
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByLabelText(/Full name/i)).toHaveValue("Saved User");
  });

  it("shows 5 ink colour swatches", () => {
    render(<SignatureModal {...defaultProps} />);
    const swatches = ["Black", "Navy", "Blue", "Red", "Rainbow"];
    swatches.forEach(label => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("shows 9 font preview cells", () => {
    render(<SignatureModal {...defaultProps} />);
    // 9 canvas elements for the font grid + zero for draw (not on draw tab)
    const canvases = document.querySelectorAll("canvas");
    expect(canvases.length).toBe(9);
  });

  it("shows uploaded image and Remove button after file is selected in Upload tab", async () => {
    const user = userEvent.setup();
    render(<SignatureModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Upload/i }));
    const file = new File(["png"], "sig.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Remove/i })).toBeInTheDocument(),
    );
  });
});
