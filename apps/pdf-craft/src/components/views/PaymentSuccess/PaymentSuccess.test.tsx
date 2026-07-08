import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentSuccess from "./PaymentSuccess";

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

const PENDING_KEY = "pending_purchase";

const mockPurchase = {
  value: 9.99,
  credits: 50,
  productName: "50 Credits",
  items: [{ item_id: "credits_50", item_name: "50 Credits", price: 9.99, quantity: 1 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe("PaymentSuccess — static content", () => {
  it("renders the payment successful heading", () => {
    render(<PaymentSuccess />);
    expect(screen.getByRole("heading", { name: /Payment successful/i })).toBeInTheDocument();
  });

  it("has a Go to dashboard link", () => {
    render(<PaymentSuccess />);
    expect(screen.getByRole("link", { name: /Go to dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("has a Buy more credits link", () => {
    render(<PaymentSuccess />);
    expect(screen.getByRole("link", { name: /Buy more credits/i })).toHaveAttribute("href", "/buy-credits");
  });

  it("lists all six supported operations", () => {
    render(<PaymentSuccess />);
    ["Merge PDFs", "Image to PDF", "Encrypt & decrypt PDFs", "Split PDFs", "Compress PDFs", "Sign PDFs"].forEach(tool =>
      expect(screen.getByText(tool)).toBeInTheDocument(),
    );
  });

  it("tells the user credits are ready to use", () => {
    render(<PaymentSuccess />);
    expect(screen.getByText(/credits have been added/i)).toBeInTheDocument();
  });
});

describe("PaymentSuccess — GA4 purchase_complete event", () => {
  it("fires purchase_complete with the stored payload on first render", async () => {
    const { logEvent } = await import("../../../utils/lib/analytics");
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(mockPurchase));
    render(<PaymentSuccess />);
    expect(logEvent).toHaveBeenCalledWith("purchase_complete", {
      currency: "USD",
      value: 9.99,
      items: mockPurchase.items,
      credits_purchased: 50,
      product_name: "50 Credits",
    });
  });

  it("clears the sessionStorage key immediately after firing", async () => {
    const { logEvent } = await import("../../../utils/lib/analytics");
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(mockPurchase));
    render(<PaymentSuccess />);
    expect(sessionStorage.getItem(PENDING_KEY)).toBeNull();
    expect(logEvent).toHaveBeenCalledOnce();
  });

  it("does not fire when there is no pending purchase in sessionStorage", async () => {
    const { logEvent } = await import("../../../utils/lib/analytics");
    render(<PaymentSuccess />);
    expect(logEvent).not.toHaveBeenCalledWith("purchase_complete", expect.anything());
  });

  it("does not fire again on a second render (simulates page refresh)", async () => {
    const { logEvent } = await import("../../../utils/lib/analytics");
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(mockPurchase));
    const { unmount } = render(<PaymentSuccess />);
    unmount();
    // sessionStorage was cleared by the first render
    render(<PaymentSuccess />);
    expect(logEvent).toHaveBeenCalledOnce(); // only from the first render
  });

  it("handles malformed sessionStorage payload gracefully without throwing", async () => {
    const { logEvent } = await import("../../../utils/lib/analytics");
    sessionStorage.setItem(PENDING_KEY, "not-valid-json{{{");
    expect(() => render(<PaymentSuccess />)).not.toThrow();
    expect(logEvent).not.toHaveBeenCalledWith("purchase_complete", expect.anything());
  });
});
