// Menu: Dev server
// Description: Start a project's dev server

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const { filterLimit } = await npm('async');

const devDir = '/Users/caleb/dev';
const projects = (await readdir(devDir, { withFileTypes: true }))
  .filter((path) => path.isDirectory())
  .map((path) => path.name);
const devProjects = await filterLimit(projects, 10, async (project) => {
  try {
    const packageJson = await readFile(join(devDir, project, 'package.json'));
    return JSON.parse(packageJson).scripts.dev;
  } catch {
    return false;
  }
});
const project = await arg('Choose a project:', devProjects);
const projectDir = join(devDir, project);
edit(projectDir);
applescript(`
tell application "Terminal"
  activate
  my newWindow()
  do script "cd ${projectDir}" in window 1
  do script "npm run dev" in window 1
  my newTab()
  end tell

on newWindow()
    tell application "System Events" to keystroke "n" using {command down}
    delay 0.2
end newWindow

on newTab()
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.2
end newTab
`);
