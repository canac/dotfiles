import { createMailboxMessages } from "./mailbox.ts";

const databaseId = Deno.env.get("MAILBOX_PROXY_DATABASE_ID");
if (!databaseId) {
  throw new Error("$MAILBOX_PROXY_DATABASE_ID environment variable is not set");
}
using kv = await Deno.openKv(
  `https://api.deno.com/databases/${databaseId}/connect`,
);

try {
  for await (const _ of kv.watch([["lastId"]])) {
    const messageEntries = await Array.fromAsync(kv.list({
      prefix: ["messages"],
    })).catch((err) => {
      console.log(new Date().toISOString(), "List error", err);
      throw err;
    });
    const messages = messageEntries.flatMap(
      ({ value }) =>
        typeof value === "string"
          ? [{ mailbox: "mailbox-proxy", content: value }]
          : [],
    );
    await createMailboxMessages(messages);
    await Promise.all(messageEntries.map(({ key }) => kv.delete(key))).catch(
      (err) => {
        console.log(new Date().toISOString(), "Delete error", err);
        throw err;
      },
    );
  }
} catch (err) {
  console.log(new Date().toISOString(), "Watch error", err);
}
