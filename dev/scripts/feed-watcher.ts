import { parse as parseToml } from "https://deno.land/std@0.154.0/encoding/toml.ts";
import { writeAll } from "https://deno.land/std@0.154.0/streams/conversion.ts";
import { join } from "https://deno.land/std@0.154.0/path/mod.ts";
import { parseFeed } from "https://deno.land/x/rss@0.5.6/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.1/mod.ts";
import { z } from "https://deno.land/x/zod@v3.18.0/mod.ts";

// The first command-line argument is the URL to a TOML file containing the list of feeds
const feedsListUrl = Deno.args[0];
if (!feedsListUrl) {
  console.error("Usage: feed-watcher [feed list url]");
  Deno.exit(1);
}
console.log(`Loading feeds list from ${feedsListUrl}`);
const res = await fetch(feedsListUrl);
const feedsListSchema = z.object({ feeds: z.record(z.string()) });
const feeds = feedsListSchema.parse(parseToml(await res.text())).feeds;

const home = Deno.env.get("HOME");
if (!home) {
  throw new Error("$HOME environment variable is not set");
}
const db = new DB(join(home, ".local/share/canac/feed-watcher.db"));
db.query(`CREATE TABLE IF NOT EXISTS seen_entries (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  entry_guid TEXT NOT NULL UNIQUE
)`);

type FeedEntry = { id: string; link: string; title: string };

// Load the feed entries from a feed URL
async function loadFeedEntries(feedUrl: string): Promise<FeedEntry[]> {
  const res = await fetch(feedUrl);
  if (!res.ok) {
    console.error(`Couldn't load feed at ${feedUrl}`);
    return [];
  }

  try {
    const feed = await parseFeed(await res.text());
    const feedTitle = feed.title.value;
    if (!feedTitle) {
      console.error(`Missing title in feed at ${feedUrl}`);
      return [];
    }

    return feed.entries.flatMap((
      entry,
    ) => {
      const link = entry.links[0]?.href;
      const title = entry.title?.value;
      if (!link) {
        console.error(`Missing link in feed entry at ${feedUrl}`);
        return [];
      }
      if (!title) {
        console.error(`Missing title in feed entry at ${feedUrl}`);
        return [];
      }

      return [{
        id: entry.id,
        link,
        title: `${feedTitle} | ${title}`,
      }];
    });
  } catch (err) {
    console.error(`Error parsing feed at ${feedUrl}`);
    console.error(err);
    return [];
  }
}

// Load a feed URL and return the new feed entries
async function getNewEntries(feedUrl: string): Promise<FeedEntry[]> {
  const entries = await loadFeedEntries(feedUrl);
  if (entries.length === 0) {
    // The SQLite query will be malformed if there aren't any values provided
    // to new_entries, so just abort
    return [];
  }

  const newGuids = new Set(
    db.query(
      `WITH new_entries(entry_guid) AS (VALUES ${
        entries.map(() => "(?)").join(",")
      })
      INSERT INTO seen_entries (entry_guid)
      SELECT entry_guid FROM new_entries
      EXCEPT SELECT entry_guid FROM seen_entries
      RETURNING entry_guid;`,
      entries.map((entry) => entry.id),
    ).map(([guid]) => guid as string),
  );
  return entries.filter((entry) => newGuids.has(entry.id));
}

// Get all of the new feed entries, organized by feed name
const feedsWithUpdates = (await Promise.all(
  Object.entries(feeds).map(async ([feedName, feedUrl]) => ({
    feedName,
    newEntries: await getNewEntries(feedUrl),
  })),
)).filter(({ newEntries }) => newEntries.length > 0);

db.close();

// Convert the new feed entries into a list of mailbox messages
const newMessages = feedsWithUpdates.flatMap(({ feedName, newEntries }) =>
  newEntries.map((entry) => ({
    mailbox: `feed-watcher/${feedName}`,
    content: `${entry.title.replaceAll("\n", " ")} ${entry.link}`,
  }))
);
console.log(`Found ${newMessages.length} new feed entries`);

// Create the mailbox messages
const stdin = newMessages
  .map((message) => JSON.stringify(message))
  .join("\n");
const process = Deno.run({
  cmd: ["mailbox", "import", "--format=json"],
  stdin: "piped",
});
await writeAll(process.stdin, new TextEncoder().encode(stdin));
process.stdin.close();
await process.status();
