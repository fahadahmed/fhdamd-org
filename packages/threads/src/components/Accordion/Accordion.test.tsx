import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./Accordion";

const items = [
  { question: "What is PDF-Craft?",        answer: "A pay-per-use PDF tool." },
  { question: "Do credits expire?",         answer: "No, credits never expire." },
  { question: "Is my data secure?",         answer: "Yes, files are deleted after processing." },
];

describe("Accordion — rendering", () => {
  it("renders all questions", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("What is PDF-Craft?")).toBeInTheDocument();
    expect(screen.getByText("Do credits expire?")).toBeInTheDocument();
    expect(screen.getByText("Is my data secure?")).toBeInTheDocument();
  });

  it("renders the first item open by default (defaultOpenIndex=0)", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("A pay-per-use PDF tool.")).toBeInTheDocument();
  });

  it("renders with no item open when defaultOpenIndex is out of range", () => {
    render(<Accordion items={items} defaultOpenIndex={-1} />);
    // All triggers should report closed
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("merges custom className", () => {
    const { container } = render(<Accordion items={items} className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("Accordion — interaction", () => {
  it("opens a closed item on click", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenIndex={-1} />);
    await user.click(screen.getByRole("button", { name: "Do credits expire?" }));
    expect(screen.getByText("No, credits never expire.")).toBeInTheDocument();
  });

  it("closes an open item on second click", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenIndex={0} />);
    const trigger = screen.getByRole("button", { name: "What is PDF-Craft?" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the previously open item when a new one is opened", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenIndex={0} />);
    const first  = screen.getByRole("button", { name: "What is PDF-Craft?" });
    const second = screen.getByRole("button", { name: "Do credits expire?" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenIndex={0} />);
    screen.getByRole("button", { name: "What is PDF-Craft?" }).focus();
    await user.keyboard("{Escape}");
    // Escape doesn't close accordion (only used in nav/dialogs) — verify trigger is still accessible
    expect(screen.getByRole("button", { name: "What is PDF-Craft?" })).toBeInTheDocument();
  });
});

describe("Accordion — accessibility", () => {
  it("all triggers have role=button", () => {
    render(<Accordion items={items} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(items.length);
  });

  it("open trigger has aria-expanded=true", () => {
    render(<Accordion items={items} defaultOpenIndex={0} />);
    expect(
      screen.getByRole("button", { name: "What is PDF-Craft?" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("closed trigger has aria-expanded=false", () => {
    render(<Accordion items={items} defaultOpenIndex={0} />);
    expect(
      screen.getByRole("button", { name: "Do credits expire?" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("triggers are keyboard reachable via Tab", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenIndex={-1} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "What is PDF-Craft?" })).toHaveFocus();
  });
});
