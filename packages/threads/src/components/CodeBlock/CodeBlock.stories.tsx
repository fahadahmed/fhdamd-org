import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "./CodeBlock";

const meta = {
  title: "Threads/Components/CodeBlock",
  component: CodeBlock,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { children: "" },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CodeBlock filename="prefill-handler.ts">
{`export async function handlePrefillRequest(applicationId: string) {
  const application = await getApplication(applicationId);
  const decision = await PrefillClient.evaluate(application);
  return decision;
}`}
    </CodeBlock>
  ),
};

export const NoFilename: Story = {
  render: () => (
    <CodeBlock>{`pnpm --filter @fhdamd/threads test`}</CodeBlock>
  ),
};
