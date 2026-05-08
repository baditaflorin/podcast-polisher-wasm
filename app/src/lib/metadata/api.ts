import { appLinks, buildInfo } from "./static";
import { GitHubCommitSchema, type LatestCommit, VersionMetadataSchema, type VersionMetadata } from "./schema";

export async function fetchVersionMetadata(): Promise<VersionMetadata> {
  const response = await fetch(`${import.meta.env.BASE_URL}version.json`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return VersionMetadataSchema.parse({
      version: buildInfo.version,
      commit: buildInfo.commit,
      builtAt: buildInfo.builtAt,
      repositoryUrl: appLinks.repositoryUrl,
      pagesUrl: appLinks.pagesUrl,
      supportUrl: appLinks.supportUrl
    });
  }

  return VersionMetadataSchema.parse(await response.json());
}

export async function fetchLatestCommit(): Promise<LatestCommit> {
  const response = await fetch(
    "https://api.github.com/repos/baditaflorin/podcast-polisher-wasm/commits/main",
    {
      headers: {
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}`);
  }

  const commit = GitHubCommitSchema.parse(await response.json());

  return {
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 12),
    url: commit.html_url
  };
}
