// Menu: New journal entry
// Description: Create a new journal entry

import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const { addDays, format } = await npm('date-fns');
const { findLast, mapValues } = await npm('lodash-es');

const pattern =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<index>\d+)\.md$/;

const postsDir = '/Users/caleb/dev/journal/jekyll/_posts';
const lastPost = findLast(await readdir(postsDir), (file) =>
  pattern.test(file),
);
const { year, month, day, index } = mapValues(
  pattern.exec(lastPost).groups,
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
    description: `Journal about the next day (${format(
      nextDay,
      'EEEE, MMMM d',
    )})`,
  },
  {
    value: {
      date: lastDay,
      index: index + 1,
    },
    name: 'Same day',
    description: `Journal about the last day again (${format(
      lastDay,
      'EEEE, MMMM d',
    )})`,
  },
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
edit(`${newFilename}`, null, 4, 7);
