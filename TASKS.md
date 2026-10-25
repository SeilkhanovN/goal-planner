# Tasks

How to use:

- Add a task: /add-task <what you want>, or write a one-line idea under "Ideas" and run /add-task
- Build the next ready task: /task (or /task T-005 for a specific one)
- Build several in a row: /goal every task under "Ready" in TASKS.md is done using /task, one at a time (stop after 3 tasks)
- "Waiting for the financist" holds tasks that need justified numbers; /task does not pick them up until they are moved to "Ready"

Sizes: S = small, Claude just builds it · M = Claude shows a plan first (plan mode) · L = Claude brainstorms with me first (plan mode + brainstorming), then shows a plan

Task format:

### T-NNN · <short title> · <S|M|L>

What: 1-3 plain sentences
Done when:

- checks a user could see or a test could prove

## Ready

### T-010 · What-if growth rates · M

What: Under the plan, a table "If your money grows by…" shows the monthly amount to save for yearly growth of −10%, 0% (cash or a plain account), 5%, 10%, 15% and 20%, plus a field for your own rate. Clicking a row makes the plan use that rate; 0% is selected at the start. The page says plainly that the percentages are examples, not forecasts, and that nobody knows what an investment will earn, and no row is named after a product (no stocks, sukuk or deposits).
Done when:

- ₸10,000,000 in 20 months with nothing saved shows −10% ₸543,000, 0% ₸500,000, 5% ₸481,000, 10% ₸463,000, 15% ₸447,000 and 20% ₸431,000 a month.
- Typing your own yearly rate between −50% and 100% adds a row labelled "your own rate"; a non-number or a rate outside that range shows an error under the field.
- A higher growth rate never needs a higher monthly amount than a lower one, and 0% equals the plain-saving amount (tests).
- The "not a forecast" sentence and the list of rates come from the text file, with no product names anywhere.

### T-011 · Goal type buttons · S

What: Seven buttons at the top of the form: car, Hajj or Umrah, wedding, home deposit, education, emergency fund and other. The chosen goal changes the wording of the plan.
Done when:

- All seven buttons show, with car selected at the start.
- Picking one changes the wording of the plan, for example "To reach ₸8.85m for the car by April 2028" becomes "…for the wedding…".
- The wording for each goal comes from the text file.

### T-016 · Monthly budget check · M

What: An optional monthly budget field. With a budget, the plan says "on track" or "short by X" for the selected growth rate. When savings already cover the goal it says on track and shows the surplus.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, budget ₸400,000, growth 0% shows "short by ₸0.65m" (₸651,400), because the plan needs ₸436,189 a month.
- Same car with savings ₸10,000,000 shows ₸0 a month and "on track" with a surplus of about ₸1.15m (₸1,148,600).
- A blank or 0 budget hides the check; a negative or non-number shows an error under the field.

### T-017 · Three fixes when the budget is short · M

What: When the budget falls short, three buttons offer a fix: save more each month, buy later, or aim for a lower price. Clicking one updates the form and the plan shows "on track".
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, budget ₸400,000, growth 0% shows "Save ₸436,000", "Buy in June 2028" (20 months needed, starting October 2026) and "Aim for ₸8.20m" (what the budget can reach: ₸1,000,000 + 18 × ₸400,000).
- Clicking any of the three shows "on track".
- If the goal cannot be reached within 360 months on this budget, only the "save more" fix is offered, with a message saying so.

### T-018 · Loan comparison · M

What: A card compares with buying today using a bank loan over the same number of months, with savings as the down payment. It shows the monthly payment and total interest (riba), worded respectfully ("a loan would cost ₸1.47m more"). The loan rate starts at 25%, a placeholder kept in one place until real bank offers are collected, and can be edited.
Done when:

- Price ₸8,851,400, savings ₸1,000,000, 18 months, 25%: payment ₸518,055 and total interest ₸1,473,589, shown as about ₸518,000 a month and ₸1.47m (GT-07).
- Changing the rate updates the card, and a 0% rate gives zero interest.
- Savings that cover the price show "no loan needed" instead of a negative loan.

### T-019 · Disclaimer and wording check · S

What: Every result shows a disclaimer that the figures are illustrations, not forecasts. An automatic test makes sure the texts never promise returns.
Done when:

