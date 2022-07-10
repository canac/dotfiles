import postgres from "https://deno.land/x/postgresjs@v3.2.4/mod.js";
import { parseFeed } from "https://deno.land/x/rss@0.5.6/mod.ts";
import feeds from "./feeds.json" assert { type: "json" };

const sql = postgres({
  user: "postgres",
  db: "feed-watcher",

  // Ignore notice messages
  onnotice: () => {},
});

await sql`CREATE TABLE IF NOT EXISTS seen_entries (
  id SERIAL PRIMARY KEY,
  entry_guid TEXT NOT NULL,
  CONSTRAINT seen_entries_entry_guid UNIQUE(entry_guid)
);`;

type FeedEntry = { id: string; link: string; title: string; updated: Date };

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
      const updated = entry.updated;
      if (!link) {
        console.error(`Missing link in feed entry at ${feedUrl}`);
        return [];
      }
      if (!title) {
        console.error(`Missing title in feed entry at ${feedUrl}`);
        return [];
      }
      if (!updated) {
        console.error(
          `Missing updated date in feed entry at ${feedUrl}`,
        );
        return [];
      }

      return [{
        id: entry.id,
        link,
        title: `${feedTitle} | ${title}`,
        updated,
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
  const existingEntries: [{ entry_guid: string }] = await sql
    `SELECT entry_guid FROM seen_entries WHERE entry_guid IN ${
      sql(entries.map((entry) => entry.id))
    }`;
  const newEntries = entries.filter((entry) =>
    !existingEntries.find((existingEntry) =>
      entry.id === existingEntry.entry_guid
    )
  );
  if (newEntries.length > 0) {
    await sql`INSERT INTO seen_entries ${
      sql(newEntries.map((entry) => ({ entry_guid: entry.id })), "entry_guid")
    } ON CONFLICT (entry_guid) DO NOTHING`;
  }
  return newEntries;
}

// Load all of the entries in all of the feeds
const entries = (await Promise.all(
  feeds.map((feedUrl) => getNewEntries(feedUrl)),
)).flat();
console.log(`${entries.length} new feed entries`);

if (entries.length > 0) {
  const messages = entries.map((entry) =>
    `${entry.title.replaceAll("\n", " ")} ${entry.link}`
  ).join("\n");
  const process = Deno.run({
    cmd: ["mailbox", "add", "feed-watcher", "-"],
    stdin: "piped",
  });
  await process.stdin.write(new TextEncoder().encode(messages));
  process.stdin.close();
  await process.status();
}

sql.end();
