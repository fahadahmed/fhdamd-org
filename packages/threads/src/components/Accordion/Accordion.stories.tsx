import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from "./Accordion";

const pdfCraftFaq = [
  {
    question: "What is Riqa?",
    answer:
      "Riqa is a pay-per-use PDF tool. You buy a pack of credits and spend them on individual operations — merging, converting, protecting, and more. No subscriptions, no monthly charges, credits never expire.",
  },
  {
    question: "How does the credit system work?",
    answer:
      "Each operation costs a fixed number of credits, shown clearly before you confirm. Merge or convert costs 2 credits; protect or unlock costs 4. Credits are only deducted on successful completion.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No. Credits never expire. Buy a pack and use them at your own pace — tomorrow or six months from now.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Your files are processed on-demand and not stored after the operation completes. We do not retain, index, or access your documents. All transfers use HTTPS encryption.",
  },
  {
    question: "Can I use Riqa on mobile?",
    answer:
      "Yes. Riqa is fully responsive and works on any device. No app installation required — just open it in your browser.",
  },
  {
    question: "What if I run out of credits mid-operation?",
    answer:
      "If you don't have enough credits, you'll be prompted to top up before continuing. Credits are only deducted on successful completion — never on failed operations.",
  },
];

const meta = {
  title: "Threads/Components/Accordion",
  component: Accordion,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    defaultOpenIndex: { control: "number" },
  },
  args: {
    items: pdfCraftFaq,
    defaultOpenIndex: 0,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoneOpen: Story = {
  name: "None open by default",
  args: { defaultOpenIndex: -1 },
};

export const MaxWidth: Story = {
  name: "With max-width constraint (FAQ page layout)",
  render: () => (
    <div style={{ maxWidth: "680px" }}>
      <Accordion items={pdfCraftFaq} defaultOpenIndex={0} />
    </div>
  ),
};
