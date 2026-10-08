import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WaitlistForm from "./WaitlistForm";

const submitSignup = vi.fn();

vi.mock("../../utils/signup", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/signup")>()),
  submitSignup: (...args: unknown[]) => submitSignup(...args),
}));

function setup(props: Partial<React.ComponentProps<typeof WaitlistForm>> = {}) {
  return render(
    <WaitlistForm variant="hero" source="hero" submitLabel="Tell me when it's ready" {...props} />,
  );
}

async function fill(firstName: string, email: string) {
  const user = userEvent.setup();
  if (firstName) await user.type(screen.getByLabelText("First name"), firstName);
  if (email) await user.type(screen.getByLabelText("Email address"), email);
  return user;
}

describe("WaitlistForm", () => {
  beforeEach(() => submitSignup.mockReset().mockResolvedValue(undefined));
  afterEach(() => window.history.replaceState({}, "", "/"));

  it("renders a name field, an email field and the submit label", () => {
    setup({ note: "One email when it's ready." });
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tell me when it's ready" })).toBeInTheDocument();
    expect(screen.getByText("One email when it's ready.")).toBeInTheDocument();
  });

  it("includes a honeypot field that is hidden from people and assistive technology", () => {
    const { container } = setup();
    const trap = container.querySelector('input[name="company"]');
    expect(trap).toHaveAttribute("aria-hidden", "true");
    expect(trap).toHaveAttribute("tabindex", "-1");
    expect(trap).toHaveAttribute("autocomplete", "off");
  });

  it("sends whatever a bot types into the honeypot", async () => {
    const { container } = setup();
    const user = await fill("Sam", "sam@example.com");
    await user.type(container.querySelector('input[name="company"]') as HTMLElement, "Acme");
    await user.click(screen.getByRole("button", { name: /ready/ }));
    await waitFor(() => expect(submitSignup).toHaveBeenCalled());
    expect(submitSignup).toHaveBeenCalledWith({ firstName: "Sam", email: "sam@example.com", company: "Acme" }, "hero");
  });

  it("asks for a first name before submitting", async () => {
    setup();
    const user = await fill("", "sam@example.com");
    await user.click(screen.getByRole("button", { name: /ready/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Add your first name");
    expect(screen.getByLabelText("First name")).toHaveAttribute("aria-invalid", "true");
    expect(submitSignup).not.toHaveBeenCalled();
  });

  it("rejects an incomplete email address and clears the error when the field changes", async () => {
    setup();
    const user = await fill("Sam", "sam@");
    await user.click(screen.getByRole("button", { name: /ready/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That address looks incomplete.");
    await user.type(screen.getByLabelText("Email address"), "x");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("submits the signup with its source and confirms by name", async () => {
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("button", { name: /ready/ }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(submitSignup).toHaveBeenCalledWith({ firstName: "Sam", email: "sam@example.com", company: "" }, "hero");
    expect(screen.getByText("Thank you, Sam. You're on the list.")).toBeInTheDocument();
    expect(screen.getByText("We'll write to sam@example.com once, when there's something to open.")).toBeInTheDocument();
  });

  it("shows the shorter confirmation in the closing section", async () => {
    setup({ variant: "join", source: "join", submitLabel: "Join the list" });
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("button", { name: "Join the list" }));
    await screen.findByRole("status");
    expect(submitSignup).toHaveBeenCalledWith({ firstName: "Sam", email: "sam@example.com", company: "" }, "join");
    expect(screen.queryByText(/We'll write to/)).not.toBeInTheDocument();
  });

  it("shows the error when the signup fails and lets people try again", async () => {
    submitSignup.mockRejectedValueOnce(new Error("Signup isn't open yet. Please try again soon."));
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("button", { name: /ready/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Signup isn't open yet");
    expect(screen.getByRole("button", { name: /ready/ })).not.toBeDisabled();
  });

  it("falls back to a generic message for a non-Error failure", async () => {
    submitSignup.mockRejectedValueOnce("boom");
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("button", { name: /ready/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
  });

  it("shows the confirmation state for ?joined so the design can be reviewed", async () => {
    window.history.replaceState({}, "", "/?joined");
    setup();
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Thank you, Sam. You're on the list.")).toBeInTheDocument();
  });
});
