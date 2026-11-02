import { parseGrowthRate } from "./plan";

/**
 * Placeholder yearly loan rate until real bank offers are collected.
 * This is the only place the number lives.
 */
export const DEFAULT_LOAN_RATE = 0.25;

export type LoanRateResult =
  | { kind: "rate"; rate: number }
  | { kind: "error"; error: "notNumber" | "outOfRange" };

/** Reads the typed loan rate in percent. Blank means the default; 0 to 100 is allowed. */
export function parseLoanRate(text: string): LoanRateResult {
  const parsed = parseGrowthRate(text);
  if (parsed.kind === "blank") return { kind: "rate", rate: DEFAULT_LOAN_RATE };
  if (parsed.kind === "error") return parsed;
  if (parsed.rate < 0) return { kind: "error", error: "outOfRange" };
  return parsed;
}
