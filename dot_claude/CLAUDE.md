# Code Comments

- A comment states the non-obvious WHY. The code already says WHAT.
- An explanatory comment is 1 line. 2 only when 1 cannot carry it. Never 3 — delete it, or move it to the commit message.
- Doc comments or directives state a contract, not an explanation, and have no line cap.
- Must not restate the code, list alternatives considered, or narrate history.
- In tests, only permit comments for math or non-intuitive setup.

# Git

- When branching a feature branch off of the primary branch, pass `--no-track` to not track primary.
