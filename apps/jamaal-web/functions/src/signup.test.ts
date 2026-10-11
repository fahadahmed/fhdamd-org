import { describe, expect, it, vi } from "vitest";
import type { RateLimiter } from "./rateLimit";
import { createSignupHandler, isAllowedOrigin } from "./signup";
import type { SignupStore } from "./signup";
import type { Stage } from "./stage";

const setup = ({ stage = "waitlist" as Stage, exists = false, allow = true } = {}) => {
  const store: SignupStore = {
    create: vi.fn().mockResolvedValue(exists ? "exists" : "created"),
    requestInvite: vi.fn().mockResolvedValue(undefined),
  };
  const limiter: RateLimiter = { allow: vi.fn().mockResolvedValue(allow) };
  const onLimiterError = vi.fn();
  const handle = createSignupHandler({ store, stage: { get: async () => stage }, limiter, onLimiterError });
  return { store, limiter, onLimiterError, handle };
};

const post = (body: unknown, extra: Partial<{ origin: string; ip: string; method: string }> = {}) => ({
  method: "POST",
  origin: "https://jamaal.app",
  ip: "203.0.113.5",
  body,
  ...extra,
});
const valid = { firstName: "Sam", email: "Sam@Example.com ", devices: ["iphone"], source: "hero" };

describe("isAllowedOrigin", () => {
  it.each([
    undefined,
    "https://jamaal.app",
    "https://www.jamaal.app",
    "https://jamaal-web.web.app",
    "https://jamaal-web--pr439-feat-abc123.web.app",
    "http://localhost:4321",
  ])("allows %s", (origin) => expect(isAllowedOrigin(origin)).toBe(true));

  it.each(["https://evil.example", "https://jamaal.app.evil.example", "http://jamaal.app", "https://other-site.web.app"])(
    "refuses %s",
    (origin) => expect(isAllowedOrigin(origin)).toBe(false),
  );
});

describe("createSignupHandler: waitlist", () => {
  it("stores a new signup with the stage and a normalised address, and says added", async () => {
    const { handle, store } = setup();
    expect(await handle(post(valid))).toEqual({ status: 200, body: { status: "added" } });
    expect(store.create).toHaveBeenCalledWith({
      firstName: "Sam",
      email: "sam@example.com",
      devices: ["iphone"],
      source: "hero",
      stage: "waitlist",
    });
  });

  it("does not need devices or even a first name", async () => {
    const { handle, store } = setup();
    const result = await handle(post({ email: "a@b.co" }));
    expect(result.status).toBe(200);
    expect(store.create).toHaveBeenCalledWith(expect.objectContaining({ firstName: "", devices: [], source: "landing" }));
  });

  it("returns 409 for an address already on the list and does not re-invite", async () => {
    const { handle, store } = setup({ exists: true });
    expect(await handle(post(valid))).toEqual({ status: 409, body: { status: "exists" } });
    expect(store.requestInvite).not.toHaveBeenCalled();
  });

  it("ignores the client's phase: a page that claims testflight does not get an invite", async () => {
    const { handle } = setup({ stage: "waitlist" });
    const result = await handle(post({ ...valid, phase: "testflight" }));
    expect(result.body).toEqual({ status: "added" });
  });
});

describe("createSignupHandler: testflight", () => {
  it("says invited for a new signup", async () => {
    const { handle, store } = setup({ stage: "testflight" });
    expect(await handle(post(valid))).toEqual({ status: 200, body: { status: "invited" } });
    expect(store.create).toHaveBeenCalledWith(expect.objectContaining({ stage: "testflight" }));
  });

  it("requires at least one device", async () => {
    const { handle, store } = setup({ stage: "testflight" });
    const result = await handle(post({ ...valid, devices: [] }));
    expect(result).toEqual({ status: 400, body: { error: "Choose at least one device to test on.", field: "devices" } });
    expect(store.create).not.toHaveBeenCalled();
  });

  it("asks for the invite to be sent again on a repeat address, and still answers 409", async () => {
    const { handle, store } = setup({ stage: "testflight", exists: true });
    expect(await handle(post(valid))).toEqual({ status: 409, body: { status: "exists" } });
    expect(store.requestInvite).toHaveBeenCalledWith("sam@example.com");
  });
});

describe("createSignupHandler: launched", () => {
  it("treats a late signup like the waitlist", async () => {
    const { handle } = setup({ stage: "launched" });
    expect((await handle(post(valid))).body).toEqual({ status: "added" });
  });
});

describe("createSignupHandler: validation", () => {
  it.each([
    [{ ...valid, email: "not-an-email" }, "email"],
    [{ ...valid, email: "" }, "email"],
    [{ ...valid, email: "a/b@example.com" }, "email"],
    [{ ...valid, firstName: "x".repeat(81) }, "firstName"],
    [{ ...valid, devices: ["toaster"] }, "devices"],
    [{ ...valid, source: "elsewhere" }, "source"],
    [{}, "email"],
    [null, ""],
  ])("rejects %j with 400", async (body, field) => {
    const { handle, store } = setup();
    const result = await handle(post(body));
    expect(result.status).toBe(400);
    expect((result.body as { field?: string }).field).toBe(field || undefined);
    expect(store.create).not.toHaveBeenCalled();
  });

  it("gives the email field its own message", async () => {
    const { handle } = setup();
    expect((await handle(post({ ...valid, email: "x" }))).body).toEqual({ error: "That address looks incomplete.", field: "email" });
  });
});

describe("createSignupHandler: protection", () => {
  it("quietly drops a honeypot hit: success to the bot, nothing stored", async () => {
    const { handle, store } = setup();
    expect(await handle(post({ ...valid, company: "Acme" }))).toEqual({ status: 200, body: { status: "added" } });
    expect(store.create).not.toHaveBeenCalled();
  });

  it("refuses a foreign origin with 403 before doing anything", async () => {
    const { handle, store, limiter } = setup();
    expect((await handle(post(valid, { origin: "https://evil.example" }))).status).toBe(403);
    expect(store.create).not.toHaveBeenCalled();
    expect(limiter.allow).not.toHaveBeenCalled();
  });

  it("refuses anything but POST with 405", async () => {
    const { handle } = setup();
    expect((await handle(post(valid, { method: "GET" }))).status).toBe(405);
  });

  it("answers 429 when the address is over its limit and stores nothing", async () => {
    const { handle, store } = setup({ allow: false });
    expect((await handle(post(valid))).status).toBe(429);
    expect(store.create).not.toHaveBeenCalled();
  });

  it("limits by the client's address", async () => {
    const { handle, limiter } = setup();
    await handle(post(valid, { ip: "198.51.100.7" }));
    expect(limiter.allow).toHaveBeenCalledWith("198.51.100.7");
  });

  it("skips the limiter when there is no address to limit", async () => {
    const { handle, limiter } = setup();
    await handle(post(valid, { ip: undefined }));
    expect(limiter.allow).not.toHaveBeenCalled();
  });

  it("lets the signup through, and reports it, when the limiter itself fails", async () => {
    const { handle, limiter, onLimiterError } = setup();
    vi.mocked(limiter.allow).mockRejectedValue(new Error("firestore down"));
    expect((await handle(post(valid))).status).toBe(200);
    expect(onLimiterError).toHaveBeenCalledOnce();
  });
});
