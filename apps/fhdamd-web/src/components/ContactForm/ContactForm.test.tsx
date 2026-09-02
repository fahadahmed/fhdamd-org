import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import type { SelectOption } from "../../data/contactOptions";

const interestOptions: SelectOption[] = [
  { value: "website", label: "Custom website" },
];
const timelineOptions: SelectOption[] = [
  { value: "asap", label: "As soon as possible" },
];

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Jane Doe");
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
  await user.type(
    screen.getByLabelText("Tell me about your project"),
    "A new website, please.",
  );
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("shows the success panel after a successful submission", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const user = userEvent.setup();
    render(
      <ContactForm
        formNote="No spam, ever."
        interestOptions={interestOptions}
        timelineOptions={timelineOptions}
      />,
    );

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Message sent.");
    });
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows an error and keeps the form when the server reports failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: "Something broke." }), {
        status: 500,
      }),
    );
    const user = userEvent.setup();
    render(
      <ContactForm
        formNote="No spam, ever."
        interestOptions={interestOptions}
        timelineOptions={timelineOptions}
      />,
    );

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something broke.");
    });
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows a generic error when the request itself fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    render(
      <ContactForm
        formNote="No spam, ever."
        interestOptions={interestOptions}
        timelineOptions={timelineOptions}
      />,
    );

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/failed to send message/i);
    });
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
    expect(fetch).not.toHaveBeenCalled();
  });
});
