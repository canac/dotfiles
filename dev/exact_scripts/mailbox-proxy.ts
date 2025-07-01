import { createMailboxMessages } from "./mailbox.ts";

const connect = () => {
  const ws = new WebSocket("wss://mailbox-proxy.deno.dev/");
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
