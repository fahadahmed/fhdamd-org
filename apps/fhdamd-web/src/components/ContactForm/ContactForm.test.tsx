import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import type { SelectOption } from "../../data/contactOptions";

const interestOptions: SelectOption[] = [
  { value: "website", label: "Custom website" },
];
const timelineOptions: SelectOption[] = [
  { value: "asap", label: "As soon as possible" },
];

describe("ContactForm", () => {
  it("renders the form note passed in as a prop", () => {
    render(
      <ContactForm
        formNote="No spam, ever."
        interestOptions={interestOptions}
        timelineOptions={timelineOptions}
      />,
    );
    expect(screen.getByText("No spam, ever.")).toBeInTheDocument();
  });

  it("shows the success panel and hides the form after submitting", async () => {
    const user = userEvent.setup();
    render(
      <ContactForm
        formNote="No spam, ever."
        interestOptions={interestOptions}
        timelineOptions={timelineOptions}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(
      screen.getByLabelText("Tell me about your project"),
      "A new website, please.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Message sent.");
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("does not submit when required fields are left empty", async () => {
    const user = userEvent.setup();
    render(
      <ContactForm
        formNote="No spam, ever."
        interestOptions={interestOptions}
        timelineOptions={timelineOptions}
      />,
    );

    await user.click(screen.getByRole("button", { name: /send message/i }));

    // jsdom does honor the native `required` constraint on form submit,
    // so the form should still be visible instead of the success panel.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });
});
