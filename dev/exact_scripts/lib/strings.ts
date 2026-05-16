export function stripPrefix(input: string, prefix: string): string | null {
  return input.startsWith(prefix) ? input.slice(prefix.length) : null;
}
