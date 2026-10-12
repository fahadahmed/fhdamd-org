import { describe, expect, it, vi } from "vitest";
import { DEFAULT_MAX_AGE_MS, createMailingList, messageSchema, needsSync } from "./mailingList";
import type { MailingListDeps, SignupRecord } from "./mailingList";

const queuedAt = new Date("2026-10-12T00:00:00Z");
const minutes = (n: number) => new Date(queuedAt.getTime() + n * 60_000);

function setup(record: SignupRecord | null = { firstName: " Sam " }, over: Partial<MailingListDeps["contacts"]> = {}, now = minutes(1)) {
  const deps = {
    signups: {
      get: vi.fn().mockResolvedValue(record),
      markSynced: vi.fn().mockResolvedValue(undefined),
      recordFailure: vi.fn().mockResolvedValue(undefined),
    },
    contacts: {
      add: vi.fn().mockResolvedValue("contact-1"),
      remove: vi.fn().mockResolvedValue(undefined),
      ...over,
    },
    report: vi.fn().mockResolvedValue(undefined),
    now: () => now,
  } satisfies MailingListDeps;
  return { deps, handle: createMailingList(deps) };
}

const add = { type: "add", email: "sam@example.com" } as const;
const remove = { type: "remove", email: "sam@example.com" } as const;

describe("messageSchema", () => {
  it("accepts an add or remove for an address, tidied", () => {
    expect(messageSchema.parse({ type: "add", email: " Sam@Example.COM " })).toEqual({ type: "add", email: "sam@example.com" });
  });

  it("rejects anything else", () => {
    expect(messageSchema.safeParse({ type: "send", email: "a@b.co" }).success).toBe(false);
    expect(messageSchema.safeParse({ type: "add", email: "nope" }).success).toBe(false);
  });
});

describe("adding", () => {
  it("adds the person with their first name and records that it is done", async () => {
    const { deps, handle } = setup();
    expect(await handle(add, queuedAt)).toBe("added");
    expect(deps.contacts.add).toHaveBeenCalledWith({ email: "sam@example.com", firstName: "Sam" });
    expect(deps.signups.markSynced).toHaveBeenCalledWith("sam@example.com", "contact-1");
  });

  it("adds someone who gave no name", async () => {
    const { deps, handle } = setup({});
    await handle(add, queuedAt);
    expect(deps.contacts.add).toHaveBeenCalledWith({ email: "sam@example.com", firstName: "" });
  });

  it.each([
    ["has been removed since", null],
    ["is already in Resend", { mailingListSyncedAt: new Date() }],
    ["has unsubscribed", { unsubscribedAt: new Date() }],
  ])("does nothing when the signup %s", async (_label, record) => {
    const { deps, handle } = setup(record as SignupRecord | null);
    expect(await handle(add, queuedAt)).toBe("skipped");
    expect(deps.contacts.add).not.toHaveBeenCalled();
    expect(deps.signups.markSynced).not.toHaveBeenCalled();
  });
});

describe("removing", () => {
  it("deletes the contact without needing the signup, which is already gone", async () => {
    const { deps, handle } = setup(null);
    expect(await handle(remove, queuedAt)).toBe("removed");
    expect(deps.contacts.remove).toHaveBeenCalledWith("sam@example.com");
    expect(deps.signups.get).not.toHaveBeenCalled();
  });
});

describe("when Resend fails", () => {
  const failing = { add: vi.fn().mockRejectedValue(new Error("Resend is down")) };

  it("throws while the message is young, so Pub/Sub retries it", async () => {
    const { deps, handle } = setup({}, failing, minutes(30));
    await expect(handle(add, queuedAt)).rejects.toThrow("Resend is down");
    expect(deps.signups.recordFailure).not.toHaveBeenCalled();
    expect(deps.report).not.toHaveBeenCalled();
  });

  it("gives up once the message is older than the limit: records it, reports it and stops the retries", async () => {
    const { deps, handle } = setup({}, failing, new Date(queuedAt.getTime() + DEFAULT_MAX_AGE_MS + 1));
    expect(await handle(add, queuedAt)).toBe("gave-up");
    expect(deps.signups.recordFailure).toHaveBeenCalledWith({ email: "sam@example.com", type: "add", message: "Resend is down", queuedAt });
    expect(deps.report).toHaveBeenCalledWith(expect.any(Error));
    expect(deps.signups.markSynced).not.toHaveBeenCalled();
  });

  it("can be told how long to keep trying, and copes with a failure that is not an Error", async () => {
    const { deps, handle } = setup({}, { add: vi.fn().mockRejectedValue("boom") });
    const short = createMailingList({ ...deps, maxAgeMs: 1000, now: () => minutes(1) });
    expect(await short(add, queuedAt)).toBe("gave-up");
    expect(deps.signups.recordFailure).toHaveBeenCalledWith(expect.objectContaining({ message: "unknown" }));
    void handle;
  });
});

describe("needsSync", () => {
  it("is true only for a signup that is not in Resend, not unsubscribed and not given up on", () => {
    expect(needsSync({})).toBe(true);
    expect(needsSync({ mailingListSyncedAt: 1 })).toBe(false);
    expect(needsSync({ unsubscribedAt: 1 })).toBe(false);
    expect(needsSync({ mailingListFailedAt: 1 })).toBe(false);
  });
});
