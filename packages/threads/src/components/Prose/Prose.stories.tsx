import type { Meta, StoryObj } from "@storybook/react-vite";
import { Prose } from "./Prose";

const meta = {
  title: "Threads/Components/Prose",
  component: Prose,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Prose>
      <h2>The problem with <em>docs</em></h2>
      <p>Every architecture diagram I've inherited on a client engagement has been wrong by the time I opened it. Not maliciously — just quietly out of date.</p>
      <blockquote>If a diagram can't be reviewed in the same pull request as the code it describes, it will eventually lie to you.</blockquote>
      <h3>A worked example</h3>
      <p>Here's the flow definition that documents the prefill sequence. It lives at <code>docs/prefill-sequence.mmd</code>, next to the handler it describes.</p>
      <ul>
        <li>Keep diagrams as text, in the same repo as the code they describe.</li>
        <li>Review diagram changes in the same pull request as the behaviour change.</li>
      </ul>
    </Prose>
  ),
};
