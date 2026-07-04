import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserFileList from "./UserFileList";
import { claimFile } from "../../../test/mocks/astro-actions";

beforeEach(() => {
  vi.clearAllMocks();
  claimFile.mockResolvedValue({ data: { success: true, payload: { downloadUrl: "https://cdn.test/claimed.pdf" } } });
  vi.stubGlobal("open", vi.fn());
  vi.stubGlobal("location", { href: "" });
});

const makeDate = (iso = "2024-01-15T10:00:00Z") => ({ toDate: () => new Date(iso) });

const makeFile = (overrides: any = {}) => ({
  id: "file-1",
  fileName: "report.pdf",
  operation: "merge",
  createdAt: makeDate(),
  fileUrl: "https://cdn.test/report.pdf",
  expiresAt: makeDate("2024-02-15T10:00:00Z"),
  ...overrides,
});

describe("UserFileList", () => {
  it("renders the file name", () => {
    render(<UserFileList files={[makeFile()]} />);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("shows Actions column header in default mode", () => {
    render(<UserFileList files={[makeFile()]} />);
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("shows Expires At column header in trash mode", () => {
    render(<UserFileList files={[makeFile()]} mode="trash" />);
    expect(screen.getByText("Expires At")).toBeInTheDocument();
  });

  it("renders a download link in default mode", () => {
    render(<UserFileList files={[makeFile({ fileUrl: "https://cdn.test/report.pdf" })]} />);
    expect(screen.getByRole("link", { name: /Download/ })).toHaveAttribute(
      "href",
      "https://cdn.test/report.pdf",
    );
  });

  it("shows empty state message in default mode", () => {
    render(<UserFileList files={[]} />);
    expect(screen.getByText(/No files yet/)).toBeInTheDocument();
  });

  it("shows deleted-files empty state in trash mode", () => {
    render(<UserFileList files={[]} mode="trash" />);
    expect(screen.getByText(/No deleted files/)).toBeInTheDocument();
  });

  it("renders operation labels via Badge", () => {
    render(
      <UserFileList
        files={[
          makeFile({ id: "1", operation: "merge" }),
          makeFile({ id: "2", operation: "encrypt" }),
          makeFile({ id: "3", operation: "decrypt" }),
          makeFile({ id: "4", operation: "image-to-pdf" }),
        ]}
      />,
    );
    expect(screen.getByText("Merge")).toBeInTheDocument();
    expect(screen.getByText("Protect")).toBeInTheDocument();
    expect(screen.getByText("Unlock")).toBeInTheDocument();
    expect(screen.getByText("Image to PDF")).toBeInTheDocument();
  });

  it("falls back to the raw operation string for unknown operation keys", () => {
    render(<UserFileList files={[makeFile({ operation: "unknown-op" })]} />);
    expect(screen.getByText("unknown-op")).toBeInTheDocument();
  });

  // ── Pending / migrated file download flow ────────────────────────────────

  it("shows a credit-cost button for a pending file instead of a direct link", () => {
    render(<UserFileList files={[makeFile({ status: "pending", creditCost: 2 })]} />);
    expect(screen.getByRole("button", { name: /Download — 2 credits/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Download/ })).not.toBeInTheDocument();
  });

  it("shows a credit-cost button for a migrated file", () => {
    render(<UserFileList files={[makeFile({ status: "migrated", creditCost: 3 })]} />);
    expect(screen.getByRole("button", { name: /Download — 3 credits/i })).toBeInTheDocument();
  });

  it("uses singular 'credit' label when creditCost is 1", () => {
    render(<UserFileList files={[makeFile({ status: "pending", creditCost: 1 })]} />);
    expect(screen.getByRole("button", { name: /Download — 1 credit$/i })).toBeInTheDocument();
  });

  it("calls claimFile with the file id when the credit button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserFileList files={[makeFile({ id: "file-99", status: "pending", creditCost: 2 })]} />);
    await user.click(screen.getByRole("button", { name: /Download — 2 credits/i }));
    await waitFor(() => expect(claimFile).toHaveBeenCalledWith({ fileId: "file-99" }));
  });

  it("opens the download URL in a new tab on success", async () => {
    const user = userEvent.setup();
    render(<UserFileList files={[makeFile({ status: "pending", creditCost: 2 })]} />);
    await user.click(screen.getByRole("button", { name: /Download — 2 credits/i }));
    await waitFor(() => expect(globalThis.open).toHaveBeenCalledWith("https://cdn.test/claimed.pdf", "_blank"));
  });

  it("redirects to /buy-credits when claimFile returns Insufficient credits", async () => {
    claimFile.mockResolvedValue({ data: { success: false, error: "Insufficient credits" } });
    const user = userEvent.setup();
    render(<UserFileList files={[makeFile({ status: "pending", creditCost: 2 })]} />);
    await user.click(screen.getByRole("button", { name: /Download — 2 credits/i }));
    await waitFor(() => expect(globalThis.location.href).toBe("/buy-credits"));
  });

  it("shows an inline error when claimFile returns a non-credits failure", async () => {
    claimFile.mockResolvedValue({ data: { success: false, error: "File not found" } });
    const user = userEvent.setup();
    render(<UserFileList files={[makeFile({ status: "pending", creditCost: 2 })]} />);
    await user.click(screen.getByRole("button", { name: /Download — 2 credits/i }));
    await waitFor(() => expect(screen.getByText("File not found")).toBeInTheDocument());
  });

  it("shows a regular download link for a ready file (status: ready)", () => {
    render(<UserFileList files={[makeFile({ status: "ready", fileUrl: "https://cdn.test/ready.pdf" })]} />);
    expect(screen.getByRole("link", { name: /Download/ })).toHaveAttribute("href", "https://cdn.test/ready.pdf");
    expect(screen.queryByRole("button", { name: /credits/i })).not.toBeInTheDocument();
  });

  it("shows a regular download link when status is undefined (legacy file)", () => {
    const { status: _omit, ...fileWithoutStatus } = makeFile({ fileUrl: "https://cdn.test/legacy.pdf" });
    render(<UserFileList files={[fileWithoutStatus]} />);
    expect(screen.getByRole("link", { name: /Download/ })).toBeInTheDocument();
  });
});
