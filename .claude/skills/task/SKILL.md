---
name: task
description: Build one task from TASKS.md from start to finish: plan by size, build, test, review, then ask me to commit. Use when I say /task or ask to work on a task from TASKS.md.
argument-hint: "[task-id]"
---

Build one task from TASKS.md from start to finish. I'm involved in only two places:
approving the plan (M and L tasks) and approving the commit. Do everything else yourself,
without asking me.

## 1. Start

- Read TASKS.md. Use task $ARGUMENTS, or the first task under "Ready" if none is given.
  If "Ready" is empty, tell me and stop.
- Make sure the working tree is clean, then always run git switch main and git pull to get
  the latest main before writing any code. If there are uncommitted changes, stop and ask
  me. If the pull fails or has conflicts, stop and tell me.
- Work directly on main by default. If I ask for a branch or pull request (for example
  "/task T-005 with a PR"), create the branch feat/<task-id>-<short-name> instead, for
  example feat/T-005-loan-card.
- Move the task to "In progress" in TASKS.md.

## 2. Plan, by size

- S: don't show a plan. Go straight to step 3.
- M: switch to plan mode with the EnterPlanMode tool (if you can't, ask me to press
  Shift+Tab). Look at whatever you need, then present the plan in the format below and
  wait for my approval.
- L: switch to plan mode first, the same way. Then use the superpowers:brainstorming skill
  to explore the idea with me: one question at a time, and 2-3 possible approaches with
  their trade-offs. Don't write any files, and don't continue into Superpowers' own
  planning, worktree or execution steps. When we agree, present the final plan in the
  format below and wait for my approval. If the result is too big for one task, add the
  extra parts as new tasks under "Ready" and plan only the first part.

Plan format: plain language a non-programmer understands, with no code, file names or
function names.
Plan: <task id and title>

1. What you'll get: 1-2 sentences on what the user will see or be able to do.
2. How it will work: numbered steps from the user's point of view.
3. Decisions: each choice with your recommendation and why. Mark the ones I must
   answer with ❓.
4. Not included: what's left out this time.
5. How we'll know it works: the tests and things I can try myself, with example numbers
   where possible.
6. Good to know: risks, surprises, and anything that changes existing behaviour or the
   money math.
   Explain any term the first time you use it. Make the plan as long as needed to be clear,
   usually under a page. Keep the technical details to yourself and use them while building.
   Once I approve, continue through steps 3 to 5 without stopping.

## 3. Build

- Follow the approved plan. For S tasks, follow the task's "Done when" list.
- For calculation logic, write the tests first, using the example numbers from the task.
- Don't ask me anything while building unless you're blocked or the task is unclear.

## 4. Check and fix (automatic)

- Run npm run check. If anything fails, fix it and run it again, for at most 3 rounds. If
  it still fails, stop and show me the error and what you tried.
- Never make a test pass by deleting it, skipping it or changing its expected value,
  unless the task itself changes that behaviour.
- If the task changed logic (anything in src/lib/engine, other calculations, or how data
  is handled), run /code-review medium --fix, then run npm run check again. Ignore
  style-only suggestions.
- If you notice problems outside this task, add them as one-liners under "Ideas" in
  TASKS.md instead of fixing them now.

## 5. Finish

- Move the task to "Done" in TASKS.md, in this format:
  - T-NNN · <title> (YYYY-MM-DD): <one line on what changed>
- Show me a short summary: what changed (in plain words), the check results, what the
  review found and fixed, and anything I should know.
- Commit with a Conventional Commits message, for example
  "feat: add loan comparison card (T-005)". I'll approve the commit.
- Then push. Never wait for CI to finish before ending your turn.
  - Working on main (two people share main): right after my commit is approved, run
    git pull --rebase to get the other person's changes. If new changes came in, run
    npm run check again before pushing (fix problems with the rules in step 4). If there
    is a conflict, resolve it keeping both people's changes, and ask me only if it is
    unclear which version is right. Then push to main right away. If the push is
    rejected, run git pull --rebase and push again (check again if new changes came in).
    Then finish. I'll check CI myself.
  - Working on a branch: push, open a pull request with gh pr create (title = the commit
    message, body = the summary), then finish. Optionally start gh pr checks --watch as a
    background command so you are notified later; when it ends, tell me either "CI
    passed, ready to merge" or what failed. If the repo has no CI checks, skip this.
- Never merge a pull request on your own. Only after I say so, run
  gh pr merge --squash --delete-branch, then git switch main and git pull.
- If CI fails and I ask you to fix it, use the rules in step 4, commit the fix (I'll
  approve), and push.
- To undo a bad change that is already pushed, always use git revert. Never use git reset
  on pushed commits, and never force-push.
