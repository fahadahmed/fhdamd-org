import { defineSecret } from 'firebase-functions/params';

export const datocmsApiToken = defineSecret('DATOCMS_API_TOKEN');
export const datocmsEnv = defineSecret('DATOCMS_ENV');

const DATOCMS_ENDPOINT = 'https://graphql.datocms.com/';

export async function fetchCMSData(
  query: string,
  variables: Record<string, any> = {}
) {
  const response = await fetch(DATOCMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${datocmsApiToken.value()}`,
      'X-Environment': datocmsEnv.value(),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error fetching data from DatoCMS: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  return data;
}
