import { z } from "zod";

export const VersionMetadataSchema = z.object({
  version: z.string().min(1),
  commit: z.string().min(1),
  builtAt: z.string().min(1),
  repositoryUrl: z.url(),
  pagesUrl: z.url(),
  supportUrl: z.url()
});

export type VersionMetadata = z.infer<typeof VersionMetadataSchema>;

export const GitHubCommitSchema = z.object({
  sha: z.string().min(7),
  html_url: z.url()
});

export type LatestCommit = {
  sha: string;
  shortSha: string;
  url: string;
};
