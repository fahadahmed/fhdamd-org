import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyLinkButton } from "./CopyLinkButton";

describe("CopyLinkButton", () => {
  beforeEach(() => {
    // jsdom's navigator.clipboard is a getter-only property — redefine it.
    // Uses fireEvent (not user-event) below: user-event ships its own
    // clipboard emulation that clobbers this mock as soon as it's set up.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies the current page URL to the clipboard on click", async () => {
    render(<CopyLinkButton />);
    const button = screen.getByRole("button", { name: /copy link/i });
    const initialIcon = button.innerHTML;

    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      window.location.href,
    );
    // Let the clipboard promise's .then() (which sets state) settle before
    // the test ends, so it doesn't fire against an unmounted tree.
    await waitFor(() => expect(button.innerHTML).not.toBe(initialIcon));
  });

  it("swaps to a check icon after copying, then reverts once the timeout elapses", async () => {
    render(<CopyLinkButton />);

    const button = screen.getByRole("button", { name: /copy link/i });
    const initialIcon = button.innerHTML;

    fireEvent.click(button);
    await waitFor(() => expect(button.innerHTML).not.toBe(initialIcon));

    await waitFor(() => expect(button.innerHTML).toBe(initialIcon), {
      timeout: 2500,
    });
  });
});
