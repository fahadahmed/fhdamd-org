const DATOCMS_ENDPOINT = "https://graphql.datocms.com/";

export async function fetchCMSData<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(DATOCMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.DATOCMS_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error fetching data from DatoCMS: ${response.status} - ${errorText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`DatoCMS GraphQL error: ${JSON.stringify(payload.errors)}`);
  }
  return payload.data as T;
}
