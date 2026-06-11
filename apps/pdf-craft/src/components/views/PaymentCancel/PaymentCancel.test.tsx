import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentCancel from "./PaymentCancel";

describe("PaymentCancel", () => {
  it("renders the payment cancelled heading", () => {
    render(<PaymentCancel />);
    expect(screen.getByRole("heading", { name: /Payment cancelled/i })).toBeInTheDocument();
  });

  it("has a Try again link to /buy-credits", () => {
    render(<PaymentCancel />);
    expect(screen.getByRole("link", { name: /Try again/i })).toHaveAttribute("href", "/buy-credits");
  });

  it("has a Back to dashboard link to /dashboard", () => {
    render(<PaymentCancel />);
    expect(screen.getByRole("link", { name: /Back to dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("informs the user no charges were made", () => {
    render(<PaymentCancel />);
    expect(screen.getByText(/no charges were made/i)).toBeInTheDocument();
  });
});
