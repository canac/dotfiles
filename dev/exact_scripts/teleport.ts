import { filter, map } from "jsr:@core/iterutil@0.9/pipe/async";
import { pipe } from "jsr:@core/pipe@0.4";
import $ from "jsr:@david/dax@0.43.2";
import {
  argument,
  flag,
  message,
  object,
  optional,
  or,
  string,
} from "jsr:@optique/core@1.0";
import { run } from "jsr:@optique/run@1.0";
import { join, resolve } from "jsr:@std/path@1";
import { z } from "jsr:@zod/zod@4.1.8";
import { home } from "./lib/cli.ts";

const devDir = join(home(), "dev");
const dataFile = join(home(), ".local", "share", "teleport.json");

const dirPaths = new Map(
  await Array.fromAsync(pipe(
    Deno.readDir(devDir),
    filter((entry) => entry.isDirectory),
    map((entry) => [entry.name, join(devDir, entry.name)]),
  )),
);
dirPaths.set("chezmoi", join(home(), ".local", "share", "chezmoi"));

const config = run(
  or(
    object({
      query: argument({
        mode: "sync",
        metavar: "QUERY",
        placeholder: "",
        parse(input) {
          return { success: true, value: input };
        },
        format(value) {
          return value;
        },
        suggest(prefix) {
          return dirPaths.keys()
            .filter((name) => name.includes(prefix))
            .map((name) => ({ kind: "literal", text: name }) as const);
        },
      }),
    }),
    object({
      interactive: flag("-i", "--interactive", {
        description: message`Pick the directory with fzf`,
      }),
      query: optional(argument(string({ metavar: "QUERY" }))),
    }),
  ),
  {
    programName: "teleport",
    description: message`Print a frecent ~/dev directory`,
    help: "option",
    completion: "option",
  },
);

const datesSchema = z.record(z.string(), z.number());

/** Load the frecency dates, dropping directories that no longer exist */
async function loadDates(): Promise<Map<string, number>> {
  try {
    const dates = datesSchema.parse(
      JSON.parse(await Deno.readTextFile(dataFile)),
    );
    return new Map(
      Object.entries(dates).filter(([name]) => dirPaths.has(name)),
    );
  } catch {
    return new Map();
  }
}

/** Select a directory interactively with fzf or by fuzzy matching the query */
async function selectDir(names: string[]): Promise<string> {
  const args = "interactive" in config
    ? config.query === undefined ? [] : ["--query", config.query]
    // match non-interactively and keep our frecency instead of fzf's match score
    : ["--filter", config.query, "--no-sort", "-i"];
  const result = await $`fzf ${args}`
    .stdinText(names.join("\n"))
    .stdout("piped")
    .noThrow();
  if (result.code !== 0) {
    if (!("interactive" in config)) {
      console.error(`teleport: no match for ${config.query}`);
    }
    Deno.exit(1);
  }
  return result.stdout.split("\n")[0];
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await Deno.stat(path)).isDirectory;
  } catch {
    return false;
  }
}

const dates = await loadDates();

let selected: string;
if (!("interactive" in config) && await isDirectory(config.query)) {
  // Accept paths to existing directories
  const path = resolve(config.query);
  const match = dirPaths.entries().find(([, dirPath]) => dirPath === path);
  if (match === undefined) {
    console.log(path);
    Deno.exit(0);
  }
  selected = match[0];
} else {
  selected = await selectDir(
    dirPaths.keys().toArray().toSorted((a, b) =>
      (dates.get(b) ?? -Infinity) - (dates.get(a) ?? -Infinity) ||
      a.localeCompare(b)
    ),
  );
}

// Frecency algorithm inspired by https://wiki.mozilla.org/User:Jesse/NewFrecency
const HALF_LIFE = 30 * 24 * 60 * 60 * 1000;
const now = Date.now();
const score = 2 ** (((dates.get(selected) ?? -Infinity) - now) / HALF_LIFE) + 1;
dates.set(selected, now + HALF_LIFE * Math.log2(score));
await Deno.writeTextFile(dataFile, JSON.stringify(Object.fromEntries(dates)));
console.log(dirPaths.get(selected));
