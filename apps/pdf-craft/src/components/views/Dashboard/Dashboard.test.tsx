import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

import Dashboard from "./Dashboard";
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, getDoc } from "firebase/firestore";

const mockOperations = [
  {
    id: "1",
    title: "Merge PDFs",
    detail: "Combine files",
    creditCost: 2,
    active: true,
    actionRoute: "/merge",
    actionLabel: "Merge",
    iconKey: "merge",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
    callback(null);
    return () => {};
  });
  (getDocs as any).mockResolvedValue({ docs: [] });
  (getDoc as any).mockResolvedValue({ exists: () => false });
});

describe("Dashboard", () => {
  it("shows loading state when auth has not resolved", () => {
    (onAuthStateChanged as any).mockImplementation(() => () => {});
    render(<Dashboard operations={mockOperations} />);
    expect(screen.getByText(/Loading your files/i)).toBeInTheDocument();
  });

  it("hides loading state after auth resolves", async () => {
    render(<Dashboard operations={mockOperations} />);
    await waitFor(() =>
      expect(screen.queryByText(/Loading your files/i)).not.toBeInTheDocument(),
    );
  });

  it("renders the tools section with operation cards", async () => {
    render(<Dashboard operations={mockOperations} />);
    await waitFor(() => expect(screen.getByText("Merge PDFs")).toBeInTheDocument());
  });

  it("shows generic welcome when no user is signed in", async () => {
    render(<Dashboard operations={mockOperations} />);
    await waitFor(() => expect(screen.getByText("Welcome")).toBeInTheDocument());
  });

  it("shows personalised welcome and credits badge for signed-in user", async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: Function) => {
      callback({ uid: "user-1" });
      return () => {};
    });
    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ profile: { name: "Alice", credits: 42 } }),
    });
    render(<Dashboard operations={mockOperations} />);
    await waitFor(() => expect(screen.getByText(/Welcome, Alice/)).toBeInTheDocument());
    expect(screen.getByText(/42 credits remaining/i)).toBeInTheDocument();
  });

  it("renders Files and History tabs after loading", async () => {
    render(<Dashboard operations={mockOperations} />);
    await waitFor(() => expect(screen.getByRole("tab", { name: "Files" })).toBeInTheDocument());
    expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
  });

  it("switches to History tab on click", async () => {
    const user = userEvent.setup();
    render(<Dashboard operations={mockOperations} />);
    await waitFor(() => screen.getByRole("tab", { name: "History" }));
    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
  });
});
