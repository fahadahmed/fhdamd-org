import { describe, it, expect, vi, beforeEach } from "vitest";

const { exceptionMock } = vi.hoisted(() => ({ exceptionMock: vi.fn() }));
vi.mock("./utils/lib/logger", () => ({
  log: { exception: exceptionMock },
}));

import { onRequest } from "./middleware";

function makeContext(pathname: string) {
  return { url: new URL(`https://pdf-craft.app${pathname}`) } as any;
}

beforeEach(() => {
  exceptionMock.mockClear();
});

describe("middleware", () => {
  it("reports a failed contact action request to Sentry", async () => {
    const response = new Response(JSON.stringify({ error: "Bad input" }), { status: 400 });
    const next = vi.fn().mockResolvedValue(response);

    const result = await onRequest(makeContext("/_actions/contact.sendMessage"), next);

    expect(exceptionMock).toHaveBeenCalledTimes(1);
    const [error, ctx] = exceptionMock.mock.calls[0];
    expect(error.message).toContain("/_actions/contact.sendMessage");
    expect(ctx).toMatchObject({ feature: "contact", status: 400 });
    expect(result).toBe(response);
  });

  it("does not report a successful contact action request", async () => {
    const response = new Response(JSON.stringify({ success: true }), { status: 200 });
    const next = vi.fn().mockResolvedValue(response);

    await onRequest(makeContext("/_actions/contact.sendMessage"), next);

    expect(exceptionMock).not.toHaveBeenCalled();
  });

  it("ignores failures on unmonitored routes", async () => {
    const response = new Response("Not found", { status: 404 });
    const next = vi.fn().mockResolvedValue(response);

    await onRequest(makeContext("/some/other/page"), next);

    expect(exceptionMock).not.toHaveBeenCalled();
  });
});
