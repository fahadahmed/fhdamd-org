import { render, screen } from "@testing-library/react";
import { EmbedCard } from "./EmbedCard";

describe("EmbedCard", () => {
  it("renders a youtube iframe with the given src and title", () => {
    render(<EmbedCard type="youtube" videoUrl="https://youtube.com/embed/x" title="A video" />);
    const iframe = screen.getByTitle("A video");
    expect(iframe).toHaveAttribute("src", "https://youtube.com/embed/x");
    expect(screen.getByText("Embed · YouTube")).toBeInTheDocument();
  });

  it("renders a tweet with author, handle, text, and optional foot", () => {
    render(
      <EmbedCard type="tweet" authorName="Fahad Ahmed" handle="@fahadahmed" text="Hello world" foot="10 likes" />
    );
    expect(screen.getByText("Fahad Ahmed")).toBeInTheDocument();
    expect(screen.getByText("@fahadahmed")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("10 likes")).toBeInTheDocument();
    expect(screen.getByText("Embed · X / Twitter")).toBeInTheDocument();
  });

  it("renders an instagram embed with account name and optional caption", () => {
    render(<EmbedCard type="instagram" accountName="fhdamd.dev" caption="A caption" />);
    expect(screen.getByText("fhdamd.dev")).toBeInTheDocument();
    expect(screen.getByText("A caption")).toBeInTheDocument();
    expect(screen.getByText("Embed · Instagram")).toBeInTheDocument();
  });

  it("respects a custom label override", () => {
    render(<EmbedCard type="instagram" accountName="fhdamd.dev" label="Custom label" />);
    expect(screen.getByText("Custom label")).toBeInTheDocument();
    expect(screen.queryByText("Embed · Instagram")).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<EmbedCard type="instagram" accountName="x" className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});
