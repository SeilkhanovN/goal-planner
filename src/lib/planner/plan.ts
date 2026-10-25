import { monthlySavingNeeded } from "../engine/savings";

export const MIN_PRICE = 10_000;
export const MAX_PRICE = 5_000_000_000;
export const MAX_MONTHS = 360;

export type YearMonth = { year: number; month: number };

/** Raw text from the form fields. */
export type PlannerInput = {
  price: string;
  savings: string;
  /** "1" to "12", or "" when no month is chosen. */
  month: string;
  year: string;
};

export type PriceError = "notNumber" | "priceTooLow" | "priceTooHigh";
export type SavingsError = "notNumber" | "negative";
export type DateError = "notNumber" | "dateNotLater" | "dateTooFar";

export type PlannerErrors = {
  price?: PriceError;
  savings?: SavingsError;
  date?: DateError;
};

/** Yearly growth rates shown in the what-if table, as decimals. */
export const WHAT_IF_RATES = [-0.1, 0, 0.05, 0.1, 0.15, 0.2];

export const MIN_OWN_RATE_PERCENT = -50;
export const MAX_OWN_RATE_PERCENT = 100;

export type Plan = {
  months: number;
  goalAmount: number;
  saved: number;
  /** Assumed yearly growth of the savings, as a decimal. */
  growth: number;
  monthlySaving: number;
};

export type GrowthRateResult =
  | { kind: "blank" }
  | { kind: "error"; error: "notNumber" | "outOfRange" }
  | { kind: "rate"; rate: number };

/** Reads a typed yearly rate in percent ("7.5", "7,5" or "10%") into a decimal. */
export function parseGrowthRate(text: string): GrowthRateResult {
  const cleaned = text
    .replace(/\s/g, "")
    .replace(/^−/, "-")
    .replace(/^−/, "-")
    .replace(/%$/, "")
    .replace(",", ".");
  if (cleaned === "") return { kind: "blank" };
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return { kind: "error", error: "notNumber" };
  }
  const percent = Number(cleaned);
  if (percent < MIN_OWN_RATE_PERCENT || percent > MAX_OWN_RATE_PERCENT) {
    return { kind: "error", error: "outOfRange" };
  }
  return { kind: "rate", rate: percent / 100 };
}

/** Monthly saving needed if the savings grow by `rate` a year. */
export function monthlyAtGrowth(
  plan: Pick<Plan, "months" | "goalAmount" | "saved">,
  rate: number,
): number {
  return monthlySavingNeeded({
    price: plan.goalAmount,
    months: plan.months,
    savings: plan.saved,
    yearlyReturn: rate,
    yearlyPriceGrowth: 0,
  });
}

/** No errors and no plan means the form is still waiting for a price or a date. */
export type PlannerResult = { errors: PlannerErrors; plan: Plan | null };

export type ParsedAmount =
  { kind: "blank" } | { kind: "invalid" } | { kind: "number"; value: number };

/** Reads a typed amount. Spaces and commas are allowed as thousands separators. */
export function parseAmount(text: string): ParsedAmount {
  const cleaned = text.replace(/[\s,]/g, "");
  if (cleaned === "") return { kind: "blank" };
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return { kind: "invalid" };
  return { kind: "number", value: Number(cleaned) };
}

export function monthsBetween(from: YearMonth, to: YearMonth): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function buildPlan(
  input: PlannerInput,
  today: YearMonth,
  growth = 0,
): PlannerResult {
  const errors: PlannerErrors = {};

  const price = parseAmount(input.price);
  if (price.kind === "invalid") errors.price = "notNumber";
  else if (price.kind === "number" && price.value < MIN_PRICE) {
    errors.price = "priceTooLow";
  } else if (price.kind === "number" && price.value > MAX_PRICE) {
    errors.price = "priceTooHigh";
  }

  const savings = parseAmount(input.savings);
  if (savings.kind === "invalid") errors.savings = "notNumber";
  else if (savings.kind === "number" && savings.value < 0) {
    errors.savings = "negative";
  }

  const month = Number(input.month);
  const yearText = input.year.trim();
  let months: number | null = null;
  if (input.month !== "" && yearText !== "") {
    if (!/^\d+$/.test(yearText) || !Number.isInteger(month)) {
      errors.date = "notNumber";
    } else if (yearText.length >= 4) {
      // Fewer than four digits means the year is still being typed: wait quietly.
      months = monthsBetween(today, { year: Number(yearText), month });
      if (months < 1) errors.date = "dateNotLater";
      else if (months > MAX_MONTHS) errors.date = "dateTooFar";
    }
  }

  if (
    Object.keys(errors).length > 0 ||
    price.kind !== "number" ||
    months === null
  ) {
    return { errors, plan: null };
  }

  const base = {
    months,
    goalAmount: price.value,
    saved: savings.kind === "number" ? savings.value : 0,
  };
  return {
    errors,
    plan: { ...base, growth, monthlySaving: monthlyAtGrowth(base, growth) },
  };
}
