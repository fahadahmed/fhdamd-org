import { describe, expect, it, vi } from "vitest";
import { CmsError, fetchCms } from "./client";

const ok = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 });
const sleep = async () => {};

describe("fetchCms", () => {
  it("posts the query with the token and returns the data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ siteConfig: { contactEmail: "a@b.c" } }));
    const data = await fetchCms("query { siteConfig { contactEmail } }", { slug: "x" }, { token: "t", fetch: fetchMock });
    expect(data).toEqual({ siteConfig: { contactEmail: "a@b.c" } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://graphql.datocms.com/");
    expect(init.headers.Authorization).toBe("Bearer t");
    expect(init.headers["X-Environment"]).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ query: "query { siteConfig { contactEmail } }", variables: { slug: "x" } });
  });

  it("sends the environment when one is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({}));
    await fetchCms("q", {}, { token: "t", environment: "sandbox", fetch: fetchMock });
    expect(fetchMock.mock.calls[0][1].headers["X-Environment"]).toBe("sandbox");
  });

  it("fails without a token", async () => {
    await expect(fetchCms("q", {}, { token: "", fetch: vi.fn() })).rejects.toThrow(/DATOCMS_API_TOKEN is not set/);
  });

  it("fails on GraphQL errors without retrying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ errors: [{ message: "bad field" }] }), { status: 200 }));
    await expect(fetchCms("q", {}, { token: "t", fetch: fetchMock, sleep })).rejects.toThrow("DatoCMS returned errors: bad field");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails when there is no data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(fetchCms("q", {}, { token: "t", fetch: fetchMock })).rejects.toThrow("DatoCMS returned no data");
  });

  it("does not retry a client error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
    const error = await fetchCms("q", {}, { token: "t", fetch: fetchMock, sleep }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CmsError);
    expect((error as Error).message).toBe("DatoCMS request failed: 401");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a server error and then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValueOnce(ok({ ok: true }));
    const delays: number[] = [];
    const data = await fetchCms("q", {}, { token: "t", fetch: fetchMock, sleep: async (ms) => void delays.push(ms) });
    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(delays).toEqual([500, 1000]);
  });

  it("gives up after the retries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 500 }));
    await expect(fetchCms("q", {}, { token: "t", fetch: fetchMock, sleep, retries: 1 })).rejects.toThrow("DatoCMS request failed: 500");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
