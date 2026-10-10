import type { Meta, StoryObj } from "@storybook/react-vite";
import { LanguageSwitch } from "./LanguageSwitch";

const meta = {
  title: "Threads/Components/LanguageSwitch",
  component: LanguageSwitch,
  parameters: { layout: "centered", a11y: { test: "error" } },
  tags: ["autodocs"],
  args: {
    languages: [
      { code: "en", label: "English" },
      { code: "ar", label: "العربية" },
    ],
  },
} satisfies Meta<typeof LanguageSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StartingOnArabic: Story = {
  args: { currentCode: "ar" },
};
