import { TextLineStream } from "jsr:@std/streams@1.0.10";

/**
 * Return an async generator of the lines of text in a readable stream
 */
export async function* linesFromReadable(
  readable: ReadableStream<Uint8Array<ArrayBuffer>>,
): AsyncGenerator<string> {
  yield* readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
}

/**
 * Return an async generator of the lines of text in a file
 */
export async function* linesFromFile(filename: string): AsyncGenerator<string> {
  using file = await Deno.open(filename);
  yield* linesFromReadable(file.readable);
}

/**
 * Return an async generator of the lines of text in a file, yielding nothing for non-existent files instead of throwing
 */
export async function* safeLinesFromFile(
  filename: string,
): AsyncGenerator<string> {
  try {
    yield* linesFromFile(filename);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return;
    }

    throw error;
  }
}
