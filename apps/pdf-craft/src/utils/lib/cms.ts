type CmsQueryKey = "faqs" | "pricing" | "operations" | "testimonials" | "sectionHeaders" | "homePage" | "legalPage";

const _cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchCms<T>(
  queryKey: CmsQueryKey,
  variables?: Record<string, unknown>,
): Promise<T> {
  const cacheKey = variables
    ? `${queryKey}:${JSON.stringify(variables)}`
    : queryKey;
  const now = Date.now();
  const cached = _cache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.data as T;

  const response = await fetch(
    `${import.meta.env.PUBLIC_BASE_FUNCTIONS_URL}/cms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queryKey, variables }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch CMS data: ${response.statusText}`);
  }

  const data = await response.json();
  _cache.set(cacheKey, { data, expiresAt: now + CACHE_TTL });
  return data as T;
}
