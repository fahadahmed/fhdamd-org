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
});
