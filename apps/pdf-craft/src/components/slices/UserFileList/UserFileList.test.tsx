import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserFileList from "./UserFileList";

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
});
