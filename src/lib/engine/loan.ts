// Bank loan cost for comparison with saving. Pure functions, no rounding.

import { toMonthlyRate } from "./savings";

export type LoanTerms = {
  /** Price of the purchase. */
  price: number;
  /** Paid upfront from savings; the rest is borrowed. */
  downPayment: number;
  /** Months to repay, a whole number from 1 to 360. */
  months: number;
  /** Effective yearly interest rate, e.g. 0.25 for 25%. */
  yearlyRate: number;
};

export type LoanCost = {
  loanAmount: number;
  monthlyPayment: number;
  /** Everything paid back above the amount borrowed. */
  totalInterest: number;
};

/** Equal monthly payments (annuity) on what is left after the down payment. */
export function loanCost({
  price,
  downPayment,
  months,
  yearlyRate,
}: LoanTerms): LoanCost {
  if (!Number.isInteger(months) || months < 1 || months > 360) {
    throw new Error("months must be a whole number from 1 to 360");
  }
  if (price < 0 || downPayment < 0) {
    throw new Error("amounts must not be negative");
  }
  if (yearlyRate < 0) {
    throw new Error("the rate must not be negative");
  }

  const loanAmount = Math.max(0, price - downPayment);
  if (loanAmount === 0) {
    return { loanAmount: 0, monthlyPayment: 0, totalInterest: 0 };
  }

  const r = toMonthlyRate(yearlyRate);
  const monthlyPayment =
    r === 0 ? loanAmount / months : (loanAmount * r) / (1 - (1 + r) ** -months);
  return {
    loanAmount,
    monthlyPayment,
    totalInterest: monthlyPayment * months - loanAmount,
  };
}
