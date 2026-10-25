const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function roundToThousand(amount: number): number {
  return Math.round(amount / 1000) * 1000;
}

/** A yearly rate as a percentage with a proper minus sign, such as −10% or 7.5%. */
export function formatPercent(rate: number): string {
  const percent = Math.round(rate * 10_000) / 100;
  return `${percent < 0 ? "−" : ""}${Math.abs(percent)}%`;
}

/** A monthly amount in full, rounded to the nearest ₸1,000. */
export function formatMonthly(amount: number): string {
  return `₸${grouped.format(roundToThousand(amount))}`;
}

/** A larger total: millions as ₸9.93m, billions as ₸2.50bn, otherwise nearest ₸1,000. */
export function formatTotal(amount: number): string {
  const rounded = roundToThousand(amount);
  if (rounded >= 1e9) return `₸${(amount / 1e9).toFixed(2)}bn`;
  if (rounded >= 1e6) return `₸${(amount / 1e6).toFixed(2)}m`;
  return `₸${grouped.format(rounded)}`;
}
