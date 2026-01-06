import { parseFeed as parse } from "npm:feedsmith@^1.9.0";

export interface Feed {
  title: string;
  entries: FeedEntry[];
}

export interface FeedEntry {
  id: string;
  link: string;
  title: string;
  categories?: string[];
}

export function parseFeed(contents: string): Feed {
  const feed = parse(contents);

  if (feed.type === "rss") {
    const rssFeed = feed.feed;
    if (!rssFeed.title) {
      throw new Error("Missing title in feed");
    }

    return {
      title: rssFeed.title,
      entries: rssFeed.items?.map((item) => {
        const title = item.title ?? item.description;
        if (!item.guid) {
          throw new Error("Missing guid in feed entry");
        }
        if (!item.link) {
          throw new Error("Missing link in feed entry");
        }
        if (!title) {
          throw new Error("Missing title and description in feed entry");
        }

        return {
          id: item.guid,
          link: item.link,
          title,
          categories: item.categories
            ?.map((category) => category.name)
            .filter((name) => typeof name === "string") ?? [],
        };
      }) ?? [],
    };
  } else if (feed.type === "atom") {
    const atomFeed = feed.feed;
    if (!atomFeed.title) {
      throw new Error("Missing title in feed");
    }

    return {
      title: atomFeed.title,
      entries: atomFeed.entries?.map((entry) => {
        const title = entry.title;
        if (!entry.id) {
          throw new Error("Missing id in feed entry");
        }
        const link = (entry.links?.find((link) =>
          link.rel === "alternate"
        ) ?? entry.links?.[0])?.href;
        if (!link) {
          throw new Error("Missing link in feed entry");
        }
        if (!title) {
          throw new Error("Missing title and description in feed entry");
        }

        return {
          id: entry.id,
          link,
          title,
          categories: entry.categories
            ?.map((category) => category.term)
            .filter((name) => typeof name === "string") ?? [],
        };
      }) ?? [],
    };
  }

  throw new Error("Invalid feed type");
}
