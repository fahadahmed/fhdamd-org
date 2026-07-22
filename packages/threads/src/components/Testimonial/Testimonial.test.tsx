import { render, screen } from "@testing-library/react";
import { Testimonial } from "./Testimonial";

describe("Testimonial", () => {
  it("renders the quote text", () => {
    render(
      <Testimonial
        quote="Finally, a PDF tool that's honest about pricing."
        attribution="Samia Akhtar · Senior Claims Consultant"
      />
    );
    expect(
      screen.getByText(/Finally, a PDF tool that's honest about pricing\./)
    ).toBeInTheDocument();
  });

  it("renders the attribution", () => {
    render(
      <Testimonial
        quote="Great tool."
        attribution="Brendan Lawrie · Partner"
      />
    );
    expect(screen.getByText("Brendan Lawrie · Partner")).toBeInTheDocument();
  });

  it("renders as a <div>", () => {
    const { container } = render(
      <Testimonial quote="Quote" attribution="Author" />
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Testimonial quote="Quote" attribution="Author" className="custom" />
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <Testimonial quote="Quote" attribution="Author" data-testid="testi" />
    );
    expect(screen.getByTestId("testi")).toBeInTheDocument();
  });

  describe("reserved variant", () => {
    it("renders the default title and the given description", () => {
      render(<Testimonial reserved description="A quote goes here once confirmed." />);
      expect(screen.getByText("Client testimonial — reserved")).toBeInTheDocument();
      expect(screen.getByText("A quote goes here once confirmed.")).toBeInTheDocument();
    });

    it("respects a custom title", () => {
      render(<Testimonial reserved title="Coming soon" description="d" />);
      expect(screen.getByText("Coming soon")).toBeInTheDocument();
    });

    it("does not render quote/attribution markup", () => {
      render(<Testimonial reserved description="d" />);
      expect(screen.queryByText("Author")).not.toBeInTheDocument();
    });

    it("does not leak the reserved prop onto the DOM node", () => {
      const { container } = render(<Testimonial reserved description="d" data-testid="slot" />);
      expect(screen.getByTestId("slot")).not.toHaveAttribute("reserved");
      expect(container.firstChild).not.toHaveAttribute("reserved");
    });

    it("merges custom className", () => {
      render(<Testimonial reserved description="d" className="custom" data-testid="slot" />);
      expect(screen.getByTestId("slot")).toHaveClass("custom");
    });
  });

  it("does not leak the reserved prop onto the DOM node for the filled variant", () => {
    render(<Testimonial quote="Quote" attribution="Author" data-testid="testi" />);
    expect(screen.getByTestId("testi")).not.toHaveAttribute("reserved");
  });
});
