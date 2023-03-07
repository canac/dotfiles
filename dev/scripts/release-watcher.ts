import { parse as parseToml } from "https://deno.land/std@0.154.0/encoding/toml.ts";
import { join } from "https://deno.land/std@0.154.0/path/mod.ts";
import { writeAll } from "https://deno.land/std@0.154.0/streams/conversion.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.1/mod.ts";
import { z } from "https://deno.land/x/zod@v3.18.0/mod.ts";

// The first command-line argument is the URL to a TOML file containing the list of packages to watch
const packagesListUrl = Deno.args[0];
if (!packagesListUrl) {
  console.error("Usage: release-watcher [package list url]");
  Deno.exit(1);
}
console.log(`Loading packages list from ${packagesListUrl}`);
const res = await fetch(packagesListUrl);
const packageListSchema = z.object({
  packages: z.record(z.union(
    [z.literal("all"), z.literal("minor"), z.literal("major")],
  )),
});
const packages = packageListSchema.parse(parseToml(await res.text())).packages;

const home = Deno.env.get("HOME");
if (!home) {
  throw new Error("$HOME environment variable is not set");
}
const db = new DB(join(home, ".local/share/canac/release-watcher.db"));
db.query(`CREATE TABLE IF NOT EXISTS package (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL
)`);

const lastVersions = new Map(
  db.query(`SELECT name, version FROM package`).map((
    [name, version],
  ) => [name as string, version as string]),
);

type ChangeType = "all" | "minor" | "major";

const converters: {
  [key in ChangeType]: (version: string) => string;
} = {
  all: (v) => v,
  minor: (v) => v.split(".").slice(0, 2).join("."),
  major: (v) => v.split(".")[0],
};

const updates: string[] = [];
for (const [packageName, changeType] of Object.entries(packages)) {
  const res = await fetch(`https://registry.npmjs.org/${packageName}`);
  const body = await res.json();
  const currentVersion = body["dist-tags"].latest;
  const converter = converters[changeType];
  if (
    converter(lastVersions.get(packageName) ?? "") !==
      converter(currentVersion)
  ) {
    updates.push(`${packageName} v${currentVersion}`);
    db.query(
      `INSERT INTO package(name, version) VALUES(?, ?) ON CONFLICT(name) DO UPDATE SET version=?`,
      [packageName, currentVersion, currentVersion],
    );
  }
}

// Add the new messages
const process = Deno.run({
  cmd: ["mailbox", "import", "--format=json"],
  stdin: "piped",
});
const stdin = updates.map((update) =>
  JSON.stringify({ mailbox: "release-watcher", content: update })
).join("\n");
await writeAll(process.stdin, new TextEncoder().encode(stdin));
process.stdin.close();
await process.status();
