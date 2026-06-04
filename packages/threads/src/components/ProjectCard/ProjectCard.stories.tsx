import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectCard } from "./ProjectCard";

const PdfIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);

const meta = {
  title: "Threads/Components/ProjectCard",
  component: ProjectCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    accentColor: { control: "radio", options: ["terra", "sage", "ink"] },
  },
  args: {
    name:        "Jamaal",
    description: "Privacy-first daily planning for iOS.",
    accentColor: "terra",
    jamaalIcon:  true,
    tags:        ["SwiftUI", "SwiftData"],
    badge:       { label: "In dev", variant: "terra" },
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Individual cards ────────────────────────────────────────────────────── */

export const Jamaal: Story = {
  args: {
    eyebrow:     "iOS app · SwiftUI",
    name:        "Jamaal",
    description: "Privacy-first daily planning for iOS. One intelligent list, ordered each evening by a deterministic rules engine. No projects, no kanban — just the right amount of the right things. One-time purchase, $9.99.",
    jamaalIcon:  true,
    accentColor: "terra",
    tags:        ["SwiftUI", "SwiftData", "Rules engine"],
    badge:       { label: "In dev", variant: "terra" },
    href:        "/jamaal",
  },
};

export const PdfCraft: Story = {
  name: "PDF-Craft",
  args: {
    eyebrow:     "SaaS · Pay-per-use",
    name:        <>PDF-<em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>Craft</em></>,
    description: "Pay-per-use PDF operations — merge, split, compress, encrypt, convert, sign, and AI summarisation. Credits, no subscription.",
    icon:        <PdfIcon />,
    accentColor: "sage",
    pricingPills: [
      { price: "$2.99", label: "10 credits" },
      { price: "$4.99", label: "20 credits" },
      { price: "$9.99", label: "50 credits" },
    ],
    tags:  ["Astro", "Firebase", "Stripe"],
    badge: { label: "In dev", variant: "terra" },
    href:  "/pdf-craft",
  },
};

export const Threads: Story = {
  args: {
    eyebrow:     "Design system · Multi-platform",
    name:        "Threads",
    description: "Earthy ceramic token system powering Jamaal, PDF-Craft, and this site. One set of decisions that works across iOS, macOS, web, and watchOS.",
    icon:        <ThreadsIcon />,
    accentColor: "ink",
    tags:        ["CSS tokens", "iOS", "Web", "macOS"],
    badge:       { label: "System", variant: "neutral" },
  },
};

/* ── fhdamd projects grid ────────────────────────────────────────────────── */

export const FhdamdGrid: Story = {
  name: "fhdamd.dev projects grid",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ padding: "var(--th-space-8)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px",
        }}
      >
        <ProjectCard
          eyebrow="iOS app · SwiftUI"
          name="Jamaal"
          description="Privacy-first daily planning for iOS. One intelligent list, ordered each evening by a deterministic rules engine."
          jamaalIcon
          accentColor="terra"
          tags={["SwiftUI", "SwiftData", "Rules engine"]}
          badge={{ label: "In dev", variant: "terra" }}
          href="/jamaal"
        />
        <ProjectCard
          eyebrow="SaaS · Pay-per-use"
          name={<>PDF-<em style={{ fontStyle: "italic", color: "var(--th-color-sage-text)" }}>Craft</em></>}
          description="Pay-per-use PDF operations — merge, split, compress, encrypt, convert, sign, and AI summarisation."
          icon={<PdfIcon />}
          accentColor="sage"
          pricingPills={[
            { price: "$2.99", label: "10 credits" },
            { price: "$4.99", label: "20 credits" },
            { price: "$9.99", label: "50 credits" },
          ]}
          tags={["Astro", "Firebase", "Stripe"]}
          badge={{ label: "In dev", variant: "terra" }}
          href="/pdf-craft"
        />
        <ProjectCard
          eyebrow="Design system · Multi-platform"
          name="Threads"
          description="Earthy ceramic token system powering Jamaal, PDF-Craft, and this site. One set of decisions that works across iOS, macOS, web, and watchOS."
          icon={<ThreadsIcon />}
          accentColor="ink"
          tags={["CSS tokens", "iOS", "Web", "macOS"]}
          badge={{ label: "System", variant: "neutral" }}
        />
      </div>
    </div>
  ),
};
