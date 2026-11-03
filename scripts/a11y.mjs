// Accessibility scan (axe, WCAG 2.1 AA) and speed check for the built site.
// Run with `npm run a11y`. Needs Chrome or Edge installed; downloads nothing.

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const PORT = 3107;
const BASE = `http://localhost:${PORT}`;
const LIMIT_MS = 200;
const RUNS = 20;

// ---- server -----------------------------------------------------------

const server = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "start", "-p", String(PORT)],
  { stdio: "ignore" },
);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The site did not start. Did `next build` run?");
}

// ---- dates ------------------------------------------------------------

const now = new Date();
function monthsAhead(count) {
  const total = now.getFullYear() * 12 + now.getMonth() + count;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}
const in18 = monthsAhead(18);

// ---- planner states ---------------------------------------------------

async function fillPlanner(page, fields) {
  if (fields.price !== undefined) await page.fill("#price", fields.price);
  if (fields.savings !== undefined) await page.fill("#savings", fields.savings);
  if (fields.month !== undefined)
    await page.selectOption("#month", fields.month);
  if (fields.year !== undefined) await page.selectOption("#year", fields.year);
  if (fields.budget !== undefined) await page.fill("#budget", fields.budget);
  if (fields.ownRate !== undefined)
    await page.fill("#own-rate", fields.ownRate);
  if (fields.loanRate !== undefined)
    await page.fill("#loan-rate", fields.loanRate);
}

const date18 = { month: String(in18.month), year: String(in18.year) };
const car = { price: "8 851 400", savings: "1 000 000" };

const plannerStates = [
  ["empty form", {}],
  ["plan with a date", { ...car, ...date18 }],
  ["plan, own rate", { ...car, ...date18, ownRate: "7.5" }],
  [
    "field errors on a plan",
    { ...car, ...date18, budget: "-5", ownRate: "abc", loanRate: "abc" },
  ],
  ["price and savings errors", { price: "5", savings: "-1" }],
  ["budget short, fixes shown", { ...car, ...date18, budget: "400 000" }],
  ["budget on track", { ...car, ...date18, budget: "500 000" }],
  [
    "savings cover the price",
    { price: "8 851 400", savings: "10 000 000", ...date18 },
  ],
  ["budget picks the date", { ...car, month: "", year: "", budget: "400 000" }],
  [
    "budget never reaches the goal",
    { ...car, month: "", year: "", budget: "1 000" },
  ],
];

// ---- axe --------------------------------------------------------------

const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function scan(page, label) {
  await page.evaluate(axeSource);
  const result = await page.evaluate(() =>
    axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
    }),
  );
  console.log(
    `  ${result.violations.length === 0 ? "ok  " : "FAIL"} ${label}` +
      ` (${result.passes.length} rules passed)`,
  );
  for (const violation of result.violations) {
    console.log(
      `       - ${violation.id} [${violation.impact}]: ${violation.help}`,
    );
    for (const node of violation.nodes.slice(0, 3)) {
      console.log(`           ${node.target.join(" ")}`);
      console.log(`           ${node.html.slice(0, 120)}`);
    }
  }
  return result.violations.length;
}

// ---- things axe cannot judge -----------------------------------------

