import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockGetToken = vi.fn().mockResolvedValue("captcha-token");

vi.mock("../../../utils", () => ({
  useRecaptcha: () => ({ getToken: mockGetToken }),
}));

vi.mock("../../../utils/lib/analytics", () => ({
  logEvent: vi.fn(),
  setUserId: vi.fn(),
}));

import SignupForm from "./SignupForm";
import { createUser } from "../../../test/mocks/astro-actions";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockResolvedValue("captcha-token");
  createUser.mockResolvedValue({ data: { success: true }, error: null });
  vi.stubGlobal("location", { href: "", assign: vi.fn() });
});

describe("SignupForm", () => {
  it("renders name, email, password inputs and a submit button", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
  });

  it("shows a captcha error when getToken returns null", async () => {
    mockGetToken.mockResolvedValue(null);
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Captcha verification failed/i),
    );
    expect(createUser).not.toHaveBeenCalled();
  });

  it("calls actions.user.createUser with form values and captcha token", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(createUser).toHaveBeenCalledWith({
        name: "Jane",
        email: "jane@test.com",
        password: "password123",
        captchaToken: "captcha-token",
      }),
    );
  });

  it("redirects to /signin on success", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() => expect(window.location.href).toBe("/signin"));
  });

  it("shows an API error message when createUser returns success=false", async () => {
    createUser.mockResolvedValue({ data: { success: false, error: "Email already in use." } });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Email already in use."),
    );
  });

  it("shows the exception message when createUser throws", async () => {
    createUser.mockRejectedValue({ message: "Network error" });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Full name"), "Jane");
    await user.type(screen.getByLabelText("Email address"), "jane@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Network error"),
    );
  });
});
