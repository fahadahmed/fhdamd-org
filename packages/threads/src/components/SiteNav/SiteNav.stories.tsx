import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteNav } from "./SiteNav";

const links = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools", active: true },
  { href: "/pricing", label: "Pricing" },
];

const secondaryLinks = [
  { href: "/", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

/** Example wordmark — in real usage, each app supplies its own brand markup. */
const ExampleWordmark = () => (
  <span style={{ fontFamily: "var(--th-font-serif)", fontWeight: 300, fontStyle: "italic", fontSize: "var(--th-text-lg)" }}>
    Acme<em style={{ fontStyle: "normal", color: "var(--th-color-accent)" }}>.</em>
  </span>
);

const meta = {
  title: "Threads/Site/SiteNav",
  component: SiteNav,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    brand: <ExampleWordmark />,
    brandLabel: "Acme home",
    links,
  },
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLinksAndCtas: Story = {
  name: "Links + Log in / Sign up",
  args: {
    ctas: [
      { href: "/signin", label: "Log in", variant: "ghost" },
      { href: "/signup", label: "Sign up", variant: "solid-ink" },
    ],
  },
};

export const WordmarkOnly: Story = {
  name: "Wordmark only, no links",
  args: { links: [] },
};

export const NoCta: Story = {
  name: "Links, no CTA",
  args: {
    links: secondaryLinks,
    ctas: [],
  },
};

/* ── Page frame preview ──────────────────────────────────────────────────── */

export const PageFrame: Story = {
  name: "In page context",
  render: () => (
    <div>
      <SiteNav
        brand={<ExampleWordmark />}
        brandLabel="Acme home"
        links={links}
        ctas={[
          { href: "/signin", label: "Log in", variant: "ghost" },
          { href: "/signup", label: "Sign up", variant: "solid-ink" },
        ]}
      />
      <div
        style={{
          padding: "var(--th-space-12) var(--th-space-6)",
          minHeight: "320px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--th-font-serif)",
          fontWeight: 300,
          fontSize: "var(--th-text-3xl)",
          color: "var(--th-color-text-3)",
          letterSpacing: "-0.02em",
        }}
      >
        Page content sits below the sticky nav.
      </div>
    </div>
  ),
};
