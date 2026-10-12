import { describe, expect, it, vi } from "vitest";
import { dispatchRebuild } from "./rebuild";

const config = { token: "ghp_test", owner: "fahadahmed", repo: "fhdamd-org", workflow: "ci-jamaal-web.yml", ref: "main" };

describe("dispatchRebuild", () => {
  it("asks GitHub to run the workflow on the branch", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    await dispatchRebuild(config, fetchFn);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://api.github.com/repos/fahadahmed/fhdamd-org/actions/workflows/ci-jamaal-web.yml/dispatches");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer ghp_test");
    expect(init.headers.Accept).toBe("application/vnd.github+json");
    expect(JSON.parse(init.body)).toEqual({ ref: "main" });
  });

  it.each([401, 403, 404, 422, 500])("throws when GitHub answers %i", async (status) => {
    const fetchFn = vi.fn().mockResolvedValue(new Response("nope", { status }));
    await expect(dispatchRebuild(config, fetchFn)).rejects.toThrow(`dispatch failed: ${status}`);
  });

  it("never puts the token in the error", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response("nope", { status: 401 }));
    const error = await dispatchRebuild(config, fetchFn).catch((e) => e as Error);
    expect(error.message).not.toContain("ghp_test");
  });
});
