import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock("../../../utils/lib/cms", () => ({
  fetchCms: vi.fn(),
}));

vi.mock("../../../utils/lib/analytics", () => ({ logEvent: vi.fn() }));

import Pricing from "./Pricing";
import { onAuthStateChanged } from "firebase/auth";
import { fetchCms } from "../../../utils/lib/cms";

const mockOptions = [
  { id: "1", credits: 10, price: 500, productName: "Starter" },
  { id: "2", credits: 25, price: 1000, productName: "Popular" },
  { id: "3", credits: 50, price: 1500, productName: "Pro" },
];

beforeEach(() => {
  vi.clearAllMocks();
  (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
    callback(null);
    return () => {};
  });
  (fetchCms as any).mockResolvedValue({ data: { allPricingOptions: mockOptions } });
  vi.stubGlobal("location", { href: "" });
});

describe("Pricing", () => {
  it("renders nothing when pricing options are empty", async () => {
    (fetchCms as any).mockResolvedValue({ data: { allPricingOptions: [] } });
    const { container } = render(<Pricing />);
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("renders pricing cards after options load", async () => {
    render(<Pricing />);
    await waitFor(() => expect(screen.getByText("10 credits")).toBeInTheDocument());
    expect(screen.getByText("25 credits")).toBeInTheDocument();
    expect(screen.getByText("50 credits")).toBeInTheDocument();
  });

  it("shows sign-up links for unauthenticated users", async () => {
    render(<Pricing />);
    await waitFor(() => screen.getByText("10 credits"));
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/signup"));
  });

  it("shows Buy credits buttons for authenticated users", async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
      callback({ uid: "user-1" });
      return () => {};
    });
    render(<Pricing />);
    await waitFor(() => screen.getByText("10 credits"));
    expect(screen.getAllByRole("button", { name: /Buy credits/i })).toHaveLength(3);
  });

  it("shows a checkout error when the payment fetch throws", async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
      callback({ uid: "user-1" });
      return () => {};
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const user = userEvent.setup();
    render(<Pricing />);
    await waitFor(() => screen.getByText("10 credits"));
    await user.click(screen.getAllByRole("button", { name: /Buy credits/i })[0]);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Could not start checkout/i),
    );
  });

  it("redirects to Stripe when the payment API returns a URL", async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
      callback({ uid: "user-1" });
      return () => {};
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ url: "https://stripe.test/checkout" }),
    }));
    const user = userEvent.setup();
    render(<Pricing />);
    await waitFor(() => screen.getByText("10 credits"));
    await user.click(screen.getAllByRole("button", { name: /Buy credits/i })[0]);
    await waitFor(() => expect(globalThis.location.href).toBe("https://stripe.test/checkout"));
  });

  it("shows an error when payment API returns no checkout URL", async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
      callback({ uid: "user-1" });
      return () => {};
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ error: "Something went wrong" }),
    }));
    const user = userEvent.setup();
    render(<Pricing />);
    await waitFor(() => screen.getByText("10 credits"));
    await user.click(screen.getAllByRole("button", { name: /Buy credits/i })[0]);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Could not start checkout/i),
    );
  });
});
