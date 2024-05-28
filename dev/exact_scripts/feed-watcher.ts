import { parse as parseToml } from "https://deno.land/std@0.196.0/toml/parse.ts";
import { join } from "https://deno.land/std@0.196.0/path/mod.ts";
import { parseFeed } from "https://deno.land/x/rss@0.6.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.2/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { createMailboxMessages } from "./mailbox.ts";

// The first command-line argument is the URL to a TOML file containing the list of feeds
const feedsListUrl = Deno.args[0];
if (!feedsListUrl) {
  console.error("Usage: feed-watcher [feed list url]");
  Deno.exit(1);
}
console.log(`Loading feeds list from ${feedsListUrl}`);
const res = await fetch(feedsListUrl);
const feedsListSchema = z.object({ feeds: z.record(z.string()) });
const { feeds } = feedsListSchema.parse(parseToml(await res.text()));

const home = Deno.env.get("HOME");
if (!home) {
  throw new Error("$HOME environment variable is not set");
}
const db = new DB(join(home, ".local/share/canac/feed-watcher.db"));
db.query(`CREATE TABLE IF NOT EXISTS seen_entries (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  entry_guid TEXT NOT NULL UNIQUE
)`);

type FeedEntry = {
  id: string;
  link: string;
  title: string;
};

// Load the feed entries from a feed URL
async function loadFeedEntries(feedUrl: string): Promise<FeedEntry[]> {
  const res = await fetch(feedUrl).catch(() => null);
  if (!res?.ok) {
    throw new Error(`Couldn't load feed at ${feedUrl}`);
  }

  try {
    const feed = await parseFeed(await res.text());
    const feedTitle = feed.title.value;
    if (!feedTitle) {
      throw new Error(`Missing title in feed at ${feedUrl}`);
    }

    return feed.entries.flatMap((
      entry,
    ) => {
      const link = (entry.links.find((link) =>
        link.rel === "alternate"
      ) || entry.links[0])?.href;
      const title = entry.title?.value;
      if (!link) {
        throw new Error(`Missing link in feed entry at ${feedUrl}`);
      }
      if (!title) {
        throw new Error(`Missing title in feed entry at ${feedUrl}`);
      }

      return [{
        id: entry.id,
        link,
        title: `${feedTitle} | ${title}`,
      }];
    });
  } catch (err) {
    throw new Error(`Error parsing feed at ${feedUrl}`, { cause: err });
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
      RETURNING entry_guid`,
      entries.map((entry) => entry.id),
    ).map(([guid]) => guid as string),
  );
  return entries.filter((entry) => newGuids.has(entry.id));
}

// Start a transaction that will be reverted if there are any errors
db.query("BEGIN TRANSACTION");

// Get all of the new feed entries, organized by feed name
const messageGroups = await Promise.all(
  Object.entries(feeds).map(async ([feedName, feedUrl]) => {
    try {
      const entries = await getNewEntries(feedUrl);
      return entries.map((entry) => ({
        mailbox: `feed-watcher/${feedName}`,
        content: `${entry.title.replaceAll("\n", " ")} ${entry.link}`,
      }));
    } catch (err) {
      console.error(err);
      if (err.cause) {
        console.error(err.cause);
      }

      return [{
        mailbox: `feed-watcher/@error/${feedName}`,
        content: err.message,
      }];
    }
  }),
);
// Convert the new feed entries into a list of mailbox messages
const messages = messageGroups.flat();
const numNewEntries =
  messages.filter((message) =>
    !message.mailbox.startsWith("feed-watcher/@error/")
  ).length;
console.log(`Found ${numNewEntries} new feed entries`);

// Create the mailbox messages and persist the seen feed entries only after creating the messages succeeds
await createMailboxMessages(messages);
db.query("END TRANSACTION");
