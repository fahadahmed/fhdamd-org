import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "./DataTable";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";

type Operation = {
  id: string;
  name: string;
  credits: number;
  status: "live" | "soon";
  category: string;
};

const ops: Operation[] = [
  { id: "1",  name: "Merge PDFs",    credits: 2,  status: "live", category: "Convert"  },
  { id: "2",  name: "Image to PDF",  credits: 2,  status: "live", category: "Convert"  },
  { id: "3",  name: "Protect PDF",   credits: 4,  status: "live", category: "Security" },
  { id: "4",  name: "Unlock PDF",    credits: 4,  status: "live", category: "Security" },
  { id: "5",  name: "Split PDF",     credits: 3,  status: "soon", category: "Edit"     },
  { id: "6",  name: "Compress PDF",  credits: 3,  status: "soon", category: "Optimise" },
  { id: "7",  name: "Sign PDF",      credits: 4,  status: "soon", category: "Security" },
  { id: "8",  name: "PDF to Image",  credits: 3,  status: "soon", category: "Convert"  },
  { id: "9",  name: "Doc to PDF",    credits: 3,  status: "soon", category: "Convert"  },
  { id: "10", name: "AI Summary",    credits: 5,  status: "soon", category: "AI"       },
  { id: "11", name: "AI Detailed",   credits: 8,  status: "soon", category: "AI"       },
];

const columns = [
  { key: "name",     header: "Operation",  sortable: true  },
  { key: "credits",  header: "Credits",    sortable: true  },
  {
    key: "status",
    header: "Status",
    render: (row: Operation) => (
      <Badge variant={row.status === "live" ? "sage" : "neutral"}>
        {row.status === "live" ? "Live" : "Coming soon"}
      </Badge>
    ),
  },
  { key: "category", header: "Category", sortable: true },
];

const meta = {
  title: "Threads/Components/DataTable",
  component: DataTable,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    columns,
    rows: ops,
    rowKey: "id",
    searchable: true,
    pageSize: 5,
  },
} satisfies Meta<typeof DataTable<Operation>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Riqa operations",
};

export const WithActions: Story = {
  name: "With toolbar actions",
  args: {
    searchable: true,
    actions: (
      <div style={{ display: "flex", gap: "var(--th-space-2)" }}>
        <Button variant="ghost" size="sm">Export</Button>
        <Button variant="solid-terra" size="sm">Add operation</Button>
      </div>
    ),
  },
};

export const NoSearch: Story = {
  name: "Without search",
  args: { searchable: false, pageSize: 10 },
};

export const EmptyState: Story = {
  name: "Empty state",
  args: { rows: [], searchable: false, emptyState: "No operations configured yet." },
};