function check(ok, label) {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}`);
  return ok ? 0 : 1;
}

async function structure(page) {
  let failures = 0;
  await fillPlanner(page, { ...car, ...date18 });

  failures += check(
    (await page
      .locator('[role="group"][aria-labelledby="date-label"] select')
      .count()) === 2,
    "month and year sit in one labelled group",
  );
  failures += check(
    (await page
      .locator("[aria-live] input, [role='status'] input, [aria-live] button")
      .count()) === 0,
    "no input or button sits inside a live region",
  );
  failures += check(
    (await page.locator("[role='status']").count()) === 1,
    "exactly one live region (the headline result)",
  );
  const headline = await page.locator("[role='status']").innerText();
  failures += check(
    headline.includes("a month"),
    "the live region holds the monthly amount",
  );

  await fillPlanner(page, { price: "abc" });
  failures += check(
    (await page.locator("[role='alert']").count()) >= 1,
    "an error message announces itself (role=alert)",
  );

  // Keyboard: every control reached with Tab shows a visible focus outline.
  await page.reload();
  await page.waitForSelector("#price");
  let hidden = 0;
  let stops = 0;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return {
        style: style.outlineStyle,
        width: parseFloat(style.outlineWidth),
      };
    });
    stops += 1;
    if (outline.style === "none" || outline.width === 0) hidden += 1;
  }
  failures += check(
    hidden === 0,
    `focus outline visible on all ${stops} tab stops tried`,
  );
  return failures;
}

// ---- speed ------------------------------------------------------------

// Sets a field the way a user would and returns the ms until the changed
// results are painted (two animation frames after the DOM changes).
function timeChangeInPage({ selector, value }) {
  const el = document.querySelector(selector);
  const results = document.querySelector("section");
  const isSelect = el instanceof HTMLSelectElement;
  const proto = isSelect
    ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const timeout = setTimeout(
      () => reject(new Error("results did not change")),
      3000,
    );
    const observer = new MutationObserver(() => {
      observer.disconnect();
      clearTimeout(timeout);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => resolve(performance.now() - started)),
      );
    });
    observer.observe(results, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    setter.call(el, value);
    el.dispatchEvent(
      new Event(isSelect ? "change" : "input", { bubbles: true }),
    );
  });
}

function summary(times) {
  const sorted = [...times].sort((a, b) => a - b);
  return {
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
  };
}

async function measure(page, label, selector, values) {
  // Start from the last value so that the first timed change really changes the page.
  const start = values[values.length - 1];
  if (selector === "#month" || selector === "#year") {
    await page.selectOption(selector, start);
  } else {
    await page.fill(selector, start);
  }
  const times = [];
  for (let i = 0; i < RUNS + 1; i++) {
    const ms = await page.evaluate(timeChangeInPage, {
      selector,
      value: values[i % values.length],
    });
    if (i > 0) times.push(ms); // the first run warms up
  }
  const { median, max } = summary(times);
  const slow = times.filter((ms) => ms > LIMIT_MS).length;
  // Headless Chrome on a normal PC sometimes stalls for 0.4 s or more on a
  // single frame, even on an idle page with no app code. One stalled run must
  // not fail the check, but a genuinely slow update makes the median or many
  // runs slow, so: the median must be within the limit and at most 10% of
  // runs may go over it.
  const ok = median <= LIMIT_MS && slow <= Math.floor(RUNS * 0.1);
  if (slow > 0) {
    const each = times.map((ms) => ms.toFixed(0));
    console.log(
      `       runs over ${LIMIT_MS} ms: ${slow}. All runs (ms): ${each.join(" ")}`,
    );
  }
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${label}: median ${median.toFixed(0)} ms, worst ${max.toFixed(0)} ms`,
  );
  return ok ? 0 : 1;
}

async function speed(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/planner`);
  await page.waitForSelector("#price");
  let failures = 0;

  await fillPlanner(page, { ...car, ...date18 });
  failures += await measure(page, "price change", "#price", [
    "9 000 000",
    "8 851 400",
  ]);
  failures += await measure(page, "date change", "#year", [
    String(in18.year + 1),
    String(in18.year),
  ]);
  // Back to the car at 18 months, where both budgets are short, so the
  // "short by" line changes every time.
  await fillPlanner(page, { ...car, ...date18 });
  failures += await measure(page, "budget, date set", "#budget", [
    "400 000",
    "410 000",
  ]);

  await fillPlanner(page, { month: "", year: "", ownRate: "7.5" });
  failures += await measure(page, "budget picks the date", "#budget", [
    "400 000",
    "410 000",
  ]);
  // Flipping between "never" and "reachable" so the page changes each time;
  // the "never" step searches all 360 months for every row (the slowest case).
  failures += await measure(
    page,
    "budget flips to never reaching the goal (slowest)",
    "#budget",
    ["1 000", "400 000"],
  );
  await context.close();
  return failures;
}

// ---- main -------------------------------------------------------------

let problems = 0;
let browser;
try {
  await waitForServer();
  try {
    browser = await chromium.launch({ channel: "chrome" });
  } catch {
    browser = await chromium.launch({ channel: "msedge" });
  }

  for (const colorScheme of ["light", "dark"]) {
    console.log(`\nAccessibility scan (${colorScheme} colours)`);
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();

    for (const [path, label] of [
      ["/", "home"],
      ["/how-we-calculate", "how we calculate"],
    ]) {
      await page.goto(`${BASE}${path}`);
      problems += await scan(page, label);
    }

    await page.goto(`${BASE}/planner`);
    await page.waitForSelector("#price");
    for (const [label, fields] of plannerStates) {
      await fillPlanner(page, fields);
      problems += await scan(page, `planner: ${label}`);
      // Back to a blank form for the next state.
      await page.reload();
      await page.waitForSelector("#price");
    }

    console.log(`\nStructure checks (${colorScheme} colours)`);
    await page.goto(`${BASE}/planner`);
    await page.waitForSelector("#price");
    problems += await structure(page);
    await context.close();
  }

  console.log(
    `\nSpeed (production build, limit ${LIMIT_MS} ms, ${RUNS} runs each)`,
  );
  problems += await speed(browser);
} catch (error) {
  console.error(error);
  problems += 1;
} finally {
  await browser?.close();
  server.kill();
}

console.log(
  problems === 0 ? "\nAll checks passed." : `\n${problems} problem(s) found.`,
);
process.exit(problems === 0 ? 0 : 1);
