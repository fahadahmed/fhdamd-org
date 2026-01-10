type CmsQueryKey = 'faqs'; // Extendable for future queries

export async function fetchCms<T>(
  queryKey: CmsQueryKey,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `${import.meta.env.PUBLIC_BASE_FUNCTIONS_URL}/cms`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queryKey, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch CMS data: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
