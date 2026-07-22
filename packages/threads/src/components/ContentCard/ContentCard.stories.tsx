import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentCard } from "./ContentCard";

const meta = {
  title: "Threads/Components/ContentCard",
  component: ContentCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    badges:      [{ label: "Product", variant: "terra" }],
    title:       <>Why Jamaal has no <em>subscription</em></>,
    description: "On pricing honestly and respecting the people who pay you.",
    date:        "May 2026",
    href:        "#",
  },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComingSoon: Story = {
  args: {
    badges:      [{ label: "Apps & products", variant: "neutral" }],
    title:       "Next case study",
    description: "Reserved for the next apps & products engagement — same template, new client.",
    date:        "Coming soon",
    comingSoon:  true,
    href:        undefined,
  },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", maxWidth: "900px" }}>
      <ContentCard
        badges={[{ label: "Product", variant: "terra" }]}
        title={<>Why Jamaal has no <em>subscription</em></>}
        description="On pricing honestly and respecting the people who pay you."
        date="May 2026"
        href="#"
      />
      <ContentCard
        badges={[{ label: "Design", variant: "sage" }]}
        title="One design system for four platforms"
        description="How Threads tokens survive iOS, macOS, web, and watchOS."
        date="Mar 2026"
        href="#"
      />
      <ContentCard
        badges={[{ label: "Apps & products", variant: "neutral" }]}
        title="Next case study"
        description="Reserved for the next apps & products engagement."
        date="Coming soon"
        comingSoon
      />
    </div>
  ),
};
