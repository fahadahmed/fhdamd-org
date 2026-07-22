import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmbedCard } from "./EmbedCard";

const meta = {
  title: "Threads/Components/EmbedCard",
  component: EmbedCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof EmbedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Youtube: Story = {
  args: {
    type: "youtube",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "YouTube video player",
  },
};

export const Tweet: Story = {
  args: {
    type: "tweet",
    authorName: "Fahad Ahmed",
    handle: "@fahadahmed · Jul 2026",
    text: "Checked-in Mermaid diagrams next to the code they describe. Docs review in the same PR as the change.",
    foot: "142 reposts · 890 likes",
  },
};

export const Instagram: Story = {
  args: {
    type: "instagram",
    accountName: "fhdamd.dev",
    caption: "Whiteboard session — the messy version before it became a Mermaid diagram.",
  },
};
