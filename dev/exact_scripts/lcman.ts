import { compact, filter, map } from "jsr:@core/iterutil@0.9/pipe/async";
import { pipe } from "jsr:@core/pipe@0.4";
import $ from "jsr:@david/dax@0.43.2";
import {
  argument,
  command,
  constant,
  integer,
  message,
  object,
  option,
  or,
  type ValueParser,
  withDefault,
} from "jsr:@optique/core@0.10";
import { run } from "jsr:@optique/run@0.10";
import { join } from "jsr:@std/path@1";

const home = Deno.env.get("HOME");
if (!home) {
  throw new Error("$HOME environment variable is not set");
}
const launchAgentsDir = join(home, "Library", "LaunchAgents");

function stripSuffix(input: string, suffix: string): string | null {
  return input.endsWith(suffix) ? input.slice(0, -suffix.length) : null;
}

interface Service {
  name: string;
  path: string;
}

function readServices(): AsyncIterable<Service> {
  return pipe(
    Deno.readDir(launchAgentsDir),
    filter((entry) => entry.isFile),
    map((entry): Service | null => {
      const name = stripSuffix(entry.name, ".plist");
      if (!name) {
        return null;
      }

      return {
        name,
        path: join(launchAgentsDir, entry.name),
      };
    }),
    compact,
  );
}

function service(): ValueParser<"async", string> {
  return {
    $mode: "async",
    metavar: "SERVICE",
    parse(input) {
      return Promise.resolve({ success: true, value: input });
    },
    format(value) {
      return value;
    },
    suggest(prefix) {
      return pipe(
        readServices(),
        filter((service) => service.name.startsWith(prefix)),
        map((service) => ({ kind: "literal", text: service.name })),
      );
    },
  };
}

const serviceArg = argument(service(), {
  description: message`The LaunchAgent service name`,
});

async function findService(name: string): Promise<Service> {
  const matches = await Array.fromAsync(pipe(
    readServices(),
    filter((service) => service.name.includes(name)),
  ));
  if (matches.length === 0) {
    console.error(`No services matching \"${name}\" found`);
    Deno.exit(1);
  } else if (matches.length > 1) {
    console.error(
      `Multiple services matching \"${name}\": ${
        matches.map((match) => match.name).join(", ")
      }`,
    );
    Deno.exit(1);
  }

  return matches[0];
}

function domainTarget(): string {
  return `gui/${Deno.uid()}`;
}

const parser = or(
  command(
    "print",
    object({
      type: constant("print"),
      service: serviceArg,
    }),
    { description: message`Print the service plist file` },
  ),
  command(
    "logs",
    object({
      type: constant("logs"),
      service: serviceArg,
      lines: withDefault(
        option("-n", "--lines", integer(), {
          description: message`Number of lines to show`,
        }),
        100,
      ),
      follow: option("-f", "--follow", {
        description: message`Follow the log output`,
      }),
    }),
    { description: message`Show service logs` },
  ),
  command(
    "start",
    object({
      type: constant("start"),
      service: serviceArg,
    }),
    { description: message`Start the service` },
  ),
  command(
    "stop",
    object({
      type: constant("stop"),
      service: serviceArg,
    }),
    { description: message`Stop the service` },
  ),
  command(
    "restart",
    object({
      type: constant("restart"),
      service: serviceArg,
    }),
    { description: message`Restart the service` },
  ),
);

const config = await run(parser, {
  programName: "lcman",
  description: message`launchctl manager`,
  help: "both",
  completion: "command",
});

const { name, path: plist } = await findService(config.service);
const domain = domainTarget();

switch (config.type) {
  case "print":
    await $`bat ${plist}`;
    break;
  case "logs": {
    const logPath = await $`plutil -extract StandardOutPath raw ${plist}`
      .text();
    const tailArgs = ["-n", config.lines, ...config.follow ? ["-f"] : []];
    await $`tail ${tailArgs} ${logPath}`;
    break;
  }
  case "start":
    await $`launchctl bootstrap ${domain} ${plist}`;
    break;
  case "stop":
    await $`launchctl bootout ${domain}/${name}`;
    break;
  case "restart":
    await $`launchctl bootout ${domain}/${name}`.noThrow();
    await $`launchctl bootstrap ${domain} ${plist}`;
    break;
}
