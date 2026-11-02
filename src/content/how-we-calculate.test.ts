import { describe, expect, it } from "vitest";
import { loanCost } from "../lib/engine/loan";
import { monthlySavingNeeded } from "../lib/engine/savings";
import { formatMonthly, formatTotal } from "../lib/planner/format";
import { growthAdded } from "../lib/planner/plan";
import { en } from "./en";

const page = en.howWeCalculate;
const pageText = page.sections
  .flatMap((section) => section.paragraphs)
  .join("\n");

// The page quotes figures by hand. These tests work them out with the real
// calculation, so a change to the maths can't leave the page out of date.
const example = { price: 10_000_000, months: 20, savings: 0 };

describe("how we calculate page", () => {
  it("has the six sections in order", () => {
    expect(page.sections.map((section) => section.id)).toEqual([
      "idea",
      "example",
      "inputs",
      "growth",
      "budget",
      "loan",
    ]);
    for (const section of page.sections) {
      expect(section.heading).not.toBe("");
      expect(section.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it("links both ways with the planner", () => {
    expect(page.title).toBe("How we calculate");
    expect(page.backToPlanner).toBe("Back to the planner");
  });

  it("quotes the saving needed with and without growth", () => {
    const at0 = monthlySavingNeeded({
      ...example,
      yearlyReturn: 0,
      yearlyPriceGrowth: 0,
    });
    const at10 = monthlySavingNeeded({
      ...example,
      yearlyReturn: 0.1,
      yearlyPriceGrowth: 0,
    });
    expect(formatMonthly(at0)).toBe("₸500,000");
    expect(formatMonthly(at10)).toBe("₸463,000");
    expect(pageText).toContain(formatMonthly(at0));
    expect(pageText).toContain(formatMonthly(at10));
  });

  it("quotes how much the growth adds at 10%", () => {
    const added = growthAdded(
      { months: 20, goalAmount: 10_000_000, saved: 0 },
      0.1,
    );
    expect(pageText).toContain(formatTotal(added));
  });

  it("quotes the loan payment and interest at 25%", () => {
    const cost = loanCost({
      price: 10_000_000,
      downPayment: 0,
      months: 20,
      yearlyRate: 0.25,
    });
    expect(pageText).toContain(formatMonthly(cost.monthlyPayment));
    expect(pageText).toContain(formatTotal(cost.totalInterest));
  });

  it("says the rates are examples, not forecasts", () => {
    expect(pageText).toContain("not forecasts");
  });

  it("links to the page from the planner", () => {
    expect(en.planner.howLink).toBe(page.title);
  });
});
