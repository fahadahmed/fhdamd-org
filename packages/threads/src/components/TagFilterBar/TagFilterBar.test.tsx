import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { TagFilterBar } from "./TagFilterBar";

const tags = [
  { value: "dev", label: "Dev" },
  { value: "product", label: "Product" },
];

describe("TagFilterBar", () => {
  it("renders the all pill plus every tag", () => {
    render(<TagFilterBar tags={tags} allLabel="All posts" />);
    expect(screen.getByRole("button", { name: "All posts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dev" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Product" })).toBeInTheDocument();
  });

  it("defaults to the all pill active", () => {
    render(<TagFilterBar tags={tags} allLabel="All posts" />);
    expect(screen.getByRole("button", { name: "All posts" }).className).toMatch(/active/);
  });

  it("marks a tag active on click and calls onChange", () => {
    const onChange = vi.fn();
    render(<TagFilterBar tags={tags} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Dev" }));
    expect(onChange).toHaveBeenCalledWith("dev");
    expect(screen.getByRole("button", { name: "Dev" }).className).toMatch(/active/);
  });

  it("only one pill is active at a time", () => {
    render(<TagFilterBar tags={tags} allLabel="All posts" />);
    fireEvent.click(screen.getByRole("button", { name: "Dev" }));
    expect(screen.getByRole("button", { name: "All posts" }).className).not.toMatch(/active/);
    expect(screen.getByRole("button", { name: "Dev" }).className).toMatch(/active/);
  });

  it("respects a custom defaultTag", () => {
    render(<TagFilterBar tags={tags} defaultTag="product" />);
    expect(screen.getByRole("button", { name: "Product" }).className).toMatch(/active/);
  });

  it("merges custom className", () => {
    render(<TagFilterBar tags={tags} className="custom" data-testid="bar" />);
    expect(screen.getByTestId("bar")).toHaveClass("custom");
  });
});
