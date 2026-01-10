import { CMS_QUERIES } from './queries';

export type CmsQueryKey = keyof typeof CMS_QUERIES;

export function getCmsQuery(key: CmsQueryKey): string {
  if (!(key in CMS_QUERIES)) {
    throw new Error(`CMS query for key "${key}" not found.`);
  }
  return CMS_QUERIES[key as CmsQueryKey];
}
