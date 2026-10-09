import { describe, expect, it } from "vitest";
import { monthlySavingNeeded, priceAtDate, type SavingsGoal } from "./savings";

// Expected values are rounded, so allow a difference of up to 1.
function expectAbout(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

const car: SavingsGoal = {
  price: 8_851_400,
  months: 18,
  savings: 0,
  yearlyReturn: 0,
  yearlyPriceGrowth: 0,
};

describe("monthlySavingNeeded", () => {
  it("splits the price evenly with no return and no growth", () => {
    expectAbout(monthlySavingNeeded(car), 491_744.44);
  });

  it("needs less each month when savings earn a return", () => {
    expectAbout(monthlySavingNeeded({ ...car, yearlyReturn: 0.145 }), 446_006.97);
  });

  it("accounts for existing savings, return and price growth", () => {
    const goal = {
      ...car,
      savings: 1_000_000,
      yearlyReturn: 0.11,
      yearlyPriceGrowth: 0.08,
    };
    expectAbout(priceAtDate(goal.price, goal.months, goal.yearlyPriceGrowth), 9_934_536);
    expectAbout(monthlySavingNeeded(goal), 451_791);
    expectAbout(monthlySavingNeeded({ ...goal, yearlyReturn: 0.08 }), 463_335);
  });

  it("handles a single month", () => {
    expectAbout(
      monthlySavingNeeded({
        price: 1_000_000,
        months: 1,
        savings: 0,
        yearlyReturn: 0.11,
        yearlyPriceGrowth: 0.08,
      }),
      1_006_434,
    );
  });

  it("returns 0 when savings already cover the price", () => {
    expect(monthlySavingNeeded({ ...car, savings: 10_000_000 })).toBe(0);
  });

  it.each([0, 361])("throws for %i months", (months) => {
    expect(() => monthlySavingNeeded({ ...car, months })).toThrow();
  });
});
