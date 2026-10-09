// Monthly savings math. Pure functions, no rounding: round only for display.

export type SavingsGoal = {
  /** Price of the goal today. */
  price: number;
  /** Months until the purchase, a whole number from 1 to 360. */
  months: number;
  /** Money already saved today. */
  savings: number;
  /** Yearly return on savings, e.g. 0.11 for 11%. */
  yearlyReturn: number;
  /** Yearly growth of the price, e.g. 0.08 for 8%. */
  yearlyPriceGrowth: number;
};

/** Monthly rate that compounds to the given yearly rate. */
export function toMonthlyRate(yearlyRate: number): number {
  return (1 + yearlyRate) ** (1 / 12) - 1;
}

/** Price after `months`, growing by `yearlyPriceGrowth` a year. */
export function priceAtDate(
  price: number,
  months: number,
  yearlyPriceGrowth: number,
): number {
  return price * (1 + yearlyPriceGrowth) ** (months / 12);
}

/**
 * Deposit to make at the end of each month so that savings plus deposits,
 * growing at `yearlyReturn`, reach the price at the purchase date.
 */
export function monthlySavingNeeded({
  price,
  months,
  savings,
  yearlyReturn,
  yearlyPriceGrowth,
}: SavingsGoal): number {
  if (!Number.isInteger(months) || months < 1 || months > 360) {
    throw new Error("months must be a whole number from 1 to 360");
  }
  if (price < 0 || savings < 0) {
    throw new Error("amounts must not be negative");
  }

  const target = priceAtDate(price, months, yearlyPriceGrowth);
  const r = toMonthlyRate(yearlyReturn);

  let deposit: number;
  if (r === 0) {
    deposit = (target - savings) / months;
  } else {
    const growth = (1 + r) ** months;
    deposit = ((target - savings * growth) * r) / (growth - 1);
  }
  return Math.max(0, deposit);
}
