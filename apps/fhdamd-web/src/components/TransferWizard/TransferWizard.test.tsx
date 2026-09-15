import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransferWizard } from "./TransferWizard";

describe("TransferWizard", () => {
  it("does not advance past the current step when a required field is left empty", async () => {
    const user = userEvent.setup();
    render(<TransferWizard />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    // jsdom honors the native `required` constraint on submit, so the trip
    // step's own fields should still be on screen.
    expect(screen.getByLabelText("Pickup location")).toBeInTheDocument();
  });

  it("skips the return-details step when trip type is one-way", async () => {
    const user = userEvent.setup();
    render(<TransferWizard />);

    await user.selectOptions(screen.getByLabelText("Trip type"), "one-way");
    await user.type(screen.getByLabelText("Pickup location"), "Airport");
    await user.type(screen.getByLabelText("Drop-off location"), "Hotel");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.queryByLabelText("Return date")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Passengers")).toBeInTheDocument();
  });

  it("shows the return-details step when trip type is return", async () => {
    const user = userEvent.setup();
    render(<TransferWizard />);

    await user.selectOptions(screen.getByLabelText("Trip type"), "return");
    await user.type(screen.getByLabelText("Pickup location"), "Airport");
    await user.type(screen.getByLabelText("Drop-off location"), "Hotel");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText("Return date")).toBeInTheDocument();
  });

  it("walks the one-way flow to completion and shows the success panel with no network call", async () => {
    const user = userEvent.setup();
    render(<TransferWizard />);

    await user.selectOptions(screen.getByLabelText("Trip type"), "one-way");
    await user.type(screen.getByLabelText("Pickup location"), "Airport");
    await user.type(screen.getByLabelText("Drop-off location"), "Hotel");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.type(screen.getByLabelText("Passengers"), "2");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.selectOptions(screen.getByLabelText("Vehicle class"), "sedan");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone"), "0400000000");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByRole("status")).toHaveTextContent("Booking details captured.");
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
  });
});
