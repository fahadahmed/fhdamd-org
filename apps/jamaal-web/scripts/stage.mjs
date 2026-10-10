/**
 * Which stage the site is in: `waitlist`, `testflight` or `launched`.
 *
 * The stage lives in Firebase Remote Config (parameter `site_stage`) so it can
 * be flipped without a code change. The site is static, so CI reads it once at
 * build time and hands it to Astro as PUBLIC_SITE_STAGE.
 *
 * Run as a script it prints the resolved stage (and writes it to $GITHUB_ENV
 * when that is set). Everything else is exported so it can be unit-tested.
 */
import { createSign } from "node:crypto";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { DEFAULT_STAGE, STAGE_PARAMETER, STAGES, parseStage, stageFromTemplate } from "./stage-parse.mjs";

export { DEFAULT_STAGE, STAGE_PARAMETER, STAGES, parseStage, stageFromTemplate };

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/firebase.remoteconfig";

const base64url = (input) => Buffer.from(input).toString("base64url");

/** A signed service-account JWT for the Google OAuth token exchange (RS256). */
export function createJwt(serviceAccount, nowSeconds) {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    }),
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${claims}`)
    .sign(serviceAccount.private_key, "base64url");
  return `${header}.${claims}.${signature}`;
}

export async function fetchAccessToken(serviceAccount, fetchFn = fetch, nowSeconds = Math.floor(Date.now() / 1000)) {
  const response = await fetchFn(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createJwt(serviceAccount, nowSeconds),
    }),
  });
  if (!response.ok) throw new Error(`Google token exchange failed: ${response.status}`);
  const { access_token: token } = await response.json();
  if (!token) throw new Error("Google token exchange returned no access token");
  return token;
}

/** Reads the published Remote Config template and returns its stage. */
export async function fetchStage(serviceAccount, projectId, fetchFn = fetch) {
  const token = await fetchAccessToken(serviceAccount, fetchFn);
  const response = await fetchFn(
    `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
    { headers: { Authorization: `Bearer ${token}`, "Accept-Encoding": "gzip" } },
  );
  if (!response.ok) throw new Error(`Remote Config read failed: ${response.status}`);
  return stageFromTemplate(await response.json());
}

/**
 * Where the stage comes from, in order:
 *  1. SITE_STAGE: an explicit override (local previews).
 *  2. Remote Config, when a service account is available. If the read fails
 *     this throws, so a build never ships an outdated stage by accident. Set
 *     STAGE_READ_OPTIONAL (preview builds) to fall back to the default instead.
 *  3. The default (`waitlist`), for builds with no credentials such as forks.
 */
export async function resolveStage(env = process.env, fetchFn = fetch) {
  if (env.SITE_STAGE) return { stage: parseStage(env.SITE_STAGE), source: "SITE_STAGE" };
  const raw = env.FIREBASE_SERVICE_ACCOUNT_JAMAAL_WEB;
  if (!raw) return { stage: DEFAULT_STAGE, source: "default (no credentials)" };
  try {
    const serviceAccount = JSON.parse(raw);
    const projectId = env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id;
    return { stage: await fetchStage(serviceAccount, projectId, fetchFn), source: "Remote Config" };
  } catch (error) {
    if (!env.STAGE_READ_OPTIONAL) throw error;
    return { stage: DEFAULT_STAGE, source: `default (Remote Config unreadable: ${error.message})` };
  }
}

/**
 * The command-line behaviour: print the stage, export it to the next GitHub
 * Actions steps, and return the process exit code.
 */
export async function run(env = process.env, fetchFn = fetch, io = { log: console.error, out: console.log, appendEnv: appendFileSync }) {
  try {
    const { stage, source } = await resolveStage(env, fetchFn);
    io.log(`Site stage: ${stage} (${source})`);
    if (env.GITHUB_ENV) io.appendEnv(env.GITHUB_ENV, `PUBLIC_SITE_STAGE=${stage}\n`);
    io.out(stage);
    return 0;
  } catch (error) {
    io.log(`Could not resolve the site stage: ${error.message}`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await run();
}
