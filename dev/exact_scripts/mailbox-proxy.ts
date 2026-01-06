import { createMailboxMessages } from "./lib/mailbox.ts";

const authToken = Deno.args[0];
if (!authToken) {
  console.error("Usage: mailbox-proxy [auth token]");
  Deno.exit(1);
}

const connect = () => {
  const ws = new WebSocket("wss://mailbox-proxy.canac.deno.net/", {
    headers: {
      Authorization: authToken,
    },
  });
  ws.addEventListener("message", async (event) => {
    if (typeof event.data === "string") {
      await createMailboxMessages([{
        mailbox: "mailbox-proxy",
        content: event.data,
      }]);
    }
  });

  ws.addEventListener("close", () => {
    console.log("Reconnecting to websocket...");
    connect();
  });

  ws.addEventListener("error", () => {
    ws.close();
  });
};

connect();