- Every result shows "Information, not investment advice or a fatwa" and "These figures are illustrations, not forecasts. Real results can be lower, including losses."
- A test fails if the text file contains "you will earn", "guaranteed", "expected" or "recommended".
- Both sentences come from the text file.

### T-020 · Copy link to this plan · M

What: A "Copy link to this plan" button creates a link holding all the inputs, including the chosen growth rate. Opening it on another computer rebuilds the same form and plan. Nothing is stored on a server.
Done when:

- A copied link opened in a new window shows the same form and identical numbers (for example the ₸10,000,000 in 20 months example at 10%).
- The link carries a format version number so old links can keep working later.
- Bad or edited values in a link show the same errors as typed values and never crash the page.
- A test builds a link and reads it back for several example goals and gets the same inputs.

### T-023 · "How we calculate" page · M

What: A page linked from the bottom of the planner explains the method in plain words: how a monthly amount follows from the price, the months, what you have saved and the growth you assume. It says the growth rates are examples, not forecasts.
Done when:

- The planner links to the page.
- It explains the method with an example: ₸10,000,000 in 20 months needs ₸500,000 a month at 0% and about ₸463,000 at 10% a year.
- It explains the loan comparison and repeats the disclaimer from T-019.

### T-024 · Accessibility and speed pass · M

What: Make the site usable with a keyboard and a screen reader and fast on an ordinary laptop.
Done when:

- Every field has a label, every button works with the keyboard, and errors are read out by screen readers.
- An automated accessibility scan finds no WCAG 2.1 AA problems on the home, planner and how-we-calculate pages.
- Results appear within 200 ms of a change, with the measurement reported.

### T-025 · Product name and look and feel · L

What: Together we decide the product name and visual style, then apply them across the site at screen widths of 1024 px and wider, with the form and plan side by side.
Done when:

- The agreed name shows in the header of every page.
- The agreed colors and fonts are used on the home, planner and how-we-calculate pages.
- At 1024 px and wider the planner shows the form and plan side by side.

## In progress

## Ideas

- Remember the last inputs on this device, with a "clear" button.
- Strict content security policy and browser error reporting without personal data.
- Phone layout where the form and plan stack.
- A comma typed as a decimal mark (for example "1,5") is read as a thousands separator; decide how to treat commas.
- The planner form is not in the first page the server sends, only "Loading…" until the browser starts it; show the form straight away.
- Group the month and year fields under one label for screen readers (covered by T-024).
- The month count can shift if a tab stays open across the end of a month.
- Optional "price rise a year (%)" field, left at 0: the plan saves for the higher price at the date and shows both prices (₸10,000,000 in 20 months at 8% a year: about ₸11.37m at the date and about ₸568,000 a month with no growth).

## Waiting for the financist

Not started until the financist confirms the numbers and the named options (deposit, sukuk fund, equity fund). The examples assume the original spec values and the optional price rise from Ideas.

### T-026 · Assumptions file with sources · M

What: Every number the plan relies on goes into one dated, versioned data file. Each number records where it comes from, a date, and whether it is an "estimate" or "past data". The spec's original values stay as a frozen set for tests, so changing the real values never breaks them. The values below are placeholders to be replaced with the financist's numbers.
Done when:

- The file has a version and a date, and lists the asset types with yearly returns bad / middle / good and the fall in the bad case: Islamic deposit in tenge 8 / 11 / 13.5% (fall 0%), Islamic deposit in dollars 1 / 2 / 3% (0%), sukuk fund 2 / 4.5 / 6% (10%), Shariah equity fund 0 / 7 / 11% (25%). The frozen test set keeps the spec's bad-case values of 3.5% and 5%.
- It also holds: price growth 8% (tenge goals) and 3% (dollar goals), dollar rate ₸442.57, tenge weakening 5% a year, tenge shock 15%, bank loan rate 25%, safety rule limits of 12 and 36 months, and the strategy mixes (Cautious 100% Islamic deposit; Balanced 60% deposit, 20% sukuk, 20% equity; Growth 20% deposit, 20% sukuk, 60% equity; deposit in dollars for dollar goals).
- A test fails if a number has no source, date or "estimate" / "past data" label, if a fall is outside 0–100%, if a mix does not add up to 100%, or if bad is above middle or middle above good. Negative returns are allowed.
- The planner shows "Numbers updated Oct 2026" from the file and warns when it is more than 45 days old.

