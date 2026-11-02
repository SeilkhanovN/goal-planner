import { describe, expect, it } from "vitest";
import { loanCost } from "./loan";

// Expected values are rounded, so allow a difference of up to 1.
function expectAbout(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

const car = {
  price: 8_851_400,
  downPayment: 1_000_000,
  months: 18,
  yearlyRate: 0.25,
};

describe("loanCost", () => {
  it("matches the car example at 25% a year", () => {
    const cost = loanCost(car);
    expectAbout(cost.loanAmount, 7_851_400);
    expectAbout(cost.monthlyPayment, 518_055);
    expectAbout(cost.totalInterest, 1_473_589);
  });

  it("splits the loan evenly at 0% and charges no interest", () => {
    const cost = loanCost({ ...car, yearlyRate: 0 });
    expectAbout(cost.monthlyPayment, 436_189);
    expect(cost.totalInterest).toBeCloseTo(0, 6);
  });

  it("costs more interest at a higher rate", () => {
    expect(loanCost({ ...car, yearlyRate: 0.3 }).totalInterest).toBeGreaterThan(
      loanCost(car).totalInterest,
    );
  });

  it("needs no loan when the down payment covers the price", () => {
    expect(loanCost({ ...car, downPayment: 8_851_400 })).toEqual({
      loanAmount: 0,
      monthlyPayment: 0,
      totalInterest: 0,
    });
    expect(loanCost({ ...car, downPayment: 10_000_000 }).loanAmount).toBe(0);
  });

  it.each([0, 361, 1.5])("throws for %d months", (months) => {
    expect(() => loanCost({ ...car, months })).toThrow();
  });

  it("throws for negative amounts or rates", () => {
    expect(() => loanCost({ ...car, price: -1 })).toThrow();
    expect(() => loanCost({ ...car, downPayment: -1 })).toThrow();
    expect(() => loanCost({ ...car, yearlyRate: -0.1 })).toThrow();
  });
});
