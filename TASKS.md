# Tasks

How to use:

- Add a task: /add-task <what you want>, or write a one-line idea under "Ideas" and run /add-task
- Build the next ready task: /task (or /task T-005 for a specific one)
- Build several in a row: /goal every task under "Ready" in TASKS.md is done using /task, one at a time (stop after 3 tasks)

Sizes: S = small, Claude just builds it · M = Claude shows a plan first (plan mode) · L = Claude brainstorms with me first (plan mode + brainstorming), then shows a plan

Task format:

### T-NNN · <short title> · <S|M|L>

What: 1-3 plain sentences
Done when:

- checks a user could see or a test could prove

## Ready

### T-008 · Planner page with the simple calculation · M

What: The planner page (now "Coming soon") gets a form with the price today in tenge, the target month and year, and the savings already set aside. Next to it the plan updates as you type: the price at the target date and the amount to save each month, using the calculation we already have with fixed middle-case numbers (11% a year return, 8% a year price growth). Every on-screen text lives in one text file so it can be translated later.
Done when:

- Price ₸8,851,400, a target 18 months ahead and savings ₸1,000,000 show "18 months", a price at the date of about ₸9.93m (9,934,536) and about ₸452,000 a month (451,791).
- ₸1,000,000 in 1 month with no savings shows ₸1,006,434 a month (GT-09).
- Blank savings count as 0. A price outside ₸10,000–₸5bn, a non-number, or a target month that is this month, in the past, or more than 360 months ahead shows an error under the field and no plan.
- Amounts show rounded to the nearest ₸1,000 (millions as ₸9.93m) and update as you type.
- No user-facing text is hard-coded in the planner page, and npm run check passes.

### T-009 · Home page headline and text · S

What: The home page gets the headline "Plan your purchase without a loan", a one-sentence explanation and the Start planning button. Its texts come from the same single text file as the planner.
Done when:

- The home page shows the headline, one sentence (for example "Find out how much to save each month for a big purchase, instead of taking a loan.") and a Start planning button that opens the planner.
- No text is hard-coded in the home page.

### T-010 · All assumptions in one file · M

What: Every number the plan relies on moves into one dated, versioned data file, using the proposed values below. The planner reads its 11% return and 8% price growth from it, so nothing on screen changes. A test checks that the file is complete and sensible.
Done when:

- The file has a version and a date, and lists the asset types with yearly returns bad / middle / good and the fall in the bad case: Islamic deposit in tenge 8 / 11 / 13.5% (fall 0%), Islamic deposit in dollars 1 / 2 / 3% (0%), sukuk fund 3.5 / 4.5 / 6% (10%), Shariah equity fund 5 / 7 / 11% (25%).
- It also holds: price growth 8% (tenge goals) and 3% (dollar goals), dollar rate ₸442.57, tenge weakening 5% a year, tenge shock 15%, bank loan rate 25%, safety rule limits of 12 and 36 months, and the strategy mixes (Cautious 100% Islamic deposit; Balanced 60% deposit, 20% sukuk, 20% equity; Growth 20% deposit, 20% sukuk, 60% equity; deposit in dollars for dollar goals).
- A test fails if a value is missing or negative, if a mix does not add up to 100%, or if bad is above middle or middle above good.
- The planner shows the same numbers as in T-008, and no other code contains these numbers.

### T-011 · Goal type buttons · S

What: Seven buttons at the top of the form: car, Hajj or Umrah, wedding, home deposit, education, emergency fund and other. The chosen goal changes the wording of the plan.
Done when:

- All seven buttons show, with car selected at the start.
- Picking one changes the wording, for example "By April 2028 the car will cost about ₸9.93m" becomes "…the wedding will cost…".
- The wording for each goal comes from the text file.

### T-012 · Normal and safe monthly amounts · M

What: The plan shows two amounts at the top for saving in an Islamic deposit in tenge (the Cautious strategy): the normal (middle) case and the safe (bad) case. The good case is calculated too, using the returns from the assumptions file.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000 shows "Save ₸452,000 a month, normal case" (451,791) and "Save ₸463,000 a month, safe if things go badly" (463,335) (GT-04).
- The safe amount is shown before the good case, and tests confirm the monthly amount is highest in the bad case and lowest in the good case.
- The wording calls the cases bad, middle and good (shown as "safe" and "normal"), never "expected".

### T-013 · Strategy engine with the safety rule · M

