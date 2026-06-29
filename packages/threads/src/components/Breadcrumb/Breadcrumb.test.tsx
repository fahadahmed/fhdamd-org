import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";

const items = [
  { label: "Riqa", href: "/" },
  { label: "Tools",     href: "/tools" },
  { label: "Merge PDFs" },
];

describe("Breadcrumb", () => {
  it("renders a navigation landmark", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders all item labels", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Riqa")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Merge PDFs")).toBeInTheDocument();
  });

  it("renders links for non-current items", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("link", { name: "Riqa" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Tools" })).toHaveAttribute("href", "/tools");
  });

  it("does not render a link for the current (last) item", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.queryByRole("link", { name: "Merge PDFs" })).not.toBeInTheDocument();
  });

  it("marks the current item with aria-current=page", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Merge PDFs")).toHaveAttribute("aria-current", "page");
  });

  it("renders separators between items", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const seps = container.querySelectorAll("[aria-hidden='true']");
    // 2 separators for 3 items (between each non-last item)
    expect(seps.length).toBe(2);
  });

  it("merges custom className", () => {
    const { container } = render(<Breadcrumb items={items} className="custom" />);
    expect(container.querySelector("nav")).toHaveClass("custom");
  });
});
