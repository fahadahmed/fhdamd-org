import { describe, expect, it, vi } from "vitest";
import { createResendContacts, pacer, unsubscribeChange } from "./resendContacts";
import type { ResendContacts } from "./resendContacts";

const ok = <T>(data: T) => ({ data, error: null, headers: null });
const fail = (statusCode: number | null, name = "application_error", message = "nope") => ({ data: null, error: { statusCode, name, message }, headers: null });

function setup(overrides: { get?: unknown; create?: unknown; remove?: unknown } = {}) {
  const contacts = {
    get: vi.fn().mockResolvedValue(overrides.get ?? fail(404, "not_found")),
    create: vi.fn().mockResolvedValue(overrides.create ?? ok({ id: "new-id" })),
    remove: vi.fn().mockResolvedValue(overrides.remove ?? ok({ deleted: true })),
  };
  const waits: number[] = [];
  let clock = 1000;
  const api = createResendContacts({ contacts } as unknown as ResendContacts, {
    audienceId: "aud_1",
    gapMs: 600,
    now: () => clock,
    wait: async (ms) => {
      waits.push(ms);
      clock += ms;
    },
  });
  return { contacts, api, waits };
}

describe("pacer", () => {
  it("lets the first call straight through and spaces the next ones", async () => {
    let clock = 0;
    const waits: number[] = [];
    const pace = pacer(500, async (ms) => void (waits.push(ms), (clock += ms)), () => clock);
    await pace();
    await pace();
    await pace();
    expect(waits).toEqual([500, 500]);
  });

  it("does not wait when enough time has already passed", async () => {
    let clock = 0;
    const waits: number[] = [];
    const pace = pacer(500, async (ms) => void waits.push(ms), () => clock);
    await pace();
    clock = 5000;
    await pace();
    expect(waits).toEqual([]);
  });

  it("works with the real clock", async () => {
    const pace = pacer(1);
    await pace();
    await pace();
  });
});

describe("add", () => {
  it("creates a contact that is not there yet, subscribed, with their first name", async () => {
    const { api, contacts } = setup();
    expect(await api.add({ email: "sam@example.com", firstName: "Sam" })).toBe("new-id");
    expect(contacts.get).toHaveBeenCalledWith({ audienceId: "aud_1", email: "sam@example.com" });
    expect(contacts.create).toHaveBeenCalledWith({ audienceId: "aud_1", email: "sam@example.com", firstName: "Sam", unsubscribed: false });
  });

  it("sends no first name when there is none", async () => {
    const { api, contacts } = setup();
    await api.add({ email: "sam@example.com", firstName: "" });
    expect(contacts.create).toHaveBeenCalledWith(expect.objectContaining({ firstName: undefined }));
  });

  it("uses a contact that is already there, and does not touch whether they are unsubscribed", async () => {
    const { api, contacts } = setup({ get: ok({ id: "old-id", unsubscribed: true }) });
    expect(await api.add({ email: "sam@example.com", firstName: "Sam" })).toBe("old-id");
    expect(contacts.create).not.toHaveBeenCalled();
  });

  it("throws when Resend fails, so the queue retries", async () => {
    await expect(setup({ get: fail(500, "internal_server_error", "down") }).api.add({ email: "a@b.co", firstName: "" })).rejects.toThrow("Resend could not look up a contact: down");
    await expect(setup({ create: fail(429, "rate_limit_exceeded", "slow down") }).api.add({ email: "a@b.co", firstName: "" })).rejects.toThrow("Resend could not add a contact: slow down");
  });

  it("waits between its two calls so it stays under the rate limit", async () => {
    const { api, waits } = setup();
    await api.add({ email: "a@b.co", firstName: "" });
    expect(waits).toEqual([600]);
  });
});

describe("remove", () => {
  it("deletes the contact", async () => {
    const { api, contacts } = setup();
    await api.remove("sam@example.com");
    expect(contacts.remove).toHaveBeenCalledWith({ audienceId: "aud_1", email: "sam@example.com" });
  });

  it("is fine when the contact is already gone, and throws on any other failure", async () => {
    await expect(setup({ remove: fail(404, "not_found") }).api.remove("a@b.co")).resolves.toBeUndefined();
    await expect(setup({ remove: fail(500, "internal_server_error", "down") }).api.remove("a@b.co")).rejects.toThrow("Resend could not remove a contact: down");
  });
});

describe("unsubscribeChange", () => {
  it("reads an unsubscribe and a re-subscribe from a contact update", () => {
    expect(unsubscribeChange({ type: "contact.updated", data: { email: " Sam@Example.com ", unsubscribed: true } })).toEqual({ email: "sam@example.com", unsubscribed: true });
    expect(unsubscribeChange({ type: "contact.updated", data: { email: "a@b.co", unsubscribed: false } })).toEqual({ email: "a@b.co", unsubscribed: false });
  });

  it("ignores other events and incomplete ones", () => {
    expect(unsubscribeChange({ type: "contact.created", data: { email: "a@b.co", unsubscribed: true } })).toBeNull();
    expect(unsubscribeChange({ type: "contact.updated", data: { email: "a@b.co" } })).toBeNull();
    expect(unsubscribeChange({ type: "contact.updated" })).toBeNull();
  });
});
