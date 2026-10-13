import { describe, expect, it } from "vitest";
import { buildPlan, monthsBetween, parseAmount } from "./plan";

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
