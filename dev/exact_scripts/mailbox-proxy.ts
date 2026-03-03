import { createMailboxMessages } from "./lib/mailbox.ts";

const authToken = Deno.args[0];
if (!authToken) {
  console.error("Usage: mailbox-proxy [auth token]");
  Deno.exit(1);
}

const port = parseInt(Deno.env.get("PORT") ?? "");
Deno.serve({ port: port || undefined }, async (req) => {
  if (req.headers.get("authorization") !== authToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const content = await req.text();
  await createMailboxMessages([{ mailbox: "mailbox-proxy", content }]);
  return new Response(null);
});
