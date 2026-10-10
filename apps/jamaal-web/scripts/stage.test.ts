import { createVerify, generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  createJwt,
  fetchAccessToken,
  fetchStage,
  parseStage,
  resolveStage,
  run,
  stageFromTemplate,
} from "./stage.mjs";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const serviceAccount = {
  client_email: "deploy@jamaal-web.iam.gserviceaccount.com",
  private_key: privateKey,
  project_id: "jamaal-web",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const template = (value?: string) => ({
  parameters: value === undefined ? {} : { site_stage: { defaultValue: { value } } },
});

describe("parseStage", () => {
  it.each(["waitlist", "testflight", "launched"])("accepts %s", (stage) => {
    expect(parseStage(stage)).toBe(stage);
  });

  it("trims and lowercases", () => {
    expect(parseStage("  Launched ")).toBe("launched");
  });

  it.each([undefined, null, "", "live", 3, {}])("falls back to waitlist for %j", (value) => {
    expect(parseStage(value)).toBe("waitlist");
  });
});

describe("stageFromTemplate", () => {
  it("reads the site_stage default value", () => {
    expect(stageFromTemplate(template("testflight"))).toBe("testflight");
  });

  it("falls back to waitlist when the parameter or template is missing", () => {
    expect(stageFromTemplate(template())).toBe("waitlist");
    expect(stageFromTemplate(undefined)).toBe("waitlist");
  });
});

describe("createJwt", () => {
  it("signs the claims with the service account key", () => {
    const jwt = createJwt(serviceAccount, 1_000);
    const [header, claims, signature] = jwt.split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    expect(JSON.parse(Buffer.from(claims, "base64url").toString())).toEqual({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.remoteconfig",
      aud: "https://oauth2.googleapis.com/token",
      iat: 1_000,
      exp: 4_600,
    });
    const verifier = createVerify("RSA-SHA256").update(`${header}.${claims}`);
    expect(verifier.verify(publicKey, signature, "base64url")).toBe(true);
  });
});

describe("fetchAccessToken", () => {
  it("exchanges the JWT for an access token", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({ access_token: "tok" }));
    await expect(fetchAccessToken(serviceAccount, fetchFn, 1_000)).resolves.toBe("tok");
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(String(init.body)).toContain("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer");
  });

  it("throws when the exchange fails", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({}, 401));
    await expect(fetchAccessToken(serviceAccount, fetchFn)).rejects.toThrow("token exchange failed: 401");
  });

  it("throws when no token comes back", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({}));
    await expect(fetchAccessToken(serviceAccount, fetchFn)).rejects.toThrow("no access token");
  });
});

describe("fetchStage", () => {
  it("reads the template with the bearer token", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok" }))
      .mockResolvedValueOnce(json(template("launched")));
    await expect(fetchStage(serviceAccount, "jamaal-web", fetchFn)).resolves.toBe("launched");
    const [url, init] = fetchFn.mock.calls[1];
    expect(url).toBe("https://firebaseremoteconfig.googleapis.com/v1/projects/jamaal-web/remoteConfig");
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("throws when the read fails", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok" }))
      .mockResolvedValueOnce(json({}, 403));
    await expect(fetchStage(serviceAccount, "jamaal-web", fetchFn)).rejects.toThrow("read failed: 403");
  });
});

describe("resolveStage", () => {
  it("prefers the SITE_STAGE override", async () => {
    const fetchFn = vi.fn();
    await expect(resolveStage({ SITE_STAGE: "testflight" }, fetchFn)).resolves.toEqual({
      stage: "testflight",
      source: "SITE_STAGE",
    });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("defaults to waitlist without credentials", async () => {
    const result = await resolveStage({}, vi.fn());
    expect(result.stage).toBe("waitlist");
    expect(result.source).toContain("no credentials");
  });

  it("reads Remote Config when a service account is present", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok" }))
      .mockResolvedValueOnce(json(template("testflight")));
    const env = { FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB: JSON.stringify(serviceAccount) };
    await expect(resolveStage(env, fetchFn)).resolves.toEqual({ stage: "testflight", source: "Remote Config" });
    expect(fetchFn.mock.calls[1][0]).toContain("/projects/jamaal-web/");
  });

  it("uses FIREBASE_PROJECT_ID when given", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok" }))
      .mockResolvedValueOnce(json(template("launched")));
    const env = { FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB: JSON.stringify(serviceAccount), FIREBASE_PROJECT_ID: "other" };
    await resolveStage(env, fetchFn);
    expect(fetchFn.mock.calls[1][0]).toContain("/projects/other/");
  });

  it("falls back to waitlist for optional (preview) builds when Remote Config cannot be read", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({}, 403));
    const env = { FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB: JSON.stringify(serviceAccount), STAGE_READ_OPTIONAL: "true" };
    const result = await resolveStage(env, fetchFn);
    expect(result.stage).toBe("waitlist");
    expect(result.source).toContain("unreadable");
  });

  it("fails rather than ship a stale stage when Remote Config cannot be read", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({}, 500));
    const env = { FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB: JSON.stringify(serviceAccount) };
    await expect(resolveStage(env, fetchFn)).rejects.toThrow();
  });
});

describe("run", () => {
  const io = () => ({ log: vi.fn(), out: vi.fn(), appendEnv: vi.fn() });

  it("prints the stage and exports it to GitHub Actions", async () => {
    const sink = io();
    await expect(run({ SITE_STAGE: "testflight", GITHUB_ENV: "/tmp/env" }, vi.fn(), sink)).resolves.toBe(0);
    expect(sink.out).toHaveBeenCalledWith("testflight");
    expect(sink.appendEnv).toHaveBeenCalledWith("/tmp/env", "PUBLIC_SITE_STAGE=testflight\n");
  });

  it("does not write an env file outside GitHub Actions", async () => {
    const sink = io();
    await expect(run({}, vi.fn(), sink)).resolves.toBe(0);
    expect(sink.out).toHaveBeenCalledWith("waitlist");
    expect(sink.appendEnv).not.toHaveBeenCalled();
  });

  it("returns a failure code and prints nothing when the stage cannot be read", async () => {
    const sink = io();
    const env = { FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB: JSON.stringify(serviceAccount) };
    await expect(run(env, vi.fn().mockResolvedValue(json({}, 500)), sink)).resolves.toBe(1);
    expect(sink.out).not.toHaveBeenCalled();
    expect(sink.log).toHaveBeenCalledWith(expect.stringContaining("Could not resolve"));
  });
});
