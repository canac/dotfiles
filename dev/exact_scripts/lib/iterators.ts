export async function* chain<T>(
  ...iterables: AsyncIterable<T>[]
): AsyncGenerator<T> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

export async function* takeWhile<T>(
  iterable: AsyncIterable<T>,
  predicate: (value: T) => boolean,
): AsyncGenerator<T> {
  for await (const value of iterable) {
    if (!predicate(value)) {
      break;
    }
    yield value;
  }
}
