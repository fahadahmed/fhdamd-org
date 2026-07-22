import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReadingProgressBar } from "./ReadingProgressBar";

const meta = {
  title: "Threads/Components/ReadingProgressBar",
  component: ReadingProgressBar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { targetRef: { current: null } },
} satisfies Meta<typeof ReadingProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div>
        <ReadingProgressBar targetRef={ref} />
        <div ref={ref} style={{ padding: "40px", maxWidth: "720px", margin: "40px auto" }}>
          <p>Scroll this story's canvas to see the progress bar fill in as you move through the content below.</p>
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i}>
              Paragraph {i + 1}. Every architecture diagram I&apos;ve inherited on a client engagement has been
              wrong by the time I opened it.
            </p>
          ))}
        </div>
      </div>
    );
  },
};
