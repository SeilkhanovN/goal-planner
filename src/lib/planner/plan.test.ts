import { describe, expect, it } from "vitest";
import {
  addMonths,
  budgetCheck,
  budgetFixes,
  buildPlan,
  monthlyAtGrowth,
  monthsBetween,
  parseAmount,
  parseBudget,
} from "./plan";

function expectAbout(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

const today = { year: 2026, month: 10 };

const car = {
  price: "8851400",
  savings: "1000000",
  month: "4",
  year: "2028",
};

describe("monthsBetween", () => {
  it("counts whole months from today to the target month", () => {
    expect(monthsBetween(today, { year: 2028, month: 4 })).toBe(18);
    expect(monthsBetween(today, { year: 2026, month: 11 })).toBe(1);
  });

  it("is 0 for this month and negative for past months", () => {
    expect(monthsBetween(today, { year: 2026, month: 10 })).toBe(0);
    expect(monthsBetween(today, { year: 2026, month: 9 })).toBe(-1);
  });
});

describe("parseAmount", () => {
  it.each([
    ["8851400", 8_851_400],
    ["8 850 000", 8_850_000],
    ["8,850,000", 8_850_000],
    ["8 850 000", 8_850_000],
    ["1.5", 1.5],
    ["-5", -5],
    ["0", 0],
  ])("reads %j as %d", (text, value) => {
    expect(parseAmount(text)).toEqual({ kind: "number", value });
  });

  it.each(["", "   "])("treats %j as blank", (text) => {
    expect(parseAmount(text)).toEqual({ kind: "blank" });
  });

  it.each(["abc", "12abc", "1e5", "1.2.3", "--5", "₸100"])(
    "rejects %j",
    (text) => {
      expect(parseAmount(text)).toEqual({ kind: "invalid" });
    },
  );
});

describe("buildPlan", () => {
  it("splits what is left evenly: no interest and no price rise", () => {
    const { errors, plan } = buildPlan(car, today);
    expect(errors).toEqual({});
    expect(plan?.months).toBe(18);
    expect(plan?.goalAmount).toBe(8_851_400);
    expectAbout(plan!.monthlySaving, 436_188.89);
  });

  it("matches GT-01: ₸8,851,400 over 18 months with nothing saved", () => {
    const { plan } = buildPlan({ ...car, savings: "" }, today);
    expectAbout(plan!.monthlySaving, 491_744.44);
  });

  it("makes the saving add up: 20 × monthly is exactly the price", () => {
    const { plan } = buildPlan(
      { price: "10000000", savings: "", month: "6", year: "2028" },
      today,
    );
    expect(plan?.months).toBe(20);
    expectAbout(plan!.monthlySaving, 500_000);
    expectAbout(plan!.monthlySaving * plan!.months, 10_000_000);
  });

  it("needs the whole price in 1 month with no savings", () => {
    const { plan } = buildPlan(
      { price: "1000000", savings: "", month: "11", year: "2026" },
      today,
    );
    expect(plan?.months).toBe(1);
    expectAbout(plan!.monthlySaving, 1_000_000);
  });

  it("counts blank savings as 0", () => {
    const blank = buildPlan({ ...car, savings: "" }, today).plan;
    const zero = buildPlan({ ...car, savings: "0" }, today).plan;
    expect(blank).not.toBeNull();
    expect(blank?.monthlySaving).toBe(zero?.monthlySaving);
  });

  it("needs nothing a month when savings already cover the price", () => {
    const { plan } = buildPlan({ ...car, savings: "20000000" }, today);
    expect(plan?.monthlySaving).toBe(0);
  });

  it("accepts the price limits and the 360-month limit", () => {
    expect(buildPlan({ ...car, price: "10000" }, today).errors).toEqual({});
    expect(buildPlan({ ...car, price: "5000000000" }, today).errors).toEqual(
      {},
    );
    expect(
      buildPlan({ ...car, month: "10", year: "2056" }, today).plan?.months,
    ).toBe(360);
  });

  it.each([
    ["abc", "notNumber"],
    ["9999", "priceTooLow"],
    ["-100", "priceTooLow"],
    ["5000000001", "priceTooHigh"],
  ])("rejects price %j with %s", (price, code) => {
    const result = buildPlan({ ...car, price }, today);
    expect(result.errors.price).toBe(code);
    expect(result.plan).toBeNull();
  });

  it.each([
    ["abc", "notNumber"],
    ["-1", "negative"],
  ])("rejects savings %j with %s", (savings, code) => {
    const result = buildPlan({ ...car, savings }, today);
    expect(result.errors.savings).toBe(code);
    expect(result.plan).toBeNull();
  });

  it.each([
    [{ month: "10", year: "2026" }, "dateNotLater"],
    [{ month: "9", year: "2026" }, "dateNotLater"],
    [{ month: "11", year: "2056" }, "dateTooFar"],
    [{ month: "4", year: "abc" }, "notNumber"],
    [{ month: "4", year: "20.5" }, "notNumber"],
  ])("rejects date %j with %s", (date, code) => {
    const result = buildPlan({ ...car, ...date }, today);
    expect(result.errors.date).toBe(code);
    expect(result.plan).toBeNull();
  });

  it("waits quietly, with no errors and no plan, until price and date are entered", () => {
    for (const partial of [
      { price: "" },
      { month: "" },
      { year: "" },
      { price: "", month: "", year: "" },
    ]) {
      expect(buildPlan({ ...car, ...partial }, today)).toEqual({
        errors: {},
        plan: null,
      });
    }
  });

  it("waits quietly while the year is still being typed", () => {
    expect(buildPlan({ ...car, year: "20" }, today)).toEqual({
      errors: {},
      plan: null,
    });
  });

  it("still reports an error in one field while another is blank", () => {
    const result = buildPlan({ ...car, price: "abc", month: "" }, today);
    expect(result.errors.price).toBe("notNumber");
    expect(result.plan).toBeNull();
  });
});

describe("parseBudget", () => {
  it.each(["", "  ", "0", "0 000"])("treats %j as no budget", (text) => {
    expect(parseBudget(text)).toEqual({ kind: "none" });
  });

  it("reads grouped amounts", () => {
    expect(parseBudget("400 000")).toEqual({ kind: "budget", value: 400_000 });
  });

  it("rejects negative amounts and text", () => {
    expect(parseBudget("-5")).toEqual({ kind: "error", error: "negative" });
    expect(parseBudget("abc")).toEqual({ kind: "error", error: "notNumber" });
  });
});

describe("budgetCheck", () => {
  const plan = {
    months: 18,
    goalAmount: 8_851_400,
    saved: 1_000_000,
    growth: 0,
    monthlySaving: 0,
  };

  it("is short by the gap on the purchase date", () => {
    const check = budgetCheck(plan, 0, 400_000);
    expect(check.kind).toBe("short");
    if (check.kind === "short") expectAbout(check.shortBy, 651_400);
  });

  it("is on track when savings already cover the goal, with the surplus", () => {
    const check = budgetCheck({ ...plan, saved: 10_000_000 }, 0, 400_000);
    expect(check.kind).toBe("onTrack");
    if (check.kind === "onTrack") expectAbout(check.surplus ?? 0, 1_148_600);
  });

  it("is on track, without a surplus, when the budget covers the monthly amount", () => {
    const monthly = monthlyAtGrowth(plan, 0);
    expect(budgetCheck(plan, 0, monthly)).toEqual({ kind: "onTrack" });
    expect(budgetCheck(plan, 0, monthly + 50_000)).toEqual({ kind: "onTrack" });
  });

  it("is short by less when the money grows", () => {
    const at0 = budgetCheck(plan, 0, 300_000);
    const at10 = budgetCheck(plan, 0.1, 300_000);
    expect(at0.kind).toBe("short");
    expect(at10.kind).toBe("short");
    if (at0.kind === "short" && at10.kind === "short") {
      expect(at10.shortBy).toBeLessThan(at0.shortBy);
    }
  });

  it("can turn short into on track when the growth is high enough", () => {
    expect(budgetCheck(plan, 0, 436_000).kind).toBe("short");
    expect(budgetCheck(plan, 0.2, 436_000).kind).toBe("onTrack");
  });

  it("counts a gap that rounds to ₸0 as on track", () => {
    const monthly = monthlyAtGrowth(plan, 0);
    expect(budgetCheck(plan, 0, monthly - 1)).toEqual({ kind: "onTrack" });
  });
});

describe("addMonths", () => {
  it("moves forward across year ends", () => {
    expect(addMonths(today, 20)).toEqual({ year: 2028, month: 6 });
    expect(addMonths(today, 3)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(today, 360)).toEqual({ year: 2056, month: 10 });
  });
});

describe("budgetFixes", () => {
  const plan = { months: 18, goalAmount: 8_851_400, saved: 1_000_000 };

  it("finds the three fixes for the car at 0%", () => {
    const fixes = budgetFixes(plan, 0, 400_000, today);
    expect(fixes.saveMore).toBe(437_000);
    expect(fixes.buyLater).toEqual({
      months: 20,
      date: { year: 2028, month: 6 },
    });
    expect(fixes.aimFor).toBe(8_200_000);
  });

  it("reaches the goal sooner and aims higher when the money grows", () => {
    const at0 = budgetFixes(plan, 0, 350_000, today);
    const at10 = budgetFixes(plan, 0.1, 350_000, today);
    expect(at10.buyLater && at0.buyLater).toBeTruthy();
    expect(at10.buyLater!.months).toBeLessThan(at0.buyLater!.months);
    expect(at10.aimFor!).toBeGreaterThan(at0.aimFor!);
    expect(at10.saveMore).toBeLessThan(at0.saveMore);
  });

  it("offers only 'save more' when the goal is out of reach in 360 months", () => {
    const fixes = budgetFixes(plan, 0, 1_000, today);
    expect(fixes.buyLater).toBeNull();
    expect(fixes.aimFor).toBeNull();
    expect(fixes.saveMore).toBe(437_000);
  });

  it("hides 'aim for' when it would be below the minimum price", () => {
    const fixes = budgetFixes(
      { months: 1, goalAmount: 10_000, saved: 0 },
      0,
      5_000,
      today,
    );
    expect(fixes.aimFor).toBeNull();
    expect(fixes.buyLater).not.toBeNull();
  });

  it.each([0, 0.1, 0.2])("every fix lands on track at %d growth", (rate) => {
    const budget = 300_000;
    expect(budgetCheck(plan, rate, budget).kind).toBe("short");
    const fixes = budgetFixes(plan, rate, budget, today);
    expect(budgetCheck(plan, rate, fixes.saveMore).kind).toBe("onTrack");
    expect(fixes.buyLater).not.toBeNull();
    expect(
      budgetCheck({ ...plan, months: fixes.buyLater!.months }, rate, budget)
        .kind,
    ).toBe("onTrack");
    expect(fixes.aimFor).not.toBeNull();
    expect(
      budgetCheck({ ...plan, goalAmount: fixes.aimFor! }, rate, budget).kind,
    ).toBe("onTrack");
  });
});
