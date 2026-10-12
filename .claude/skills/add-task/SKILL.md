---
name: add-task
description: Add new tasks to TASKS.md from a plain-words description, or turn the "Ideas" list into tasks. Use when I describe something I want built later.
argument-hint: "[what you want]"
---

Turn my request into well-written tasks in TASKS.md. Don't build anything.

1. Read TASKS.md. Continue numbering from the highest task number (T-001, T-002, ...).
   Make sure the task doesn't already exist.
2. If I gave a description ($ARGUMENTS), use it. If not, turn every line under "Ideas"
   into a task and remove those lines from "Ideas".
3. Ask questions only if something unclear would change what gets built: at most 3 short
   questions, all in one message.
4. Write each task under "Ready" in exactly this format:
   ### T-NNN · <short title> · <S|M|L>
   What: 1-3 plain sentences on what the user will see or be able to do, and why.
   Done when:
   - 2-5 checks that a user could see or a test could prove. Include example numbers
     for anything that is calculated.
5. Choose the size yourself:
   - S: a tiny change in 1-2 files (text, a button, a style, a small fix). No new calculation.
   - M: one clear feature across a few files (a form, a card, a new calculation with tests).
   - L: unclear, spans several screens, or changes how money is calculated.
     If a task would take more than about a day, split it into several S or M tasks.
6. Show me the new tasks. I may change a size letter myself.
