// Menu: Journal tags
// Description: Choose journal tags

import '@johnlindquist/kit';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const { sortBy } = await npm('lodash-es');

const postsDir = '/Users/caleb/dev/journal/jekyll/_posts';
const posts = await readdir(postsDir);
const usedTags = new Set();
for (const filename of posts) {
  const post = await readFile(join(postsDir, filename), 'utf8');
  const matches = /---\n[\s\S]*tags: ?(.*)[\s\S]*\n---\n/g.exec(post);
  if (!matches) {
    console.log(`Could not extract tags from ${filename}`);
  }

  const tags = matches[1];
  if (!tags) {
    // The post had no tags
    continue;
  }

  tags.split(' ').forEach((tag) => {
    usedTags.add(tag);
  });
}

// Sort alphabetically, ignoring case
const sortedTags = sortBy(Array.from(usedTags.keys()).sort(), (tag) =>
  tag.toLowerCase(),
);

// Loop to allow picking multiple tags
while (true) {
  const chosenTag = await arg('Journal tag:', sortedTags);
  await setSelectedText(`${chosenTag} `);
}
