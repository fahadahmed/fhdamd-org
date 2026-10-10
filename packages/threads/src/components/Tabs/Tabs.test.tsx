import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const items = [
  { id: "a", label: "Overview",  content: <p>Overview panel</p> },
  { id: "b", label: "History",   content: <p>History panel</p>  },
  { id: "c", label: "Billing",   content: <p>Billing panel</p>  },
];

describe("Tabs — rendering", () => {
  it("renders all tab buttons", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "History"  })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Billing"  })).toBeInTheDocument();
  });

  it("renders a tablist landmark", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renders the first tab active by default", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders the defaultActiveId tab as active", () => {
    render(<Tabs items={items} defaultActiveId="b" />);
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders active tab panel content", () => {
    render(<Tabs items={items} defaultActiveId="a" />);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    expect(screen.getByText("Overview panel")).toBeInTheDocument();
  });

  it("does not render panels when renderPanel=false", () => {
    render(<Tabs items={items} renderPanel={false} />);
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  });
});

describe("Tabs — interaction", () => {
  it("switches active tab on click", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("History panel")).toBeInTheDocument();
  });

  it("calls onChange with the tab id", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Billing" }));
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("inactive tabs have tabIndex=-1", () => {
    render(<Tabs items={items} defaultActiveId="a" />);
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("tabindex", "-1");
  });

  it("active tab has tabIndex=0", () => {
    render(<Tabs items={items} defaultActiveId="a" />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("tabindex", "0");
  });
});

describe("Tabs — keyboard navigation", () => {
  it("moves focus and selection with the arrow keys and wraps", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveFocus();
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });

  it("reverses the arrows in a right-to-left list", async () => {
    const user = userEvent.setup();
    render(<div dir="rtl"><Tabs items={items} /></div>);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
  });

  it("keeps one tab stop when the active id matches no tab", () => {
    render(<Tabs items={items} activeId="missing" renderPanel={false} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("tabindex", "0");
  });

  it("ignores other keys", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });
});
