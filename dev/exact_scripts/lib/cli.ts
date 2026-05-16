export function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    console.error(message);
    Deno.exit(1);
  }
}

export function home(): string {
  const dir = Deno.env.get("HOME");
  assert(dir, "$HOME environment variable is not set");
  return dir;
}
