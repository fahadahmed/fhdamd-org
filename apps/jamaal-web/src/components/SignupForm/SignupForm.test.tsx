import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignupError } from "../../utils/signup";
import SignupForm from "./SignupForm";

const submitSignup = vi.fn();
const track = vi.fn();

vi.mock("../../utils/signup", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/signup")>()),
  submitSignup: (...args: unknown[]) => submitSignup(...args),
}));
vi.mock("../../lib/analytics", () => ({ track: (event: unknown) => track(event) }));

function setup(props: Partial<React.ComponentProps<typeof SignupForm>> = {}) {
  return render(<SignupForm variant="hero" stage="waitlist" source="hero" {...props} />);
}

async function fill(firstName: string, email: string) {
  const user = userEvent.setup();
  if (firstName) await user.type(screen.getByLabelText("First name"), firstName);
  if (email) await user.type(screen.getByLabelText("Email address"), email);
  return user;
}

const submitButton = () => screen.getByRole("button", { name: /waitlist|invite/i });

describe("SignupForm: waitlist", () => {
  beforeEach(() => {
    submitSignup.mockReset().mockResolvedValue("added");
    track.mockReset();
  });
  afterEach(() => window.history.replaceState({}, "", "/"));

  it("renders a name field, an email field, the button and the small print", () => {
    setup();
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join the waitlist" })).toBeInTheDocument();
    expect(screen.getByText(/Two emails at most/)).toBeInTheDocument();
  });

  it("does not ask about devices before the beta", () => {
    setup();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("counts one view when it appears", () => {
    setup();
    expect(track).toHaveBeenCalledWith({ name: "signup_view" });
  });

  it("asks for a first name before submitting", async () => {
    setup();
    const user = await fill("", "sam@example.com");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Add your first name");
    expect(screen.getByLabelText("First name")).toHaveAttribute("aria-invalid", "true");
    expect(submitSignup).not.toHaveBeenCalled();
  });

  it("rejects an incomplete address and clears the error when the field changes", async () => {
    setup();
    const user = await fill("Sam", "sam@");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("That address looks incomplete.");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true");
    await user.type(screen.getByLabelText("Email address"), "x");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("submits the signup, tracks it and confirms by name", async () => {
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(submitButton());
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(submitSignup).toHaveBeenCalledWith({ firstName: "Sam", email: "sam@example.com", devices: undefined, company: "" }, "hero");
    expect(track).toHaveBeenCalledWith({ name: "signup_submit" });
    expect(track).toHaveBeenCalledWith({ name: "signup_result", status: "added" });
    expect(screen.getByText("Thank you, Sam. You're on the list.")).toBeInTheDocument();
    expect(screen.getByText("We'll write to sam@example.com once, when there's something to open.")).toBeInTheDocument();
  });

  it("shows 'sending' on the button while the request is in flight", async () => {
    let finish: (value: string) => void = () => {};
    submitSignup.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(submitButton());
    expect(await screen.findByRole("button", { name: "Adding you…" })).toBeDisabled();
    finish("added");
    await screen.findByRole("status");
  });

  it("says so when the address is already on the list", async () => {
    submitSignup.mockResolvedValueOnce("exists");
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(submitButton());
    expect(await screen.findByText("Sam, you're already on the list.")).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith({ name: "signup_result", status: "exists" });
  });

  it("sends the honeypot value so the server can drop a bot", async () => {
    const { container } = setup();
    const user = await fill("Sam", "sam@example.com");
    await user.type(container.querySelector('input[name="company"]') as HTMLInputElement, "Acme");
    await user.click(submitButton());
    expect(submitSignup).toHaveBeenCalledWith(expect.objectContaining({ company: "Acme" }), "hero");
  });

  it("keeps the honeypot out of the tab order and away from screen readers", () => {
    const { container } = setup();
    const field = container.querySelector('input[name="company"]') as HTMLInputElement;
    expect(field).toHaveAttribute("tabindex", "-1");
    expect(field).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the server's explanation against the field it is about", async () => {
    submitSignup.mockRejectedValueOnce(new SignupError("That address looks incomplete.", "email"));
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("That address looks incomplete.");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true");
    expect(track).toHaveBeenCalledWith({ name: "signup_result", status: "error" });
  });

  it("shows a general error and lets people try again", async () => {
    submitSignup.mockRejectedValueOnce(new Error("Something went wrong. Please try again."));
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(submitButton()).not.toBeDisabled();
    expect(screen.getByLabelText("First name")).not.toHaveAttribute("aria-invalid");
  });

  it("falls back to a generic message for a non-Error failure", async () => {
    submitSignup.mockRejectedValueOnce("boom");
    setup();
    const user = await fill("Sam", "sam@example.com");
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
  });

  it("uses the deep tone and a centred layout in the join section", () => {
    const { container } = setup({ variant: "join", source: "join" });
    expect(container.firstElementChild?.className).toMatch(/deep/);
    expect(container.firstElementChild?.className).toMatch(/centred/);
  });

  it.each([
    ["?joined", "Thank you, Sam. You're on the list."],
    ["?joined=invited", "Thank you, Sam. Your invite is on its way."],
    ["?joined=exists", "Sam, you're already on the list."],
  ])("shows the confirmation for %s so the design can be reviewed", async (query, title) => {
    window.history.replaceState({}, "", `/${query}`);
    setup();
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(track).not.toHaveBeenCalledWith({ name: "signup_view" });
  });
});

describe("SignupForm: beta", () => {
  beforeEach(() => {
    submitSignup.mockReset().mockResolvedValue("invited");
    track.mockReset();
  });

  it("asks which devices they will test on, with iPhone chosen to start", () => {
    setup({ stage: "testflight" });
    expect(screen.getByRole("group", { name: "I'll test on" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "iPhone" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "iPad" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Mac" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Send my TestFlight invite" })).toBeInTheDocument();
    expect(screen.getByText(/device you'll test on/)).toBeInTheDocument();
  });

  it("needs at least one device", async () => {
    setup({ stage: "testflight" });
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("checkbox", { name: "iPhone" }));
    await user.click(screen.getByRole("button", { name: /invite/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Choose at least one device to test on.");
    expect(screen.getByRole("checkbox", { name: "iPhone" })).toHaveAttribute("aria-invalid", "true");
    expect(submitSignup).not.toHaveBeenCalled();
  });

  it("sends the chosen devices and says the invite is on its way, with the TestFlight steps", async () => {
    setup({ stage: "testflight" });
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("checkbox", { name: "Mac" }));
    await user.click(screen.getByRole("button", { name: /invite/ }));
    await screen.findByRole("status");
    expect(submitSignup).toHaveBeenCalledWith(expect.objectContaining({ devices: ["iphone", "mac"] }), "hero");
    expect(screen.getByText("Thank you, Sam. Your invite is on its way.")).toBeInTheDocument();
    expect(screen.getByText("Install TestFlight from the App Store.")).toBeInTheDocument();
    expect(screen.getByText("Tap View in TestFlight, then Install.")).toBeInTheDocument();
  });

  it("shows 'sending your invite' while it waits", async () => {
    let finish: (value: string) => void = () => {};
    submitSignup.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    setup({ stage: "testflight" });
    const user = await fill("Sam", "sam@example.com");
    await user.click(screen.getByRole("button", { name: /invite/ }));
    expect(await screen.findByRole("button", { name: "Sending your invite…" })).toBeDisabled();
    finish("invited");
    await screen.findByRole("status");
  });
});
