import { useQuery } from "@tanstack/react-query";
import { fetchLatestCommit, fetchVersionMetadata } from "./api";

export function useVersionMetadata() {
  return useQuery({
    queryKey: ["version-metadata"],
    queryFn: fetchVersionMetadata,
    staleTime: 5 * 60_000
  });
}

export function useLatestCommit() {
  return useQuery({
    queryKey: ["latest-main-commit"],
    queryFn: fetchLatestCommit,
    staleTime: 60_000
  });
}
