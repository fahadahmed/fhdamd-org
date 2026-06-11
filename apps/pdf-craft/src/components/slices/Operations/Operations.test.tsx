import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { deriveVariant, OperationsContainer } from "./Operations";
import type { Operation } from "../../../utils";

const makeOp = (overrides: Partial<Operation> = {}): Operation => ({
  id: "1",
  title: "Merge",
  detail: "Merge PDFs into one",
  creditCost: 2,
  active: true,
  actionLabel: "Merge now",
  actionRoute: "/mergepdf",
  iconKey: "merge",
  sortOrder: 1,
  ...overrides,
});

describe("deriveVariant", () => {
  it("returns muted for inactive operations regardless of index", () => {
    expect(deriveVariant(makeOp({ active: false }), 0)).toBe("muted");
    expect(deriveVariant(makeOp({ active: false }), 1)).toBe("muted");
  });

  it("alternates terra/sage by index for active operations", () => {
    expect(deriveVariant(makeOp({ active: true }), 0)).toBe("terra");
    expect(deriveVariant(makeOp({ active: true }), 1)).toBe("sage");
    expect(deriveVariant(makeOp({ active: true }), 2)).toBe("terra");
    expect(deriveVariant(makeOp({ active: true }), 3)).toBe("sage");
  });
});

describe("OperationsContainer", () => {
  it("returns null when the operations list is empty", () => {
    const { container } = render(<OperationsContainer operations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all operation titles", () => {
    const ops = [makeOp({ id: "1", title: "Merge" }), makeOp({ id: "2", title: "Encrypt" })];
    render(<OperationsContainer operations={ops} />);
    expect(screen.getByText("Merge")).toBeInTheDocument();
    expect(screen.getByText("Encrypt")).toBeInTheDocument();
  });

  it("includes inactive operations by default", () => {
    const ops = [makeOp({ id: "1", active: true }), makeOp({ id: "2", title: "Coming Soon", active: false })];
    render(<OperationsContainer operations={ops} />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("filters to active-only when activeOnly=true", () => {
    const ops = [
      makeOp({ id: "1", title: "Merge", active: true }),
      makeOp({ id: "2", title: "Coming Soon", active: false }),
    ];
    render(<OperationsContainer operations={ops} activeOnly />);
    expect(screen.getByText("Merge")).toBeInTheDocument();
    expect(screen.queryByText("Coming Soon")).not.toBeInTheDocument();
  });

  it("returns null when activeOnly=true and no active operations exist", () => {
    const { container } = render(
      <OperationsContainer operations={[makeOp({ active: false })]} activeOnly />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a link for active operations", () => {
    render(<OperationsContainer operations={[makeOp({ active: true, actionLabel: "Merge now", actionRoute: "/mergepdf" })]} />);
    expect(screen.getByRole("link", { name: "Merge now" })).toHaveAttribute("href", "/mergepdf");
  });

  it("does not render a link for inactive operations", () => {
    render(<OperationsContainer operations={[makeOp({ active: false, actionLabel: "Soon" })]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
