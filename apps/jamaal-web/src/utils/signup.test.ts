import { afterEach, describe, expect, it, vi } from "vitest";
import { joinedBody, joinedTitle, submitSignup, validateSignup } from "./signup";

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

  it("says the invite is on its way in the beta", () => {
    expect(joinedTitle("Sam", "invited")).toBe("Thank you, Sam. Your invite is on its way.");
    expect(joinedTitle("", "invited")).toBe("Your invite is on its way.");
  });

  it("does not thank someone who is already on the list", () => {
    expect(joinedTitle("Sam", "exists")).toBe("Sam, you're already on the list.");
    expect(joinedTitle("", "exists")).toBe("You're already on the list.");
  });
});

describe("joinedBody", () => {
  it("says what happens next for each outcome", () => {
    expect(joinedBody(" sam@example.com ", "added")).toBe("We'll write to sam@example.com once, when there's something to open.");
    expect(joinedBody("sam@example.com", "invited")).toContain("TestFlight");
    expect(joinedBody("sam@example.com", "exists")).toBe("No need to do anything: sam@example.com is already on our list.");
  });
});

describe("submitSignup", () => {
  afterEach(() => vi.unstubAllGlobals());

  const input = { firstName: " Sam ", email: " sam@example.com " };
  const reply = (status: number, body?: unknown) =>
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: body === undefined ? () => Promise.reject(new Error("no body")) : () => Promise.resolve(body),
    });

  it("posts the trimmed signup with its source to the endpoint", async () => {
    const fetchMock = reply(200, { status: "added" });
    vi.stubGlobal("fetch", fetchMock);
    await submitSignup(input, "hero", { endpoint: "https://example.test/signup" });
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Sam", email: "sam@example.com", source: "hero" }),
    });
  });

  it("returns what the server says happened", async () => {
    vi.stubGlobal("fetch", reply(200, { status: "invited" }));
    await expect(submitSignup(input, "hero", { endpoint: "/api/signup" })).resolves.toBe("invited");
    vi.stubGlobal("fetch", reply(200, { status: "added" }));
    await expect(submitSignup(input, "hero", { endpoint: "/api/signup" })).resolves.toBe("added");
  });

  it("treats a success with no readable body as added", async () => {
    vi.stubGlobal("fetch", reply(200));
    await expect(submitSignup(input, "hero", { endpoint: "/api/signup" })).resolves.toBe("added");
  });

  it("treats a 409 as an outcome, not an error", async () => {
    vi.stubGlobal("fetch", reply(409, { status: "exists" }));
    await expect(submitSignup(input, "join", { endpoint: "/api/signup" })).resolves.toBe("exists");
  });

  it("shows the server's message for a bad address or a rate limit", async () => {
    vi.stubGlobal("fetch", reply(400, { error: "That address looks incomplete.", field: "email" }));
    await expect(submitSignup(input, "hero", { endpoint: "/api/signup" })).rejects.toThrow("That address looks incomplete.");
    vi.stubGlobal("fetch", reply(429, { error: "Too many attempts. Please try again in a few minutes." }));
    await expect(submitSignup(input, "hero", { endpoint: "/api/signup" })).rejects.toThrow("Too many attempts");
  });

  it("uses a generic message for other failures, whatever the body says", async () => {
    vi.stubGlobal("fetch", reply(500, { error: "stack trace goes here" }));
    await expect(submitSignup(input, "join", { endpoint: "/api/signup" })).rejects.toThrow("Something went wrong");
    vi.stubGlobal("fetch", reply(403));
    await expect(submitSignup(input, "join", { endpoint: "/api/signup" })).rejects.toThrow("Something went wrong");
  });

  it("only resolves without an endpoint in local development", async () => {
    await expect(submitSignup(input, "hero", { dev: true })).resolves.toBe("added");
  });

  it("refuses to pretend it worked in production without an endpoint", async () => {
    await expect(submitSignup(input, "hero", { dev: false })).rejects.toThrow("Signup isn't open yet");
  });

  it("falls back to the real defaults when called without options", async () => {
    // In the test environment DEV is true and no endpoint is configured, so it behaves like local development.
    await expect(submitSignup(input, "hero")).resolves.toBe("added");
  });
});
