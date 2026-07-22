import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenshotFigure } from "./ScreenshotFigure";

const meta = {
  title: "Threads/Components/ScreenshotFigure",
  component: ScreenshotFigure,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof ScreenshotFigure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  args: { caption: "Homepage screenshot — swap in the live capture" },
};

export const WithImage: Story = {
  args: {
    src: "https://placehold.co/1200x675",
    alt: "Homepage screenshot",
    caption: "The RZest Engineers homepage",
  },
};
