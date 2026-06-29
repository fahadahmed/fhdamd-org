import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileDropzone } from "./FileDropzone";

const meta = {
  title: "Threads/Forms/FileDropzone",
  component: FileDropzone,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label: "Upload PDF",
    hint: "PDF up to 50 MB",
    accept: ".pdf",
  },
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Multiple: Story = { args: { label: "Upload PDFs", hint: "Multiple files accepted. PDFs up to 50 MB each.", multiple: true } };
export const WithError: Story = { args: { error: "File type not supported. Please upload a PDF." } };
export const Disabled: Story  = { args: { disabled: true } };

export const PdfCraftUpload: Story = {
  name: "PDF-Craft — merge upload",
  args: {
    label: "Upload files to merge",
    hint: "Select 2 or more PDFs. Max 50 MB each.",
    accept: ".pdf",
    multiple: true,
    onFiles: (files) => console.log("Files selected:", files.map((f) => f.name)),
  },
};
