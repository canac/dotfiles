// Menu: Online backup
// Description: Begin new online backup snapshot using Restic
// Schedule: 0 */3 * * *
// Runs every three hours

import '@johnlindquist/kit';

await exec('fish -c backup');
