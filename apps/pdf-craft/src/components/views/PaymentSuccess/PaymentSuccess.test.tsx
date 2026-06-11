import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentSuccess from "./PaymentSuccess";

describe("PaymentSuccess", () => {
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

  it("lists the three supported tools", () => {
    render(<PaymentSuccess />);
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
    expect(screen.getByText("Image to PDF")).toBeInTheDocument();
    expect(screen.getByText("Encrypt & decrypt PDFs")).toBeInTheDocument();
  });

  it("tells the user credits are ready to use", () => {
    render(<PaymentSuccess />);
    expect(screen.getByText(/credits have been added/i)).toBeInTheDocument();
  });
});