What: A new engine adds money month by month for the three example strategies, switching to safer mixes as the date gets close (Cautious only in the last 12 months, at most Balanced in the last 36). In the bad case, risky holdings fall and the tenge shock applies in the last month before the money moves to Cautious. Tenge goals only. The planner switches to it for the Cautious numbers and must show the same numbers as before. If the spec's numbers below cannot be reproduced, stop and report instead of changing them.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, Balanced, today October 2026: price at the date ₸9,934,536; monthly middle ₸451,784, bad ₸490,367, good ₸442,402; Balanced in months 1–6 and Cautious in months 7–18 (GT-03).
- Same inputs with Cautious: middle ₸451,791, bad ₸463,335 (GT-04).
- Home deposit ₸15,000,000, 120 months, savings ₸2,000,000: price at the date ₸32,383,875; Growth middle ₸123,904, bad ₸167,449, good ₸98,404 with 84 months Growth, 24 Balanced, 12 Cautious; Cautious middle ₸126,810, bad ₸155,815 (GT-06).
- With every return and price growth at 0 the monthly amount is (price − savings) ÷ months (GT-01: ₸491,744.44 for ₸8,851,400 over 18 months with no savings); with a 14.5% return it is ₸446,006.97 (GT-02).
- Property tests pass: bad ≤ middle ≤ good value at the date; more savings never raises the monthly amount; a bigger budget never lowers the value at the date; savings that cover the price give 0 a month; never Growth with 36 or fewer months left and always Cautious with 12 or fewer; never NaN, infinity or a negative amount.

### T-014 · Three strategy cards · M

What: Below the amounts, three cards side by side (Cautious, Balanced, Growth) show the normal and safe monthly amounts and a one-line description of the mix. Cautious is open first and none is labelled "recommended". Clicking a card selects it, and the selected strategy drives the amounts at the top. A card shows a note when the safety rule changes its mix.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000: Cautious shows ₸452,000 normal and ₸463,000 safe; Balanced and Growth show ₸452,000 normal and ₸490,000 safe, and Growth says it acts like Balanced when under 3 years remain.
- Cautious is selected at the start, and clicking another card changes the top amounts.
- No card or text says "recommended" or "best".

### T-015 · Dollar goals · M

What: A ₸/$ switch next to the price. A dollar price is converted to tenge at the assumed dollar rate, which weakens the tenge 5% a year. Dollar goals are saved in dollar assets with 3% price growth, and the bad case includes the 15% tenge shock where it applies. Hajj or Umrah starts in dollars and other goals start in tenge. Savings and budget are still entered in tenge.
Done when:

- Car $20,000, 18 months, no savings, Cautious: price at the date ₸9,955,240; monthly middle ₸526,608, bad ₸530,358 (GT-05).
- A dollar price outside $20–$10m shows an error under the field.
- Switching currency keeps the other fields and updates the plan; picking Hajj or Umrah selects $.

### T-016 · Monthly budget check · M

What: An optional monthly budget field. With a budget, the plan says "on track" or "short by X" for the selected strategy in the middle case. When savings already cover the goal it says on track and shows the surplus.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, budget ₸400,000, Balanced shows "short by ₸1.0m" (gap −₸1,004,657) (GT-03).
- Same car with savings ₸10,000,000 and Cautious shows ₸0 a month and "on track" with a surplus of about ₸1.76m (₸1,760,039) (GT-08).
- A blank or 0 budget hides the check; a negative or non-number shows an error under the field.

### T-017 · Three fixes when the budget is short · M

What: When the budget falls short, three buttons offer a fix: save more each month, buy later, or aim for a lower price. Clicking one updates the form and the plan shows "on track".
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, budget ₸400,000, Balanced shows "Save ₸452,000", "Buy in July 2028" (21 months needed) and "Aim for ₸7.96m" (affordable today ₸7,956,278) (GT-03).
- Clicking any of the three shows "on track".
- If the goal cannot be reached within 360 months on this budget, only the "save more" fix is offered, with a message saying so.

### T-018 · Loan comparison · M

What: A card compares with buying today using a bank loan over the same number of months, with savings as the down payment. It shows the monthly payment and total interest (riba), worded respectfully ("a loan would cost ₸1.47m more"). The loan rate starts at 25% from the assumptions file, a placeholder until real bank offers are collected, and can be edited.
Done when:

- Price ₸8,851,400, savings ₸1,000,000, 18 months, 25%: payment ₸518,055 and total interest ₸1,473,589, shown as about ₸518,000 a month and ₸1.47m (GT-07).
- Changing the rate updates the card, and a 0% rate gives zero interest.
- Savings that cover the price show "no loan needed" instead of a negative loan.