### T-013 · Strategy engine with the safety rule · M

What: A new engine adds money month by month for the three example strategies, switching to safer mixes as the date gets close (Cautious only in the last 12 months, at most Balanced in the last 36). In the bad case, risky holdings fall and the tenge shock applies in the last month before the money moves to Cautious. Tenge goals only. The planner does not use it yet, so nothing changes on screen. If the spec's numbers below cannot be reproduced, stop and report instead of changing them.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, Balanced, today October 2026: price at the date ₸9,934,536; monthly middle ₸451,784, bad ₸490,367, good ₸442,402; Balanced in months 1–6 and Cautious in months 7–18 (GT-03).
- Same inputs with Cautious: middle ₸451,791, bad ₸463,335 (GT-04).
- Home deposit ₸15,000,000, 120 months, savings ₸2,000,000: price at the date ₸32,383,875; Growth middle ₸123,904, bad ₸167,449, good ₸98,404 with 84 months Growth, 24 Balanced, 12 Cautious; Cautious middle ₸126,810, bad ₸155,815 (GT-06).
- With every return and price growth at 0 the monthly amount is (price − savings) ÷ months (GT-01: ₸491,744.44 for ₸8,851,400 over 18 months with no savings); with a 14.5% return it is ₸446,006.97 (GT-02).
- Property tests pass: bad ≤ middle ≤ good value at the date; more savings never raises the monthly amount; a bigger budget never lowers the value at the date; savings that cover the price give 0 a month; never Growth with 36 or fewer months left and always Cautious with 12 or fewer; never NaN, infinity or a negative amount.

### T-014 · Three strategy cards · M

What: Below the amounts, cards side by side (Just set aside, Cautious, Balanced, Growth) join the what-if table from T-010. The three strategy cards show the normal and safe monthly amounts and a one-line description of the mix. Cautious is the open strategy and none is labelled "recommended". Clicking a card selects it, and the selected card drives the amounts at the top. A card shows a note when the safety rule changes its mix.
Done when:

- Car ₸8,851,400, 18 months, savings ₸1,000,000, price rise 8%: Cautious shows ₸452,000 normal and ₸463,000 safe; Balanced and Growth show ₸452,000 normal and ₸490,000 safe, and Growth says it acts like Balanced when under 3 years remain.
- "Just set aside" is selected at the start, and clicking another card changes the top amounts.
- No card or text says "recommended" or "best".

### T-015 · Dollar goals · M

What: A ₸/$ switch next to the price. A dollar price is converted to tenge at the assumed dollar rate, which weakens the tenge 5% a year. Dollar goals are saved in dollar assets with 3% price growth, and the bad case includes the 15% tenge shock where it applies. Hajj or Umrah starts in dollars and other goals start in tenge. Savings and budget are still entered in tenge.
Done when:

- Car $20,000, 18 months, no savings, Cautious, price rise 3%: price at the date ₸9,955,240; monthly middle ₸526,608, bad ₸530,358 (GT-05).
- A dollar price outside $20–$10m shows an error under the field.
- Switching currency keeps the other fields and updates the plan; picking Hajj or Umrah selects $.

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

## Done

- T-001 · Scaffold the repo (2026-10-09): initial commit with the empty project skeleton.
- T-002 · Set up the Next.js app (2026-10-09): created the Next.js/TypeScript/Tailwind project.
- T-003 · Add the home page (2026-10-09): built the `/` page with a "Start planning" link.
- T-004 · Add the monthly savings calculation (2026-10-09): built the savings engine in `src/lib/engine`.
- T-005 · Document the project for Claude Code (2026-10-09): added CLAUDE.md.
- T-006 · Document the engine and tests in CLAUDE.md (2026-10-09): expanded CLAUDE.md with engine and test details.
- T-007 · Add lightweight quality checks (2026-10-12): set up Prettier, ESLint config, npm scripts, and CI.
- T-008 · Planner page with the simple calculation (2026-10-13): the planner now has a price, date and savings form that shows the monthly amount for plain saving (no interest, no price rise), with input checks and all texts in one file.
- T-009 · Home page headline and text (2026-10-13): the home page now says "Plan your purchase without a loan" with a one-sentence explanation, and its texts come from the shared text file.
