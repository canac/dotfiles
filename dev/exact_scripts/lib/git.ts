import $ from "jsr:@david/dax@0.43.2";
import { assert } from "./cli.ts";

export interface GitHubRepo {
  org: string;
  repo: string;
}

export async function branchExists(branch: string): Promise<boolean> {
  const result = await $`git show-ref --quiet refs/heads/${branch}`.noThrow();
  return result.code === 0;
}

export async function currentGitHubRepo(): Promise<GitHubRepo> {
  const remoteUrl = await $`git remote get-url origin`.text();
  const match = remoteUrl.match(
    /https:\/\/github\.com\/(?<org>.+?)\/(?<repo>.+?)(?:\.git)?$/,
  );
  assert(match?.groups, "origin URL does not match a GitHub repo");
  return { org: match.groups.org, repo: match.groups.repo };
}
