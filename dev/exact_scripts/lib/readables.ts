import { TextLineStream } from "jsr:@std/streams@1.0.10";

export async function* linesFromReadable(
  readable: ReadableStream<Uint8Array<ArrayBuffer>>,
): AsyncGenerator<string> {
  yield* readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
}

export async function* linesFromFile(filename: string): AsyncGenerator<string> {
  try {
    using file = await Deno.open(filename);
    yield* linesFromReadable(file.readable);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return;
    }

    throw error;
  }
}
