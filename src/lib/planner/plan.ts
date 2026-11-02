import { monthlySavingNeeded, toMonthlyRate } from "../engine/savings";

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

export type BudgetResult =
  | { kind: "none" }
  | { kind: "error"; error: "notNumber" | "negative" }
  | { kind: "budget"; value: number };

/** Reads the monthly budget. Blank or 0 means no budget, so no check is shown. */
export function parseBudget(text: string): BudgetResult {
  const amount = parseAmount(text);
  if (amount.kind === "blank") return { kind: "none" };
  if (amount.kind === "invalid") return { kind: "error", error: "notNumber" };
  if (amount.value < 0) return { kind: "error", error: "negative" };
  if (amount.value === 0) return { kind: "none" };
  return { kind: "budget", value: amount.value };
}

export type BudgetCheck =
  { kind: "onTrack"; surplus?: number } | { kind: "short"; shortBy: number };

/** Gaps and surpluses below this show as ₸0, so they are not reported. */
const MIN_REPORTED_AMOUNT = 500;

/** What a deposit of 1 a month, made for `months` months, grows to by the end. */
function depositsGrowth(months: number, rate: number): number {
  const monthlyRate = toMonthlyRate(rate);
  return monthlyRate === 0
    ? months
    : ((1 + monthlyRate) ** months - 1) / monthlyRate;
}

/**
 * Compares a monthly budget with the plan at growth `rate`. `shortBy` is the gap
 * on the purchase date if only the budget is saved each month. `surplus` is
 * what the savings alone exceed the goal by, and only appears when they cover it.
 */
export function budgetCheck(
  plan: Pick<Plan, "months" | "goalAmount" | "saved">,
  rate: number,
  budget: number,
): BudgetCheck {
  const monthly = monthlyAtGrowth(plan, rate);
  const monthlyRate = toMonthlyRate(rate);
  if (monthly === 0) {
    const savedAtDate = plan.saved * (1 + monthlyRate) ** plan.months;
    const surplus = savedAtDate - plan.goalAmount;
    return surplus >= MIN_REPORTED_AMOUNT
      ? { kind: "onTrack", surplus }
      : { kind: "onTrack" };
  }
  const shortBy = (monthly - budget) * depositsGrowth(plan.months, rate);
  return shortBy >= MIN_REPORTED_AMOUNT
    ? { kind: "short", shortBy }
    : { kind: "onTrack" };
}

/** The month `count` months after `from`. */
export function addMonths(from: YearMonth, count: number): YearMonth {
  const total = from.year * 12 + (from.month - 1) + count;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export type BudgetFixes = {
  /** Monthly amount, rounded up to ₸1,000, that makes the plan on track. */
  saveMore: number;
  /** Earliest purchase month on this budget, or null if not within 360 months. */
  buyLater: { months: number; date: YearMonth } | null;
  /** Highest price, rounded down to ₸1,000, the budget reaches by the date. Null when out of reach or below the minimum price. */
  aimFor: number | null;
};

/**
 * Ways to get a short plan on track: save more, buy later, or aim lower. When
 * the goal is not reachable within 360 months only `saveMore` is offered.
 */
export function budgetFixes(
  plan: Pick<Plan, "months" | "goalAmount" | "saved">,
  rate: number,
  budget: number,
  today: YearMonth,
): BudgetFixes {
  const saveMore = Math.ceil(monthlyAtGrowth(plan, rate) / 1000) * 1000;

  let buyLater: BudgetFixes["buyLater"] = null;
  for (let months = plan.months + 1; months <= MAX_MONTHS; months++) {
    if (budgetCheck({ ...plan, months }, rate, budget).kind === "onTrack") {
      buyLater = { months, date: addMonths(today, months) };
      break;
    }
  }
  if (buyLater === null) return { saveMore, buyLater, aimFor: null };

  const reachable =
    plan.saved * (1 + toMonthlyRate(rate)) ** plan.months +
    budget * depositsGrowth(plan.months, rate);
  const aim = Math.floor(reachable / 1000) * 1000;
  return { saveMore, buyLater, aimFor: aim >= MIN_PRICE ? aim : null };
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

/** How much of the goal the growth covers: goal minus savings minus what is paid in. */
export function growthAdded(
  plan: Pick<Plan, "months" | "goalAmount" | "saved">,
  rate: number,
): number {
  if (rate === 0 || plan.saved >= plan.goalAmount) return 0;
  return (
    plan.goalAmount - plan.saved - monthlyAtGrowth(plan, rate) * plan.months
  );
}

/** This year and the next 30, the most the planner can look ahead. */
export function yearOptions(thisYear: number): number[] {
  return Array.from({ length: MAX_MONTHS / 12 + 1 }, (_, i) => thisYear + i);
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
