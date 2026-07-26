import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MermaidDiagram } from "./MermaidDiagram";

const initialize = vi.fn();
const renderDiagram = vi.fn().mockResolvedValue({ svg: "<svg><rect /></svg>" });

vi.mock("mermaid", () => ({
  default: {
    initialize: (...args: unknown[]) => initialize(...args),
    render: (...args: unknown[]) => renderDiagram(...args),
  },
}));

describe("MermaidDiagram", () => {
  beforeEach(() => {
    initialize.mockClear();
    renderDiagram.mockClear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders the SVG mermaid returns into the container", async () => {
    const { container } = render(
      <MermaidDiagram id="d1" source="graph TD; A-->B;" />,
    );

    await waitFor(() =>
      expect(container.querySelector("svg")).not.toBeNull(),
    );
    expect(renderDiagram).toHaveBeenCalledWith("d1", "graph TD; A-->B;");
  });

  it("scales the rendered SVG to fill the container instead of its tiny intrinsic size", async () => {
    const { container } = render(
      <MermaidDiagram id="d2" source="graph TD; A-->B;" />,
    );

    await waitFor(() =>
      expect(container.querySelector("svg")).not.toBeNull(),
    );
    const svg = container.querySelector("svg")!;
    expect(svg.style.width).toBe("100%");
    expect(svg.hasAttribute("height")).toBe(false);
  });

  it("initializes with the base theme outside dark mode", async () => {
    render(<MermaidDiagram id="d3" source="graph TD; A-->B;" />);

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "base" }),
    );
  });

  it("initializes with the dark theme when the document is in dark mode", async () => {
    document.documentElement.dataset.theme = "dark";
    render(<MermaidDiagram id="d4" source="graph TD; A-->B;" />);

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "dark" }),
    );
  });

  it("re-renders when the document theme attribute changes", async () => {
    render(<MermaidDiagram id="d5" source="graph TD; A-->B;" />);
    await waitFor(() => expect(renderDiagram).toHaveBeenCalledTimes(1));

    document.documentElement.dataset.theme = "dark";
    await waitFor(() => expect(renderDiagram).toHaveBeenCalledTimes(2));
  });

  it("stops re-rendering after unmount", async () => {
    const { unmount } = render(
      <MermaidDiagram id="d6" source="graph TD; A-->B;" />,
    );
    await waitFor(() => expect(renderDiagram).toHaveBeenCalledTimes(1));

    unmount();
    document.documentElement.dataset.theme = "dark";
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(renderDiagram).toHaveBeenCalledTimes(1);
  });
});
