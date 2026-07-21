import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkillGrid } from "./SkillGrid";

const meta = {
  title: "Threads/Components/SkillGrid",
  component: SkillGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    categories: [
      { label: "Cloud & infra", tags: ["Azure", "AWS", "GCP", "Firebase"] },
      { label: "Frontend", tags: ["React", "Next.js", "Remix", "Astro", "Vite"] },
      { label: "Backend", tags: ["Node.js", "TypeScript", ".NET Core", "Express"] },
      { label: "Data & API", tags: ["GraphQL", "Cosmos DB", "Firestore", "REST"] },
      { label: "CMS & commerce", tags: ["DatoCMS", "Stripe", "Resend"] },
      { label: "Mobile", tags: ["Swift", "SwiftUI", "SwiftData", "iOS"] },
    ],
  },
} satisfies Meta<typeof SkillGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
