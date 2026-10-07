import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppStoreButton from "./AppStoreButton";

describe("AppStoreButton", () => {
  it("renders a link to the App Store listing with its label", () => {
    render(<AppStoreButton href="https://apps.apple.com/app/jamaal" />);
    expect(screen.getByRole("link", { name: /Download on the App Store/ })).toHaveAttribute(
      "href",
      "https://apps.apple.com/app/jamaal",
    );
  });

  it("includes a decorative download icon", () => {
    const { container } = render(<AppStoreButton href="#download" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
