import $ from "jsr:@david/dax@0.43.2";
import { derivePromptConfig, prompt } from "jsr:@optique/clack@1.3";
import {
  argument,
  conditional,
  constant,
  dependency,
  flag,
  map,
  message,
  object,
  option,
  optional,
  or,
  string,
} from "jsr:@optique/core@1.3";
import { gitRef } from "jsr:@optique/git@1.3";
import { run } from "jsr:@optique/run@1.3";
import { memoize } from "jsr:@std/cache@0.2/memoize";
import { bold, cyan, dim } from "jsr:@std/fmt@1/colors";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import {
  autocomplete,
  cancel,
  isCancel,
  Option,
} from "npm:@clack/prompts@1.4.0";
import { assert, home } from "./lib/cli.ts";
import { branchExists, currentGitHubRepo } from "./lib/git.ts";
import { filter } from "./lib/iterators.ts";
import { stripPrefix } from "./lib/strings.ts";

const WORKTREE_PREFIXES = new Map<string, string>([
  ["CruGlobal/conf-registration-web", "ert"],
  ["CruGlobal/give-web", "give"],
  ["CruGlobal/know-god-web", "godtools"],
  ["CruGlobal/mpdx-react", "mpdx"],
  ["CruGlobal/mpdx_api", "mpdx-api"],
  ["CruGlobal/staff_accounting_app", "saa"],
]);

const gitHubRepo = memoize(currentGitHubRepo);

async function directoryPrefix(): Promise<string> {
  const { org, repo } = await gitHubRepo();
  return WORKTREE_PREFIXES.get(`${org}/${repo}`) ?? repo;
}

function defaultDirectory(prefix: string, branch: string): string {
  return `${prefix}-${branch.replaceAll("/", "-")}`;
}

/** Prompt the user to select an existing branch or type input a new branch */
async function promptBranch(): Promise<string> {
  // Ensure we have the latest branches
  await $`git fetch --prune`;
  const refs =
    await $`git for-each-ref refs/heads/* refs/remotes/origin/* --format ${"%(refname:short)"} --sort -committerdate`
      .lines();
  const branches = new Set(
    refs
      .filter((ref) => ref !== "HEAD")
      .map((ref) => stripPrefix(ref, "origin/") ?? ref),
  );
  assert(branches.size, "No branches found");
  const selected = await autocomplete<string>({
    message: "Choose an existing branch or create a new one:",
    placeholder: "Type a new or existing branch name",
    options() {
      const input = this.userInput.trim();
      const opts: Option<string>[] = [...branches]
        .filter((branch) => branch.includes(input))
        .map((branch) => ({ value: branch, label: branch }));
      if (input && !branches.has(input)) {
        opts.unshift({
          value: input,
          label: input,
          hint: "new",
        });
      }
      return opts;
    },
    filter: () => true,
  });
  if (isCancel(selected)) {
    cancel("Cancelled");
    Deno.exit(1);
  }
  return selected;
}

const branchSource = dependency(string({ metavar: "BRANCH" }));

const parser = object({
  branch: prompt(argument(branchSource), {
    type: "text",
    message: "Choose an existing branch or create a new one:",
    prompter: promptBranch,
  }),
  directory: conditional(
    map(
      flag("-y", "--yes", {
        description: message`Accept the generated directory name`,
      }),
      () => "yes" as const,
    ),
    { yes: constant(undefined) },
    prompt(
      option("--directory", string({ metavar: "DIR" }), {
        description: message`New worktree directory name`,
      }),
      derivePromptConfig(branchSource, async (branch) => {
        const existingDirs = new Set(
          (await Array.fromAsync(
            filter(
              Deno.readDir(join(home(), "dev")),
              (entry) => entry.isDirectory,
            ),
          )).map((entry) => entry.name),
        );
        return {
          type: "text",
          message: "Directory name:",
          initialValue: defaultDirectory(await directoryPrefix(), branch),
          validate: (value: string) =>
            existingDirs.has(value)
              ? `~/dev/${value} already exists`
              : undefined,
        };
      }),
    ),
  ),
  stack: optional(
    or(
      map(
        option("--stack", gitRef({ metavar: "REF" })),
        (ref) => ref,
      ),
      map(option("--stack"), () => "HEAD"),
    ),
  ),
});

const config = await run(parser, {
  programName: "git-work",
  description: message`Start work in a new git worktree`,
  help: "option",
  completion: "option",
  termWidth: "auto",
});

/** Install the new worktree's dependencies */
async function installDependencies() {
  if (await exists("yarn.lock")) {
    await $`yarn`;
  } else if (await exists("pnpm-lock.yaml")) {
    await $`pnpm install`;
  } else if (await exists("package-lock.json")) {
    await $`npm install`;
  }
  if (await exists("Gemfile.lock")) {
    await $`bundle install`;
  }
}

async function main() {
  const { branch } = config;
  const existing = await branchExists(branch);
  const [, directory] = config.directory;
  const relativeDir = directory ??
    defaultDirectory(await directoryPrefix(), branch);
  const destination = join(home(), "dev", relativeDir);

  console.log(
    `Creating a worktree in ${bold(cyan(`~/dev/${relativeDir}`))} on branch ${
      bold(cyan(branch))
    }${!existing && config.stack ? dim(` stacked on ${config.stack}`) : ""}`,
  );

  $.setPrintCommand(true);

  let args: string[] = [];
  if (existing) {
    args = [branch, "--force"];
  } else {
    args = ["-b", branch];

    if (config.stack) {
      args.push(config.stack);
    } else {
      const primary = await $`git primary`.text();
      args.push(`origin/${primary}`);
    }
    if (!config.stack) {
      args.push("--no-track");
    }
  }
  await $`git worktree add ${destination} ${args}`;

  const { org } = await gitHubRepo();
  const profile = org === "CruGlobal" ? "Work" : "Default";
  await $`code --profile ${profile} ${destination}`;

  Deno.chdir(destination);
  await installDependencies();
  await $`setup-env --new`.noThrow();
  await $`portman create`;

  // Write the new directory so a shell wrapper can cd into it, inspired by lazygit
  const newDirFile = Deno.env.get("GIT_WORK_NEW_DIR_FILE");
  if (newDirFile) {
    await Deno.writeTextFile(newDirFile, destination);
  }
}

await main();
