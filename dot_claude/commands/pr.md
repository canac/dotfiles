---
description: Open a GitHub PR following the repo's template
---

Open a pull request for the current branch with `gh`. Extra instructions from
the user: $ARGUMENTS

Steps:

1. **Ticket.** If the user gave a Jira ticket (e.g. `MPDX-1234`) in the
   instructions above, use it verbatim. Otherwise ask them for the ticket,
   telling them to reply `none` if there isn't one. The PR title is
   `[TICKET] <short summary>` (e.g. `[MPDX-1234] Add login rate limit` or
   `[no-Jira] Bump deps`).

2. **Template.** Find the repo's PR template: a file named
   `.github/pull_request_template.md` (case-insensitive) in the repo root. Fill
   in **every** section it defines, using the branch's commits and diff. Do not
   add, drop, or reorder sections.

3. **Create.** Push the branch if it has no upstream. Then run `gh pr create`
   with `--assignee @me` (always assign yourself), plus `--label`,
   `--reviewer`, `--base`, or `--draft` as needed.

Print the PR URL when done.
