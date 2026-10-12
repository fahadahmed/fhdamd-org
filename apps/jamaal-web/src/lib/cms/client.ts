/**
 * The one way the site talks to DatoCMS: a GraphQL request to the Content
 * Delivery API at build time. Published content only (no draft previews).
 * It throws on any failure, so a build can never ship a page with missing content.
 */

const ENDPOINT = "https://graphql.datocms.com/";

export class CmsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CmsError";
  }
}

export interface CmsConfig {
  /** Read-only Content Delivery API token. Defaults to DATOCMS_API_TOKEN. */
  token?: string;
  /** A DatoCMS sandbox environment to read from. Defaults to DATOCMS_ENVIRONMENT, then the primary one. */
  environment?: string;
  fetch?: typeof fetch;
  /** Extra attempts after a network error, a 429 or a 5xx. */
  retries?: number;
  timeoutMs?: number;
  /** Replaced in tests so retries don't wait. */
  sleep?: (ms: number) => Promise<void>;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const retryable = (status: number) => status === 429 || status >= 500;

interface GraphQlPayload<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function fetchCms<T>(query: string, variables: Record<string, unknown> = {}, config: CmsConfig = {}): Promise<T> {
  const token = config.token ?? import.meta.env.DATOCMS_API_TOKEN;
  if (!token) {
    throw new CmsError("DATOCMS_API_TOKEN is not set. The site is built from DatoCMS, so a read-only Content Delivery API token is required.");
  }
  const environment = config.environment ?? import.meta.env.DATOCMS_ENVIRONMENT;
  const doFetch = config.fetch ?? fetch;
  const sleep = config.sleep ?? wait;
  const retries = config.retries ?? 2;
  const timeoutMs = config.timeoutMs ?? 15_000;

  let failure = "";
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (attempt > 0) await sleep(500 * 2 ** (attempt - 1));
    try {
      const response = await doFetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(environment ? { "X-Environment": environment } : {}),
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        failure = `DatoCMS request failed: ${response.status}`;
        if (retryable(response.status)) continue;
        throw new CmsError(failure);
      }
      const payload = (await response.json()) as GraphQlPayload<T>;
      if (payload.errors?.length) {
        throw new CmsError(`DatoCMS returned errors: ${payload.errors.map((e) => e.message).join("; ")}`);
      }
      if (!payload.data) throw new CmsError("DatoCMS returned no data");
      return payload.data;
    } catch (error) {
      if (error instanceof CmsError) throw error;
      failure = `DatoCMS request failed: ${(error as Error).message}`;
    }
  }
  throw new CmsError(failure);
}
