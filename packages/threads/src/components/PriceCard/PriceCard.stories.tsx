import type { Meta, StoryObj } from "@storybook/react-vite";
import { PriceCard } from "./PriceCard";

const starterOps = [
  { label: "Merge PDFs",      tag: "5 merges" },
  { label: "Image to PDF",    tag: "5 converts" },
  { label: "Protect / Unlock", tag: "2 ops" },
];

const popularOps = [
  { label: "Merge PDFs",      tag: "10 merges" },
  { label: "Image to PDF",    tag: "10 converts" },
  { label: "Protect / Unlock", tag: "5 ops" },
];

const proOps = [
  { label: "Merge PDFs",      tag: "25 merges" },
  { label: "Image to PDF",    tag: "25 converts" },
  { label: "Protect / Unlock", tag: "12 ops" },
];

const meta = {
  title: "Threads/Components/PriceCard",
  component: PriceCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    featured:    { control: "boolean" },
    ctaVariant: {
      control: "select",
      options: ["ghost", "solid-terra", "solid-ink", "outline"],
    },
  },
  args: {
    credits:    20,
    price:      "$4.99",
    priceNote:  "$0.25 per credit · save 17%",
    featured:   true,
    operations: popularOps,
    cta:        { href: "/signup", label: "Buy credits" },
  },
} satisfies Meta<typeof PriceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Individual tiers ────────────────────────────────────────────────────── */

export const Starter: Story = {
  args: {
    credits:    10,
    price:      "$2.99",
    priceNote:  "$0.30 per credit",
    featured:   false,
    operations: starterOps,
    cta:        { href: "/signup", label: "Get started" },
  },
};

export const Popular: Story = {
  args: {
    credits:      20,
    price:        "$4.99",
    priceNote:    "$0.25 per credit · save 17%",
    featured:     true,
    featuredLabel: "Most popular",
    operations:   popularOps,
    cta:          { href: "/signup", label: "Buy credits" },
  },
};

export const Pro: Story = {
  args: {
    credits:    50,
    price:      "$9.99",
    priceNote:  "$0.20 per credit · save 33%",
    featured:   false,
    operations: proOps,
    cta:        { href: "/signup", label: "Buy credits" },
  },
};

/* ── PDF-Craft pricing grid ──────────────────────────────────────────────── */

export const PdfCraftGrid: Story = {
  name: "PDF-Craft pricing grid",
  parameters: { layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "var(--th-space-4)",
        maxWidth: "880px",
      }}
    >
      <PriceCard
        credits={10}
        price="$2.99"
        priceNote="$0.30 per credit"
        operations={starterOps}
        cta={{ href: "/signup", label: "Get started" }}
      />
      <PriceCard
        credits={20}
        price="$4.99"
        priceNote="$0.25 per credit · save 17%"
        featured
        operations={popularOps}
        cta={{ href: "/signup", label: "Buy credits" }}
      />
      <PriceCard
        credits={50}
        price="$9.99"
        priceNote="$0.20 per credit · save 33%"
        operations={proOps}
        cta={{ href: "/signup", label: "Buy credits" }}
      />
    </div>
  ),
};
