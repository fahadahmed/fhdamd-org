import type { Meta, StoryObj } from "@storybook/react-vite";
import { EssayRow } from "./EssayRow";

const meta = {
  title: "Threads/EssayRow",
  component: EssayRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    category: { control: "radio", options: ["design", "product", "dev"] },
  },
  args: {
    date:     "May 2026",
    title:    "Why Jamaal has no subscription",
    subtitle: "On pricing honestly and respecting the people who pay you",
    category: "product",
    href:     "#",
    first:    true,
  },
} satisfies Meta<typeof EssayRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Product: Story = { args: { category: "product" } };
export const Design:  Story = { args: { category: "design",  title: "One design system for four platforms", subtitle: "How Threads tokens survive iOS, macOS, web, and watchOS" } };
export const Dev:     Story = { args: { category: "dev",     title: "SwiftData after six months in production", subtitle: "The real-world gaps the WWDC sessions don't mention" } };

export const WritingList: Story = {
  name: "fhdamd.dev writing list",
  render: () => (
    <div>
      <EssayRow first date="May 2026" title="Why Jamaal has no subscription"           subtitle="On pricing honestly and respecting the people who pay you"                     category="product" href="#" />
      <EssayRow       date="Apr 2026" title="Pay-per-use is underrated for small SaaS" subtitle="What building PDF-Craft taught me about pricing models"                        category="product" href="#" />
      <EssayRow       date="Mar 2026" title="One design system for four platforms"      subtitle="How Threads tokens survive iOS, macOS, web, and watchOS"                      category="design"  href="#" />
      <EssayRow       date="Jan 2026" title="Deterministic rules before you reach for a model" subtitle="Jamaal's rules engine — and why v1 has no ML at all"               category="dev"     href="#" />
      <EssayRow       date="Nov 2025" title="SwiftData after six months in production"  subtitle="The real-world gaps the WWDC sessions don't mention"                         category="dev"     href="#" />
    </div>
  ),
};
