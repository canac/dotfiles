import { takeWhile } from "./lib/iterators.ts";
import { linesFromFile, linesFromReadable } from "./lib/readables.ts";

async function main() {
  if (Deno.args.length < 1 || Deno.args.length > 3) {
    console.error("Usage: ensure-lines [file] [manager]");
    Deno.exit(1);
  }

  const file = Deno.args[0];
  const manager = Deno.args[1] ?? "chezmoi";

  const sentinelStart = `# begin managed by ${manager}`;
  const sentinelEnd = `# end managed by ${manager}`;

  const iterable = linesFromFile(file);
  const beforeLines = await Array.fromAsync(
    takeWhile(iterable, (line) => line !== sentinelStart),
  );
  takeWhile(iterable, (line) => line !== sentinelEnd);
  const afterLines = await Array.fromAsync(iterable);
  const managedLines = await Array.fromAsync(
    linesFromReadable(Deno.stdin.readable),
  );

  const lines = managedLines.some((line) => line.length > 0)
    ? [
      ...beforeLines,
      sentinelStart,
      ...managedLines,
      sentinelEnd,
      ...afterLines,
    ]
    : [...beforeLines, ...afterLines];
  await Deno.writeTextFile(file, lines.join("\n") + "\n");
}

main();
