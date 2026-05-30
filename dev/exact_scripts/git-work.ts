import $ from "jsr:@david/dax@0.43.2";
import {
  argument,
  map,
  message,
  object,
  option,
  optional,
  or,
  string,
} from "jsr:@optique/core@1.0";
import { gitRef } from "jsr:@optique/git@1.0";
import { run } from "jsr:@optique/run@1.0";
import { bold, cyan, dim, red } from "jsr:@std/fmt@1/colors";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { isCancel, TextPrompt } from "npm:@clack/core@1.3.1";
import { autocomplete, cancel, Option } from "npm:@clack/prompts@1.4.0";
import { assert, home } from "./lib/cli.ts";
import { branchExists, currentGitHubRepo } from "./lib/git.ts";
import { filter } from "./lib/iterators.ts";
import { stripPrefix } from "./lib/strings.ts";

const WORKTREE_PREFIXES = new Map<string, string>([
  ["CruGlobal/conf-registration-web", "ert"],
  ["CruGlobal/give-web", "give"],
  ["CruGlobal/mpdx-react", "mpdx"],
  ["CruGlobal/mpdx_api", "mpdx-api"],
  ["CruGlobal/staff_accounting_app", "saa"],
]);

const parser = object({
  branch: optional(
    argument(string({ metavar: "BRANCH" })),
  ),
  yes: option("-y", "--yes", {
    description: message`Accept the generated directory name`,
  }),
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
  help: "both",
  completion: "command",
});

/** Prompt the user to select an existing branch or type input a new branch */
async function promptBranch(): Promise<{ branch: string; existing: boolean }> {
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
  return {
    branch: selected,
    existing: branches.has(selected),
  };
}

/** Prompt the user to chose a directory name */
async function promptDirectory(
  dirPrefix: string,
  branch: string,
): Promise<string> {
  const defaultSuffix = branch.replaceAll("/", "-");
  if (config.yes) {
    return `${dirPrefix}-${defaultSuffix}`;
  }

  const existingDirs = new Set(
    (await Array.fromAsync(
      filter(Deno.readDir(join(home(), "dev")), (entry) => entry.isDirectory),
    )).map((entry) => entry.name),
  );

  const validate = (value: string | undefined): string | undefined => {
    const dir = `${dirPrefix}-${value ?? ""}`;
    if (existingDirs.has(dir)) {
      return `~/dev/${dir} already exists`;
    }
    return undefined;
  };

  const prompt = new TextPrompt({
    initialUserInput: defaultSuffix,
    validate,
    render() {
      const problem = validate(this.userInput);
      const line = `Directory name: ${dirPrefix}-${this.userInputWithCursor}`;
      return problem ? `${line}\n${red(problem)}` : line;
    },
  });
  const result = await prompt.prompt();
  if (isCancel(result)) {
    cancel("Cancelled");
    Deno.exit(1);
  }
  return `${dirPrefix}-${result}`;
}

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
  const { org, repo } = await currentGitHubRepo();
  const dirPrefix = WORKTREE_PREFIXES.get(`${org}/${repo}`) ?? repo;

  const { branch, existing } = config.branch
    ? { branch: config.branch, existing: await branchExists(config.branch) }
    : await promptBranch();

  const relativeDir = await promptDirectory(dirPrefix, branch);
  const directory = join(home(), "dev", relativeDir);

  console.log(
    `Creating a worktree in ${bold(cyan(`~/dev/${relativeDir}`))} on branch ${
      bold(cyan(branch))
    } ${!existing && config.stack ? dim(` stacked on ${config.stack}`) : ""}`,
  );

  $.setPrintCommand(true);

  // Disable overcommit while creating worktrees to avoid errors about the signature changing
  const env = { OVERCOMMIT_DISABLE: "1" };
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
  await $`git worktree add ${directory} ${args}`.env(env);

  const profile = org === "CruGlobal" ? "Work" : "Default";
  await $`code --profile ${profile} ${directory}`;

  Deno.chdir(directory);
  await installDependencies();
  await $`setup-env --new`.noThrow();
  await $`portman create`;

  // Write the new directory so a shell wrapper can cd into it, inspired by lazygit
  const newDirFile = Deno.env.get("GIT_WORK_NEW_DIR_FILE");
  if (newDirFile) {
    await Deno.writeTextFile(newDirFile, directory);
  }
}

await main();