### T-019 · Disclaimer, version line and wording check · S

What: Every result shows the disclaimer and the assumptions version and date, with a warning when the numbers are old. An automatic test makes sure the texts never promise returns.
Done when:

- Every result shows the disclaimer ("information, not investment advice or a fatwa") and "Numbers updated Oct 2026" taken from the assumptions file.
- If the assumptions date is more than 45 days old, a warning shows.
- A test fails if the text file contains "you will earn", "guaranteed", "expected" or "recommended".

### T-020 · Copy link to this plan · M

What: A "Copy link to this plan" button creates a link holding all the inputs. Opening it on another computer rebuilds the same form and plan. Nothing is stored on a server.
Done when:

- A copied link opened in a new window shows the same form and identical numbers (for example GT-03 and GT-05 inputs).
- The link carries a format version number so old links can keep working later.
- Bad or edited values in a link show the same errors as typed values and never crash the page.
- A test builds a link and reads it back for several example goals and gets the same inputs.

### T-021 · Explaining halal terms and savings types · L

What: Together we decide the stance and tone for short explanations of Islamic deposit (wakala), sukuk fund, Shariah equity fund and riba in loans: what each is, why it is considered halal, its main risk, and where scholars differ. Then clicking "wakala", "sukuk" or "riba" anywhere in the plan opens the explanation. Texts are drafts for later adviser review.
Done when:

- Each of the four has a description, a reason it is considered halal and its main risk, in the text file.
- Where scholars differ, both views are given in the way we agreed.
- Clicking "riba" on the loan card and "wakala" or "sukuk" in a strategy description opens the matching explanation.
- The wording follows the copy rules: no promises, respectful about loans, each term explained when first used.

### T-022 · Strategy details page · M

What: A "Details" link on each strategy card opens a page with the mix, a month-by-month timeline of the safety rule, and the explanation for each savings type in the mix.
Done when:

- 18-month Balanced shows Balanced in months 1–6 and Cautious in months 7–18 (GT-03).
- Home deposit ₸15,000,000 over 120 months on Growth shows 84 months Growth, 24 Balanced and 12 Cautious (GT-06).
- The page keeps the plan inputs, and a back link returns to the planner without losing what was typed.

### T-023 · "How we calculate" page · M

What: A page linked from the bottom of the planner explains the method in plain words and lists every assumption with its value, date and source.
Done when:

- The planner links to the page, and the page shows the assumptions version and date.
- It explains the monthly amount, the three cases, the safety rule and the loan comparison in plain words, and repeats the disclaimer.
- Every assumption value shown is read from the assumptions file, and a test fails if one is missing.

### T-024 · Accessibility and speed pass · M

What: Make the site usable with a keyboard and a screen reader and fast on an ordinary laptop.
Done when:

- Every field has a label, every button works with the keyboard, and errors are read out by screen readers.
- An automated accessibility scan finds no WCAG 2.1 AA problems on the home, planner, details and how-we-calculate pages.
- Results appear within 200 ms of a change, with the measurement reported.

### T-025 · Product name and look and feel · L

What: Together we decide the product name and visual style, then apply them across the site at screen widths of 1024 px and wider, with the form and plan side by side.
Done when:

- The agreed name shows in the header of every page.
- The agreed colors and fonts are used on the home, planner, details and how-we-calculate pages.
- At 1024 px and wider the planner shows the form and plan side by side.

## In progress

## Ideas

- Remember the last inputs on this device, with a "clear" button.
- Strict content security policy and browser error reporting without personal data.
- Phone layout where the form and plan stack.

## Done

- T-001 · Scaffold the repo (2026-10-09): initial commit with the empty project skeleton.
- T-002 · Set up the Next.js app (2026-10-09): created the Next.js/TypeScript/Tailwind project.
- T-003 · Add the home page (2026-10-09): built the `/` page with a "Start planning" link.
- T-004 · Add the monthly savings calculation (2026-10-09): built the savings engine in `src/lib/engine`.
- T-005 · Document the project for Claude Code (2026-10-09): added CLAUDE.md.
- T-006 · Document the engine and tests in CLAUDE.md (2026-10-09): expanded CLAUDE.md with engine and test details.
- T-007 · Add lightweight quality checks (2026-10-12): set up Prettier, ESLint config, npm scripts, and CI.
