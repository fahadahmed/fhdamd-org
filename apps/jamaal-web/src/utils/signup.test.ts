import { afterEach, describe, expect, it, vi } from "vitest";
import { joinedTitle, submitSignup, validateSignup } from "./signup";

describe("validateSignup", () => {
  it("asks for a first name before anything else", () => {
    expect(validateSignup({ firstName: "  ", email: "bad" })).toBe(
      "Add your first name so we know who to write to.",
    );
  });

  it("rejects an incomplete email address", () => {
    expect(validateSignup({ firstName: "Sam", email: "sam@" })).toBe("That address looks incomplete.");
    expect(validateSignup({ firstName: "Sam", email: "sam@example" })).toBe("That address looks incomplete.");
  });

  it("accepts a name and a complete address, ignoring surrounding spaces", () => {
    expect(validateSignup({ firstName: " Sam ", email: " sam@example.com " })).toBeNull();
  });
});

describe("joinedTitle", () => {
  it("thanks the person by name", () => {
    expect(joinedTitle(" Sam ")).toBe("Thank you, Sam. You're on the list.");
  });

  it("falls back to a plain confirmation without a name", () => {
    expect(joinedTitle("")).toBe("You're on the list.");
  });
});

describe("submitSignup", () => {
  afterEach(() => vi.unstubAllGlobals());

  const input = { firstName: " Sam ", email: " sam@example.com " };

  it("posts the trimmed signup with its source to the endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await submitSignup(input, "hero", { endpoint: "https://example.test/waitlist" });
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Sam", email: "sam@example.com", company: "", source: "hero" }),
    });
  });

  it("sends the honeypot value so the backend can drop bots", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await submitSignup({ ...input, company: "Acme" }, "hero", { endpoint: "/api/waitlist" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).company).toBe("Acme");
  });

  it("rejects when the endpoint answers with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(submitSignup(input, "join", { endpoint: "https://example.test/waitlist" })).rejects.toThrow(
      "Something went wrong",
    );
  });

  it("only resolves without an endpoint in local development", async () => {
    await expect(submitSignup(input, "hero", { dev: true })).resolves.toBeUndefined();
  });

  it("refuses to pretend it worked in production without an endpoint", async () => {
    await expect(submitSignup(input, "hero", { dev: false })).rejects.toThrow("Signup isn't open yet");
  });
});
