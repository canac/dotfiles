import { parse as parseToml } from "jsr:@std/toml@1.0.1";
import { join } from "jsr:@std/path@1.0.4";
import { parseFeed } from "jsr:@mikaelporttila/rss@1.1.1";
import { DB } from "https://deno.land/x/sqlite@v3.9.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { createMailboxMessages } from "./mailbox.ts";

const feedDefinition = z.object({
  url: z.string(),
  categories: z.array(z.string()).optional(),
});
type FeedDefinition = z.infer<typeof feedDefinition>;

// The first command-line argument is the URL to a TOML file containing the list of feeds
const feedsListUrl = Deno.args[0];
if (!feedsListUrl) {
  console.error("Usage: feed-watcher [feed list url]");
  Deno.exit(1);
}
console.log(`Loading feeds list from ${feedsListUrl}`);
const res = await fetch(feedsListUrl);
const feedsListSchema = z.object({
  feeds: z.record(
    z.union([z.string(), feedDefinition]).transform((feed) => {
      // Convert URLs to feed definitions
      if (typeof feed === "string") {
        return { url: feed };
      }
      return feed;
    }),
  ),
});
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
async function loadFeedEntries(
  feedDefinition: FeedDefinition,
): Promise<FeedEntry[]> {
  const feedUrl = feedDefinition.url;
  const res = await fetch(feedUrl).catch(() => null);
  if (!res?.ok) {
    throw new Error(`Couldn't load feed at ${feedUrl}`);
  }

  try {
    const feed = await parseFeed(await res.text());
    const feedTitle = feed.title.value;
    const feedCategories = feedDefinition.categories;
    if (!feedTitle) {
      throw new Error(`Missing title in feed at ${feedUrl}`);
    }

    return feed.entries.flatMap((entry) => {
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

      if (
        feedCategories &&
        !entry.categories?.some((category) =>
          category.term && feedCategories.includes(category.term)
        )
      ) {
        // The feed doesn't match any whitelisted category, so skip it
        return [];
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
async function getNewEntries(
  feedDefinition: FeedDefinition,
): Promise<FeedEntry[]> {
  const entries = await loadFeedEntries(feedDefinition);
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
  Object.entries(feeds).map(async ([feedName, feedDefinition]) => {
    try {
      const entries = await getNewEntries(feedDefinition);
      return entries.map((entry) => ({
        mailbox: `feed-watcher/${feedName}`,
        content: `${entry.title.replaceAll("\n", " ")} ${entry.link}`,
      }));
    } catch (err) {
      console.error(err);
      if (!(err instanceof Error)) {
        return [];
      }

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
