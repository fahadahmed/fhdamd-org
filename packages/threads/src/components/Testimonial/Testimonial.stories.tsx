import type { Meta, StoryObj } from "@storybook/react-vite";
import { Testimonial } from "./Testimonial";

const meta = {
  title: "Threads/Components/Testimonial",
  component: Testimonial,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Testimonial>;

export default meta;
type Story = StoryObj<typeof meta>;

// Storybook's generated types require an `args` object on every story when the
// component's props are a discriminated union — `render` below supplies the
// real, variant-specific props directly, so this is a type-satisfying stand-in only.
const unusedArgs = { quote: "", attribution: "", description: "" };

export const Default: Story = {
  args: unusedArgs,
  render: () => (
    <Testimonial
      quote="Finally, a PDF tool that's honest about pricing. I pay only when I actually use it — no subscriptions, no surprises."
      attribution="Samia Akhtar · Senior Claims Consultant"
    />
  ),
};

export const Reserved: Story = {
  name: "Reserved (empty state)",
  args: unusedArgs,
  render: () => (
    <Testimonial
      reserved
      description="A quote from Rabi Akhtar at RZest Engineers goes here once confirmed — not written on their behalf."
    />
  ),
};

export const Grid: Story = {
  name: "PDF-Craft testimonial grid",
  parameters: { layout: "padded" },
  args: unusedArgs,
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--th-space-4)",
      }}
    >
      <Testimonial
        quote="Finally, a PDF tool that's honest about pricing. I pay only when I actually use it — no subscriptions, no surprises."
        attribution="Samia Akhtar · Senior Claims Consultant"
      />
      <Testimonial
        quote="The credit-based pay-per-use model is incredibly transparent. I know exactly what each action costs before I click."
        attribution="Brendan Lawrie · Partner, Big 4 Consultancy"
      />
      <Testimonial
        quote="Most PDF tools feel bloated. This one does exactly what it promises, charges fairly, and gets out of the way."
        attribution="Sean Kempen · Real Estate Agent"
      />
      <Testimonial
        quote="Clean interface, no learning curve. I merged and converted my files in seconds without reading a single guide."
        attribution="Patricia Widjojo · Paralegal"
      />
    </div>
  ),
};
