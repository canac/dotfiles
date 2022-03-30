type ChangeType = "all" | "minor" | "major";

type WatchDef = {
  packageName: string;
  lastVersion: string;
  changeType: ChangeType;
};

const watching: Array<WatchDef> = [
  { packageName: "@mantine/core", lastVersion: "3.6.9", changeType: "all" },
  { packageName: "zod", lastVersion: "3.11.6", changeType: "all" },
];

const converters: {
  [key in ChangeType]: (version: string) => string;
} = {
  all: (v) => v,
  minor: (v) => v.split(".").slice(0, 2).join("."),
  major: (v) => v.split(".")[0],
};

async function run() {
  const updates: string[] = [];
  for (const { packageName, lastVersion, changeType } of watching) {
    const res = await fetch(`https://registry.npmjs.org/${packageName}`);
    const body = await res.json();
    const currentVersion = body["dist-tags"].latest;
    const converter = converters[changeType];
    if (converter(lastVersion) !== converter(currentVersion)) {
      updates.push(`${packageName} v${currentVersion}`);
    }
  }

  const mailboxUrl = Deno.env.get("CHRON_MAILBOX_URL");
  if (mailboxUrl) {
    // Clear the mailbox
    await fetch(mailboxUrl, {
      method: "DELETE",
    });

    if (updates.length > 0) {
      // Post the new messages
      updates.forEach((update) => {
        fetch(mailboxUrl, {
          method: "POST",
          body: update,
        });
      });
    }
  }

  if (updates.length > 0) {
    console.log(updates.join(", "));
  }
}

run();
