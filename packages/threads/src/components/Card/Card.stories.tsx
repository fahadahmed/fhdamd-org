import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardBody, CardTitle } from "./Card";

const meta = {
  title: "Threads/Components/Card",
  component: Card,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "elevated", "interactive", "inverse"],
    },
    accentBar: {
      control: "select",
      options: ["none", "top", "start"],
    },
    accentColor: {
      control: "radio",
      options: ["terra", "sage"],
    },
    as: {
      control: "select",
      options: ["div", "article", "section"],
    },
  },
  args: {
    variant: "default",
    accentBar: "none",
    accentColor: "terra",
    children: "Card content",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Individual variants ─────────────────────────────────────────────────── */

export const Default: Story = {
  args: {
    children: (
      <>
        <CardTitle>Default card</CardTitle>
        <CardBody>
          Surface 1 background, border-default, shadow-xs. Standard container
          for most content.
        </CardBody>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
    children: (
      <>
        <CardTitle>Elevated</CardTitle>
        <CardBody>
          Larger shadow. Use for floating panels or modal-adjacent content.
        </CardBody>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: "interactive",
    "aria-label": "Interactive card example",
    children: (
      <>
        <CardTitle>Interactive — hover me</CardTitle>
        <CardBody>
          Lifts on hover and focus. Use when the whole card is a navigation
          target.
        </CardBody>
      </>
    ),
  },
};

export const Inverse: Story = {
  args: {
    variant: "inverse",
    children: (
      <>
        <CardTitle>Inverse — dark surface</CardTitle>
        <CardBody>
          Used for featured pricing, hero CTAs, and the about strip. Text tokens
          auto-adapt.
        </CardBody>
      </>
    ),
  },
};

export const AccentTopTerra: Story = {
  name: "Accent top — terra",
  args: {
    accentBar: "top",
    accentColor: "terra",
    children: (
      <>
        <CardTitle>Terracotta accent bar</CardTitle>
        <CardBody>3px bar at block-start. For featured or primary cards.</CardBody>
      </>
    ),
  },
};

export const AccentTopSage: Story = {
  name: "Accent top — sage",
  args: {
    accentBar: "top",
    accentColor: "sage",
    children: (
      <>
        <CardTitle>Sage accent bar</CardTitle>
        <CardBody>Sage variant for success states or second-row items.</CardBody>
      </>
    ),
  },
};

export const AccentStart: Story = {
  name: "Accent start (inline)",
  args: {
    accentBar: "start",
    accentColor: "terra",
    children: (
      <>
        <CardTitle>Inline accent</CardTitle>
        <CardBody>
          Vertical bar at the inline-start edge. Flips automatically in RTL.
        </CardBody>
      </>
    ),
  },
};

/* ── Showcase ────────────────────────────────────────────────────────────── */

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "16px",
      }}
    >
      <Card>
        <CardTitle>Default</CardTitle>
        <CardBody>Shadow-xs, border-default.</CardBody>
      </Card>
      <Card variant="elevated">
        <CardTitle>Elevated</CardTitle>
        <CardBody>Shadow-md.</CardBody>
      </Card>
      <Card variant="interactive" aria-label="Interactive card">
        <CardTitle>Interactive</CardTitle>
        <CardBody>Hover/focus lifts.</CardBody>
      </Card>
      <Card accentBar="top" accentColor="terra">
        <CardTitle>Accent top — terra</CardTitle>
        <CardBody>3px terracotta bar.</CardBody>
      </Card>
      <Card accentBar="top" accentColor="sage">
        <CardTitle>Accent top — sage</CardTitle>
        <CardBody>3px sage bar.</CardBody>
      </Card>
      <Card variant="inverse">
        <CardTitle>Inverse</CardTitle>
        <CardBody>Dark surface.</CardBody>
      </Card>
    </div>
  ),
};

export const RTL: Story = {
  name: "RTL — Arabic",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "16px",
      }}
      dir="rtl"
    >
      <Card accentBar="start" accentColor="terra">
        <CardTitle>بطاقة المشروع</CardTitle>
        <CardBody>الشريط الجانبي يتقلب تلقائيًا في وضع RTL.</CardBody>
      </Card>
      <Card variant="interactive" aria-label="بطاقة تفاعلية">
        <CardTitle>تفاعلية</CardTitle>
        <CardBody>ترتفع عند التحويم أو التركيز.</CardBody>
      </Card>
    </div>
  ),
};
