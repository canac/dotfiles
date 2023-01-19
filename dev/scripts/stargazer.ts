import { join } from "https://deno.land/std@0.153.0/path/mod.ts";
import { writeAll } from "https://deno.land/std@0.153.0/streams/conversion.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.1/mod.ts";
import { z } from "https://deno.land/x/zod@v3.18.0/mod.ts";

const token = Deno.env.get("GITHUB_TOKEN");
if (!token) {
  throw new Error("$GITHUB_TOKEN environment variable is not set");
}

const query = Deno.args[0];
if (!query) {
  console.error("Usage: stargazer [search query] [threshold]");
  Deno.exit(1);
}

const threshold = parseInt(Deno.args[1] ?? "");
if (Number.isNaN(threshold)) {
  console.error("Usage: stargazer [search query] [threshold]");
  Deno.exit(1);
}

const home = Deno.env.get("HOME");
if (!home) {
  throw new Error("$HOME environment variable is not set");
}
const db = new DB(join(home, ".local/share/canac/stargazer.db"));
db.query(`CREATE TABLE IF NOT EXISTS seen_repos (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  stars INTEGER NOT NULL
)`);

type Repo = {
  name: string;
  description: string;
  stars: number;
  updatedAt: Date;
};

const gqlResponse = z.object({
  data: z.object({
    search: z.object({
      nodes: z.array(z.object({
        nameWithOwner: z.string(),
        description: z.string().nullable(),
        stargazerCount: z.number(),
        pushedAt: z.string().nullable(),
      })),
      pageInfo: z.object({
        endCursor: z.string().nullable(),
        hasNextPage: z.boolean(),
      }),
    }),
  }),
});

async function* loadRepos(criteria: string): AsyncIterable<Repo> {
  const query = `query($criteria: String!, $cursor: String) {
  search(query: $criteria, type: REPOSITORY, first: 100, after: $cursor) {
  	nodes {
      ... on Repository {
        nameWithOwner
        description
        pushedAt
        stargazerCount
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`;

  let cursor: string | null = null;
  while (true) {
    const body: string = JSON.stringify({
      query,
      variables: { criteria, cursor },
    });
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body,
    });
    const searchResults =
      (await gqlResponse.parseAsync(await res.json())).data.search;
    yield* searchResults.nodes.map((repo) => ({
      name: repo.nameWithOwner,
      description: repo.description ?? "",
      stars: repo.stargazerCount,
      updatedAt: new Date(repo.pushedAt ?? 0),
    }));

    cursor = searchResults.pageInfo.endCursor;
    if (!searchResults.pageInfo.hasNextPage) {
      return;
    }
  }
}

async function getNewRepos(
  criteria: string,
  threshold: number,
): Promise<Repo[]> {
  const repos = [];
  for await (const repo of loadRepos(`stars:>=${threshold} ${criteria}`)) {
    repos.push(repo);
  }

  if (repos.length === 0) {
    // The SQLite query will be malformed if there aren't any values provided
    // to new_repos, so just abort
    return [];
  }

  // Get new repos and old repos that have increased to the whole-number exponent `threshold` of stars
  const newRepos = new Set(
    db.query(
      `WITH new_repos(name, stars) AS (VALUES ${
        repos.map(() => "(?, ?)").join(",")
      })
      INSERT INTO seen_repos (name, stars)
      SELECT new_repos.name, new_repos.stars FROM new_repos LEFT JOIN seen_repos USING(name) WHERE seen_repos.stars IS NULL OR new_repos.stars > seen_repos.stars
      ON CONFLICT(name) DO UPDATE SET stars=excluded.stars
      RETURNING name, stars`,
      repos.flatMap((
        repo,
      ) => [
        repo.name,
        // Truncate to a whole-number exponent of `threshold`
        Math.pow(2, Math.floor(Math.log2(repo.stars / threshold))) * threshold,
      ]),
    ).map(([name]) => name as string),
  );
  return repos.filter((repo) => newRepos.has(repo.name));
}

// Convert the new repo entries into a list of mailbox messages
const newRepos = (await getNewRepos(query, threshold)).map(
  (repo) => ({
    mailbox: "stargazer",
    content: `${repo.name} (${repo.stars} ⭐): ${repo.description}`,
  }),
);
console.log(`Found ${newRepos.length} new repos`);

// Create the mailbox messages
const stdin = newRepos.map((message) => JSON.stringify(message)).join("\n");
const process = Deno.run({
  cmd: ["mailbox", "import", "--format=json"],
  stdin: "piped",
});
await writeAll(process.stdin, new TextEncoder().encode(stdin));
process.stdin.close();
await process.status();
