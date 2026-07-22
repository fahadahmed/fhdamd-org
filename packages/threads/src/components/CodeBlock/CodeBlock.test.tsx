import { act, render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  it("renders the code content", () => {
    render(<CodeBlock>console.log("hi")</CodeBlock>);
    expect(screen.getByText('console.log("hi")')).toBeInTheDocument();
  });

  it("renders the filename when provided", () => {
    render(<CodeBlock filename="index.ts">code</CodeBlock>);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("does not render a filename when omitted", () => {
    render(<CodeBlock>code</CodeBlock>);
    expect(screen.queryByText("index.ts")).not.toBeInTheDocument();
  });

  it("copies the rendered text content on click and shows Copied feedback", async () => {
    render(<CodeBlock>const x = 1;</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("const x = 1;");
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("reverts back to Copy after the feedback window", async () => {
    vi.useFakeTimers();
    render(<CodeBlock>const x = 1;</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1700);
    });
    expect(screen.getByRole("button", { name: /^copy$/i })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("merges custom className", () => {
    render(<CodeBlock className="custom" data-testid="block">code</CodeBlock>);
    expect(screen.getByTestId("block")).toHaveClass("custom");
  });
});
