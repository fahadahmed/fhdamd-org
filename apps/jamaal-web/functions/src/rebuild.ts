export interface RebuildConfig {
  /** A GitHub token allowed to run workflows (Actions: read and write) on the repository. */
  token: string;
  owner: string;
  repo: string;
  /** The workflow file to run, for example `ci-jamaal-web.yml`. */
  workflow: string;
  ref: string;
}

/**
 * Asks GitHub to run the site's CI workflow on `ref`, which rebuilds and
 * deploys the static site with whatever the stage is by then. The site is
 * static, so a stage change only reaches visitors through a rebuild.
 */
export async function dispatchRebuild(config: RebuildConfig, fetchFn: typeof fetch = fetch): Promise<void> {
  const { token, owner, repo, workflow, ref } = config;
  const response = await fetchFn(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref }),
  });
  // GitHub answers 204 No Content when the run has been queued.
  if (response.status !== 204) throw new Error(`GitHub workflow dispatch failed: ${response.status}`);
}
