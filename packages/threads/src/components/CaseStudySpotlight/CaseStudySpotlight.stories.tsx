import type { Meta, StoryObj } from "@storybook/react-vite";
import { CaseStudySpotlight } from "./CaseStudySpotlight";
import { Button } from "../Button/Button";

const meta = {
  title: "Threads/Components/CaseStudySpotlight",
  component: CaseStudySpotlight,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    eyebrow:     "Custom website · Structural engineering · New Delhi",
    title:       <>RZest Engineers — <em>a Presence build in under three weeks</em></>,
    description: "A brochure-and-portfolio site for a New Delhi structural engineering firm — a filterable project portfolio, DatoCMS-backed case study pages, and full OG/meta implementation, built on Astro and delivered in under three weeks.",
    tags:        ["Astro", "DatoCMS", "Custom website"],
    stats: [
      { value: <>&lt;3<em>wks</em></>, label: "Discovery to launch" },
      { value: "0", label: "Dev tickets to publish a new project since launch" },
      { value: <>100<em>%</em></>, label: "Pages with OG/meta coverage" },
    ],
    actions: (
      <>
        <Button variant="solid-ink">Read the case study</Button>
        <Button variant="ghost">View all case studies</Button>
      </>
    ),
  },
} satisfies Meta<typeof CaseStudySpotlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoTags: Story = {
  args: { tags: undefined },
};
