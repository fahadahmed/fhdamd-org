import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./DataTable";

type Row = { id: string; name: string; credits: number; status: string };

const columns = [
  { key: "name",    header: "Operation", sortable: true },
  { key: "credits", header: "Credits",   sortable: true },
  { key: "status",  header: "Status" },
];

const rows: Row[] = [
  { id: "1", name: "Merge PDFs",   credits: 2, status: "live" },
  { id: "2", name: "Protect PDF",  credits: 4, status: "live" },
  { id: "3", name: "Split PDF",    credits: 3, status: "soon" },
  { id: "4", name: "Compress PDF", credits: 3, status: "soon" },
  { id: "5", name: "Sign PDF",     credits: 4, status: "soon" },
];

describe("DataTable — rendering", () => {
  it("renders column headers", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" />);
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("Credits")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders all rows", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={10} />);
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
    expect(screen.getByText("Protect PDF")).toBeInTheDocument();
    expect(screen.getByText("Split PDF")).toBeInTheDocument();
  });

  it("shows row count in footer", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={10} />);
    expect(screen.getByText(/5 results/)).toBeInTheDocument();
  });

  it("renders empty state when rows is empty", () => {
    render(<DataTable columns={columns} rows={[]} rowKey="id" emptyState="No data." />);
    expect(screen.getByText("No data.")).toBeInTheDocument();
  });

  it("renders search input when searchable=true", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" searchable />);
    expect(screen.getByRole("searchbox", { name: "Search table" })).toBeInTheDocument();
  });

  it("does not render search when searchable is omitted", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});

describe("DataTable — search", () => {
  it("filters rows by search query", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} rowKey="id" searchable pageSize={10} />);
    await user.type(screen.getByRole("searchbox"), "merge");
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
    expect(screen.queryByText("Protect PDF")).not.toBeInTheDocument();
  });

  it("shows result count after filtering", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} rowKey="id" searchable pageSize={10} />);
    await user.type(screen.getByRole("searchbox"), "live");
    expect(screen.getByText(/2 results/)).toBeInTheDocument();
  });
});

describe("DataTable — pagination", () => {
  it("paginates rows — shows only pageSize rows", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={2} />);
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
    expect(screen.queryByText("Split PDF")).not.toBeInTheDocument();
  });

  it("shows pagination controls when rows exceed pageSize", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={2} />);
    expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
  });

  it("does not show pagination when all rows fit on one page", () => {
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={10} />);
    expect(screen.queryByLabelText("Pagination")).not.toBeInTheDocument();
  });

  it("navigates to next page", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={2} />);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Split PDF")).toBeInTheDocument();
  });
});

describe("DataTable — sort", () => {
  it("sorts column ascending on first click", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} rowKey="id" pageSize={10} />);
    await user.click(screen.getByRole("button", { name: "Sort by Operation" }));
    const cells = screen.getAllByRole("cell").filter((_, i) => i % 3 === 0);
    expect(cells[0]).toHaveTextContent("Compress PDF"); // alphabetical first
  });
});
