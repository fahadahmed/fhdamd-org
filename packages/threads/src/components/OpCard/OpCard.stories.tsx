import type { Meta, StoryObj } from "@storybook/react-vite";
import { OpCard } from "./OpCard";

/* ── Icon helpers ────────────────────────────────────────────────────────── */
const MergeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3" />
    <path d="M15 3H9l-1 3h8l-1-3z" />
    <path d="M12 11v6M9 14l3 3 3-3" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const SplitIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const AiIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

/* ── Meta ────────────────────────────────────────────────────────────────── */
const meta = {
  title: "Threads/Components/OpCard",
  component: OpCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    iconVariant: {
      control: "radio",
      options: ["terra", "sage", "muted"],
    },
    status: {
      control: "radio",
      options: ["live", "soon"],
    },
  },
  args: {
    name: "Merge PDFs",
    description: "Combine multiple PDF documents into a single file — in the right order, every time.",
    credits: 2,
    href: "#",
    icon: <MergeIcon />,
    iconVariant: "terra",
    status: "live",
    ctaLabel: "Merge",
  },
} satisfies Meta<typeof OpCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Individual stories ──────────────────────────────────────────────────── */

export const LiveTerra: Story = {
  name: "Live — terra icon",
  args: {
    name: "Merge PDFs",
    description: "Combine multiple PDF documents into a single file — in the right order, every time.",
    credits: 2,
    href: "#",
    icon: <MergeIcon />,
    iconVariant: "terra",
    ctaLabel: "Merge",
  },
};

export const LiveSage: Story = {
  name: "Live — sage icon",
  args: {
    name: "Image to PDF",
    description: "Convert JPG & PNG images to clean PDF format instantly. No quality loss.",
    credits: 2,
    href: "#",
    icon: <ImageIcon />,
    iconVariant: "sage",
    ctaLabel: "Convert",
  },
};

export const LiveHighCredits: Story = {
  name: "Live — 4 credits",
  args: {
    name: "Protect PDF",
    description: "Secure your PDF from unauthorised use with a password.",
    credits: 4,
    href: "#",
    icon: <LockIcon />,
    iconVariant: "terra",
    ctaLabel: "Protect",
  },
};

export const ComingSoon: Story = {
  name: "Coming soon",
  args: {
    name: "Split PDF",
    description: "Divide a PDF into separate pages or custom page ranges.",
    credits: 3,
    icon: <SplitIcon />,
    iconVariant: "muted",
    status: "soon",
  },
};

export const ComingSoonAI: Story = {
  name: "Coming soon — AI",
  args: {
    name: "AI Summary",
    description: "Get a concise overview or detailed breakdown of any document using AI.",
    credits: 5,
    icon: <AiIcon />,
    iconVariant: "muted",
    status: "soon",
  },
};

/* ── Full Riqa grid ─────────────────────────────────────────────────── */

export const FullGrid: Story = {
  name: "Riqa operations grid",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <OpCard
            name="Merge PDFs"
            description="Combine multiple PDF documents into a single file — in the right order, every time."
            credits={2}
            href="#"
            icon={<MergeIcon />}
            iconVariant="terra"
            ctaLabel="Merge"
          />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <OpCard
            name="Image to PDF"
            description="Convert JPG & PNG images to clean PDF format instantly. No quality loss."
            credits={2}
            href="#"
            icon={<ImageIcon />}
            iconVariant="sage"
            ctaLabel="Convert"
          />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <OpCard
            name="Protect PDF"
            description="Secure your PDF from unauthorised use with a password."
            credits={4}
            href="#"
            icon={<LockIcon />}
            iconVariant="terra"
            ctaLabel="Protect"
          />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <OpCard
            name="Unlock PDF"
            description="Remove passwords and restrictions from protected documents."
            credits={4}
            href="#"
            icon={<UnlockIcon />}
            iconVariant="sage"
            ctaLabel="Unlock"
          />
        </div>
        <OpCard
          name="Split PDF"
          description="Divide a PDF into separate pages or custom page ranges."
          credits={3}
          icon={<SplitIcon />}
          iconVariant="muted"
          status="soon"
        />
        <OpCard
          name="AI Summary"
          description="Get a concise overview or detailed breakdown of any document using AI."
          credits={5}
          icon={<AiIcon />}
          iconVariant="muted"
          status="soon"
        />
      </div>
    </div>
  ),
};
