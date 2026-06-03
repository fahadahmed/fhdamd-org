import { render, screen } from "@testing-library/react";
import { ClientWorkRow } from "./ClientWorkRow";

const defaultProps = {
  client:      "Dept. of Education VIC",
  dateRange:   "Jan 2024 – Present",
  title:       "Kindergarten Arrival Funding",
  description: "Technical lead across two phases.",
};

describe("ClientWorkRow — rendering", () => {
  it("renders client name", () => {
    render(<ClientWorkRow {...defaultProps} />);
    expect(screen.getByText("Dept. of Education VIC")).toBeInTheDocument();
  });

  it("renders date range", () => {
    render(<ClientWorkRow {...defaultProps} />);
    expect(screen.getByText("Jan 2024 – Present")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<ClientWorkRow {...defaultProps} />);
    expect(screen.getByText("Kindergarten Arrival Funding")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ClientWorkRow {...defaultProps} />);
    expect(screen.getByText("Technical lead across two phases.")).toBeInTheDocument();
  });

  it("renders tags when provided", () => {
    render(<ClientWorkRow {...defaultProps} tags={["React Vite", "Turborepo"]} />);
    expect(screen.getByText("React Vite")).toBeInTheDocument();
    expect(screen.getByText("Turborepo")).toBeInTheDocument();
  });

  it("renders no tags when omitted", () => {
    render(<ClientWorkRow {...defaultProps} />);
    expect(screen.queryByText("React Vite")).not.toBeInTheDocument();
  });

  it("renders value badge when provided", () => {
    render(<ClientWorkRow {...defaultProps} value="$1.3M bid" />);
    expect(screen.getByText("$1.3M bid")).toBeInTheDocument();
  });

  it("renders no value badge when omitted", () => {
    render(<ClientWorkRow {...defaultProps} />);
    expect(screen.queryByText("$1.3M bid")).not.toBeInTheDocument();
  });

  it("renders JSX in title", () => {
    render(
      <ClientWorkRow
        {...defaultProps}
        title={
          <>
            Kindergarten <em>Arrival Funding</em>
          </>
        }
      />
    );
    expect(screen.getByText("Arrival Funding")).toBeInTheDocument();
  });
});
