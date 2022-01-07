// Shortcut: command shift j
// Menu: New journal entry
// Description: Create a new journal entry

import '@johnlindquist/kit';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const { addDays, format } = await npm('date-fns');
const { findLast, mapValues, range } = await npm('lodash-es');

function formatDateHuman(date) {
  return format(date, 'EEEE, MMMM d');
}

const postFilenamePattern =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<index>\d+)\.md$/;
const journalDir = '/Users/caleb/dev/journal';
const postsDir = join(journalDir, 'jekyll', '_posts');
const lastPost = findLast(await readdir(postsDir), (file) =>
  postFilenamePattern.test(file),
);
const { year, month, day, index } = mapValues(
  postFilenamePattern.exec(lastPost).groups,
  (str) => parseInt(str, 10),
);
const lastDay = new Date(year, month - 1, day);
const nextDay = addDays(lastDay, 1);
const newPost = await arg('Post date:', [
  {
    value: {
      date: nextDay,
      index: 1,
    },
    name: 'Next day',
    description: `Journal about the next day (${formatDateHuman(nextDay)})`,
  },
  {
    value: {
      date: lastDay,
      index: index + 1,
    },
    name: 'Same day',
    description: `Journal about the last day again (${formatDateHuman(
      lastDay,
    )})`,
  },
  ...range(7).map((skip) => {
    const date = addDays(nextDay, skip + 1);
    return {
      value: {
        date,
        index: 1,
      },
      name: `Skip ${skip + 1} day${skip === 0 ? '' : 's'}`,
      description: `Journal about ${formatDateHuman(date)}`,
    };
  }),
]);

const numberFormattedDate = format(new Date(newPost.date), 'yyyy-MM-dd');
const wordFormattedDate = format(new Date(newPost.date), 'EEEE, MMMM d, y');
const newFilename = join(
  postsDir,
  `${numberFormattedDate}-${newPost.index}.md`,
);
await writeFile(
  newFilename,
  `---
title: '${wordFormattedDate} #${newPost.index}'
date: ${numberFormattedDate}
tags: ` +
    `
---

Jesus, `,
);
edit(`${journalDir} ${newFilename}`, null, 4, 7);
