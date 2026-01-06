type Message = {
  mailbox: string;
  content: string;
};

// Create the mailbox messages via the `mailbox` command
export async function createMailboxMessages(
  messages: Message[],
): Promise<void> {
  const stdin = messages.map((message) => JSON.stringify(message)).join("\n");
  const process = new Deno.Command("mailbox", {
    args: ["import", "--format=json"],
    stdin: "piped",
  }).spawn();
  const writer = process.stdin.getWriter();
  await writer.write(new TextEncoder().encode(stdin));
  await writer.close();
  const status = await process.status;
  if (!status.success) {
    throw new Error("Failed to create mailbox messages");
  }
}
