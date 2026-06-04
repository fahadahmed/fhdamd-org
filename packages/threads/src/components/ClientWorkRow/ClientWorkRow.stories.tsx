import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClientWorkRow } from "./ClientWorkRow";

const meta = {
  title: "Threads/Components/ClientWorkRow",
  component: ClientWorkRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    client:      "Dept. of Education VIC",
    dateRange:   "Jan 2024 – Present",
    title:       <>Kindergarten <em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>Arrival Funding</em></>,
    description: "Technical lead across two phases — winning a $1.3M bid with solution architecture for IBM ODM integrations, then delivering a state-wide micro-frontend attendance platform.",
    tags:        ["React Vite", "Turborepo", "Azure Functions", "Cosmos DB", "GraphQL"],
    value:       "$1.3M bid",
  },
} satisfies Meta<typeof ClientWorkRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoValue: Story = {
  name: "Without bid value",
  args: {
    client:    "ATO",
    dateRange: "Jul 2025 – Present",
    title:     <>Modern Tax Administration <em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>System</em></>,
    description: "Lead backend developer on MTAS for AY2026. Implementing Trust and Beneficiary tax return capabilities including prefill operations on AWS.",
    tags:      ["Node.js", "TypeScript", "Express", "AWS"],
    value:     undefined,
  },
};

export const EYClientList: Story = {
  name: "EY client work list",
  render: () => (
    <div>
      <ClientWorkRow
        client="Dept. of Education VIC"
        dateRange="Jan 2024 – Present"
        title={<>Kindergarten <em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>Arrival Funding</em></>}
        description="Technical lead across two phases — winning a $1.3M bid with solution architecture for IBM ODM integrations, then delivering a state-wide micro-frontend attendance platform. Turborepo, React (Vite), GraphQL, .NET Azure Functions, Cosmos DB."
        tags={["React Vite", "Turborepo", "Azure Functions", "Cosmos DB", "GraphQL", "IBM ODM"]}
        value="$1.3M bid"
      />
      <ClientWorkRow
        client="ATO"
        dateRange="Jul 2025 – Present"
        title={<>Modern Tax Administration <em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>System</em></>}
        description="Lead backend developer on MTAS for AY2026. Implementing Trust and Beneficiary tax return capabilities including prefill operations on AWS Cloud with Node.js, Express, and TypeScript."
        tags={["Node.js", "TypeScript", "Express", "AWS"]}
      />
      <ClientWorkRow
        client="SA Police"
        dateRange="Sep – Oct 2023"
        title={<>Firearms <em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>Registry</em></>}
        description="Bid architecture for a Remix-based firearm permit tracking platform — Azure container, Microsoft Dynamics 365, and Google Maps. Bid win secured the engagement for EY."
        tags={["Remix", "Azure", "Dynamics 365"]}
        value="$1.8M bid"
      />
      <ClientWorkRow
        client="Australian Space Agency"
        dateRange="Sep 2022 – Sep 2023"
        title={<>Space for <em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>Earth</em></>}
        description="Full-stack Remix / GraphQL / .NET platform with geospatial visualisation via Leaflet and Google Maps, role-based access control, dynamic report generation, and CI/CD via GitHub Actions."
        tags={["Remix", "GraphQL", ".NET", "Leaflet", "GitHub Actions"]}
      />
    </div>
  ),
};
