import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";

const Icon = () => <svg data-testid="project-icon" />;

describe("ProjectCard — rendering", () => {
  it("renders the project name", () => {
    render(<ProjectCard name="Jamaal" description="Planning app for iOS." jamaalIcon />);
    expect(screen.getByText("Jamaal")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<ProjectCard name="Jamaal" description="Planning app for iOS." jamaalIcon />);
    expect(screen.getByText("Planning app for iOS.")).toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(
      <ProjectCard
        name="Jamaal"
        description="Desc."
        eyebrow="iOS app · SwiftUI"
        jamaalIcon
      />
    );
    expect(screen.getByText("iOS app · SwiftUI")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    render(<ProjectCard name="Jamaal" description="Desc." jamaalIcon />);
    expect(screen.queryByText("iOS app · SwiftUI")).not.toBeInTheDocument();
  });

  it("renders the Jamaal J avatar when jamaalIcon=true", () => {
    const { container } = render(
      <ProjectCard name="Jamaal" description="Desc." jamaalIcon />
    );
    expect(container.querySelector(".j-letter") ?? screen.queryByText("J")).toBeTruthy();
  });

  it("renders custom icon when icon is provided", () => {
    render(<ProjectCard name="Riqa" description="Desc." icon={<Icon />} />);
    expect(screen.getByTestId("project-icon")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(
      <ProjectCard
        name="Jamaal"
        description="Desc."
        jamaalIcon
        tags={["SwiftUI", "SwiftData"]}
      />
    );
    expect(screen.getByText("SwiftUI")).toBeInTheDocument();
    expect(screen.getByText("SwiftData")).toBeInTheDocument();
  });

  it("renders badge when provided", () => {
    render(
      <ProjectCard
        name="Jamaal"
        description="Desc."
        jamaalIcon
        badge={{ label: "In dev", variant: "terra" }}
      />
    );
    expect(screen.getByText("In dev")).toBeInTheDocument();
  });

  it("renders pricing pills when provided", () => {
    render(
      <ProjectCard
        name="Riqa"
        description="Desc."
        icon={<Icon />}
        pricingPills={[
          { price: "$2.99", label: "10 credits" },
          { price: "$4.99", label: "20 credits" },
        ]}
      />
    );
    expect(screen.getByText("$2.99")).toBeInTheDocument();
    expect(screen.getByText("10 credits")).toBeInTheDocument();
  });
});

describe("ProjectCard — element type", () => {
  it("renders as <div> when no href", () => {
    const { container } = render(
      <ProjectCard name="Threads" description="Design system." />
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as <a> when href is provided", () => {
    render(
      <ProjectCard name="Jamaal" description="Desc." href="/jamaal" jamaalIcon />
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/jamaal");
  });

  it("shows arrow when href is provided", () => {
    const { container } = render(
      <ProjectCard name="Jamaal" description="Desc." href="/jamaal" jamaalIcon />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("ProjectCard — accent variants", () => {
  it.each(["terra", "sage", "ink"] as const)(
    "renders accentColor=%s without throwing",
    (accentColor) => {
      expect(() =>
        render(
          <ProjectCard
            name="Project"
            description="Desc."
            accentColor={accentColor}
          />
        )
      ).not.toThrow();
    }
  );
});
