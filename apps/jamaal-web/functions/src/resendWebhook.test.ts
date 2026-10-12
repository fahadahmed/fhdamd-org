import { describe, expect, it, vi } from "vitest";
import { createWebhookHandler } from "./resendWebhook";

const headers = { id: "msg_1", timestamp: "1", signature: "v1,abc" };
const setup = (event: ReturnType<typeof vi.fn> | (() => unknown) = () => ({ type: "contact.updated", data: { email: "Sam@Example.com", unsubscribed: true } })) => {
  const setUnsubscribed = vi.fn().mockResolvedValue(undefined);
  const verify = vi.fn(event as () => never);
  return { setUnsubscribed, verify, handle: createWebhookHandler({ verify, setUnsubscribed }) };
};

describe("createWebhookHandler", () => {
  it("records an unsubscribe", async () => {
    const { handle, setUnsubscribed, verify } = setup();
    expect(await handle({ method: "POST", rawBody: "{}", headers })).toEqual({ status: 200, body: "ok" });
    expect(verify).toHaveBeenCalledWith("{}", headers);
    expect(setUnsubscribed).toHaveBeenCalledWith("sam@example.com", true);
  });

  it("accepts and ignores events it does not care about", async () => {
    const { handle, setUnsubscribed } = setup(() => ({ type: "email.delivered", data: {} }));
    expect((await handle({ method: "POST", rawBody: "{}", headers })).status).toBe(200);
    expect(setUnsubscribed).not.toHaveBeenCalled();
  });

  it("turns away anything that is not a signed POST", async () => {
    const { handle, setUnsubscribed } = setup();
    expect((await handle({ method: "GET", rawBody: "", headers })).status).toBe(405);
    expect((await handle({ method: "POST", rawBody: "{}", headers: { id: "x" } })).status).toBe(400);
    const forged = setup(() => {
      throw new Error("bad signature");
    });
    expect(await forged.handle({ method: "POST", rawBody: "{}", headers })).toEqual({ status: 400, body: "Invalid signature" });
    expect(forged.setUnsubscribed).not.toHaveBeenCalled();
    expect(setUnsubscribed).not.toHaveBeenCalled();
  });
});
