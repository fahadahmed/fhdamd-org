import { describe, expect, it, vi } from "vitest";
import { createWaitlistHandler, isAllowedOrigin, signupId } from "./waitlist";
import type { WaitlistEntry, WaitlistStore } from "./waitlist";

function setup(result: "created" | "exists" = "created") {
  const add = vi.fn<(entry: WaitlistEntry) => Promise<"created" | "exists">>().mockResolvedValue(result);
  const store: WaitlistStore = { add };
  return { handle: createWaitlistHandler(store), add };
}

const valid = { firstName: "Sam", email: "Sam@Example.com", source: "hero" };
const post = (body: unknown, origin?: string) => ({ method: "POST", origin, body });

describe("signupId", () => {
  it("is stable and ignores case and surrounding spaces", () => {
    expect(signupId(" Sam@Example.com ")).toBe(signupId("sam@example.com"));
    expect(signupId("sam@example.com")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different addresses", () => {
    expect(signupId("a@example.com")).not.toBe(signupId("b@example.com"));
  });
});

describe("isAllowedOrigin", () => {
  it.each([
    "https://jamaal.app",
    "https://www.jamaal.app",
    "https://jamaal-web.web.app",
    "https://jamaal-web.firebaseapp.com",
    "https://jamaal-web--pr412-feat-387-jamaal-land-qh3xxrao.web.app",
    "http://localhost:4321",
    "http://127.0.0.1:4322",
    undefined,
  ])("allows %s", (origin) => expect(isAllowedOrigin(origin)).toBe(true));

  it.each([
    "https://evil.example",
    "https://jamaal.app.evil.example",
    "https://notjamaal.app",
    "http://jamaal.app",
    "https://other-project.web.app",
    "http://localhost.evil.example:4321",
  ])("rejects %s", (origin) => expect(isAllowedOrigin(origin)).toBe(false));
});

describe("createWaitlistHandler", () => {
  it("stores a valid signup with a normalised email and its source", async () => {
    const { handle, add } = setup();
    expect(await handle(post({ ...valid, firstName: "  Sam " }))).toEqual({ status: 200, body: { ok: true } });
    expect(add).toHaveBeenCalledWith({
      id: signupId("sam@example.com"),
      firstName: "Sam",
      email: "sam@example.com",
      source: "hero",
    });
  });

  it("answers the same for an address that is already on the list", async () => {
    const { handle, add } = setup("exists");
    expect(await handle(post(valid))).toEqual({ status: 200, body: { ok: true } });
    expect(add).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["no name", { ...valid, firstName: "  " }],
    ["a name that is too long", { ...valid, firstName: "x".repeat(81) }],
    ["a bad email", { ...valid, email: "sam@" }],
    ["an unknown source", { ...valid, source: "banner" }],
    ["no body", undefined],
    ["a non-object body", "email=sam@example.com"],
  ])("rejects %s with a 400 and stores nothing", async (_label, body) => {
    const { handle, add } = setup();
    const result = await handle(post(body));
    expect(result.status).toBe(400);
    expect(add).not.toHaveBeenCalled();
  });

  it("quietly drops a signup that filled the honeypot", async () => {
    const { handle, add } = setup();
    expect(await handle(post({ ...valid, company: "Acme" }))).toEqual({ status: 200, body: { ok: true } });
    expect(add).not.toHaveBeenCalled();
  });

  it("accepts an empty honeypot", async () => {
    const { handle, add } = setup();
    await handle(post({ ...valid, company: "" }));
    expect(add).toHaveBeenCalledTimes(1);
  });

  it("rejects methods other than POST", async () => {
    const { handle, add } = setup();
    expect((await handle({ method: "GET", body: undefined })).status).toBe(405);
    expect(add).not.toHaveBeenCalled();
  });

  it("rejects a signup from another origin", async () => {
    const { handle, add } = setup();
    expect((await handle(post(valid, "https://evil.example"))).status).toBe(403);
    expect(add).not.toHaveBeenCalled();
  });

  it("lets a storage failure reach the caller", async () => {
    const { handle, add } = setup();
    add.mockRejectedValueOnce(new Error("firestore down"));
    await expect(handle(post(valid))).rejects.toThrow("firestore down");
  });
});
