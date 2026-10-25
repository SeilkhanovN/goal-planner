"use client";

import { use, useState } from "react";
import { io } from "next/cache";
import { en as text } from "@/content/en";
import {
  formatMonthly,
  formatPercent,
  formatShare,
  formatSigned,
  formatTotal,
  groupDigits,
} from "@/lib/planner/format";
import {
  buildPlan,
  growthAdded,
  monthlyAtGrowth,
  type Plan,
  parseGrowthRate,
  WHAT_IF_RATES,
  yearOptions,
} from "@/lib/planner/plan";

const { planner } = text;

const inputClass =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

function rowClass(selected: boolean): string {
  return `flex w-full items-center justify-between gap-4 rounded-lg border px-3 py-2 text-left ${
    selected
      ? "border-foreground bg-foreground/10"
      : "border-zinc-300 hover:bg-foreground/5 dark:border-zinc-700"
  }`;
}

function RowText({
  label,
  plan,
  rate,
}: {
  label: string;
  plan: Plan;
  rate: number;
}) {
  const growth = growthAdded(plan, rate);
  return (
    <>
      <span className="flex flex-col">
        <span>{label}</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {planner.whatIf.growthLine(
            formatSigned(growth),
            formatShare(growth / plan.goalAmount),
          )}
        </span>
      </span>
      <span className="font-medium">
        {formatMonthly(monthlyAtGrowth(plan, rate))}
      </span>
    </>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

export function PlannerForm() {
  // Today's date can't be read while the site is built, so wait for the browser.
  use(io());
  const now = new Date();
  const today = { year: now.getFullYear(), month: now.getMonth() + 1 };

  const [price, setPrice] = useState("");
  const [savings, setSavings] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [ownText, setOwnText] = useState("");
  const [ownSelected, setOwnSelected] = useState(false);

  const own = parseGrowthRate(ownText);
  const ownRate = own.kind === "rate" ? own.rate : null;
  const useOwn = ownSelected && ownRate !== null;
  const growth = useOwn ? ownRate : selectedPreset;
  const ownError =
    own.kind === "error" && planner.whatIf.ownRateErrors[own.error];

  const { errors, plan } = buildPlan(
    { price, savings, month, year },
    today,
    growth,
  );

  const priceError = errors.price && planner.errors.price[errors.price];
  const savingsError = errors.savings && planner.errors.savings[errors.savings];
  const dateError = errors.date && planner.errors.date[errors.date];

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <div>
          <label htmlFor="price" className="mb-1 block font-medium">
            {planner.priceLabel}
          </label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={`${inputClass} w-full`}
            placeholder={planner.pricePlaceholder}
            value={price}
            onChange={(event) => setPrice(groupDigits(event.target.value))}
            aria-invalid={priceError ? true : undefined}
            aria-describedby={priceError ? "price-error" : undefined}
          />
          <FieldError id="price-error" message={priceError} />
        </div>

        <div>
          <label htmlFor="month" className="mb-1 block font-medium">
            {planner.dateLabel}
          </label>
          <div className="flex gap-3">
            <select
              id="month"
              aria-label={planner.monthAriaLabel}
              className={`${inputClass} min-w-0 flex-1`}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? "date-error" : undefined}
            >
              <option value="" className="bg-background text-foreground">
                {planner.monthPlaceholder}
              </option>
              {planner.monthNames.map((name, index) => (
                <option
                  key={name}
                  value={index + 1}
                  className="bg-background text-foreground"
                >
                  {name}
                </option>
              ))}
            </select>
            <select
              id="year"
              aria-label={planner.yearAriaLabel}
              className={`${inputClass} w-32`}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? "date-error" : undefined}
            >
              <option value="" className="bg-background text-foreground">
                {planner.yearPlaceholder}
              </option>
              {yearOptions(today.year).map((option) => (
                <option
                  key={option}
                  value={option}
                  className="bg-background text-foreground"
                >
                  {option}
                </option>
              ))}
            </select>
          </div>
          <FieldError id="date-error" message={dateError} />
          {plan && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {planner.monthsAway(plan.months)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="savings" className="mb-1 block font-medium">
            {planner.savingsLabel}
          </label>
          <input
            id="savings"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={`${inputClass} w-full`}
            placeholder={planner.savingsPlaceholder}
            value={savings}
            onChange={(event) => setSavings(groupDigits(event.target.value))}
            aria-invalid={savingsError ? true : undefined}
            aria-describedby={savingsError ? "savings-error" : undefined}
          />
          <FieldError id="savings-error" message={savingsError} />
        </div>
      </form>

      <section aria-live="polite" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{planner.planTitle}</h2>
        {plan ? (
          <>
            <p className="text-zinc-600 dark:text-zinc-400">
              {planner.goalByDate(
                formatTotal(plan.goalAmount),
                `${planner.monthNames[Number(month) - 1]} ${year.trim()}`,
              )}
            </p>
            <p className="text-3xl font-semibold tracking-tight">
              {planner.saveMonthly(formatMonthly(plan.monthlySaving))}
            </p>
            {plan.monthlySaving === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                {planner.alreadyCovered}
              </p>
            ) : plan.growth === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                {plan.saved > 0
                  ? planner.breakdownWithSaved(
                      formatMonthly(plan.monthlySaving),
                      planner.monthsAway(plan.months),
                      formatTotal(plan.saved),
                      formatTotal(plan.goalAmount),
                    )
                  : planner.breakdown(
                      formatMonthly(plan.monthlySaving),
                      planner.monthsAway(plan.months),
                      formatTotal(plan.goalAmount),
                    )}
              </p>
            ) : (
              <>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {plan.saved > 0
                    ? planner.paidInWithSaved(
                        formatMonthly(plan.monthlySaving),
                        planner.monthsAway(plan.months),
                        formatTotal(plan.monthlySaving * plan.months),
                        formatTotal(plan.saved),
                      )
                    : planner.paidIn(
                        formatMonthly(plan.monthlySaving),
                        planner.monthsAway(plan.months),
                        formatTotal(plan.monthlySaving * plan.months),
                      )}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {planner.whatIf.growthLine(
                    formatSigned(growthAdded(plan, plan.growth)),
                    formatShare(
                      growthAdded(plan, plan.growth) / plan.goalAmount,
                    ),
                  )}
                </p>
              </>
            )}

            <h3 className="mt-4 text-lg font-semibold">
              {planner.whatIf.title}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {planner.whatIf.pickHint}
            </p>
            <ul className="flex flex-col gap-2">
              {WHAT_IF_RATES.map((rate) => (
                <li key={rate}>
                  <button
                    type="button"
                    aria-pressed={!useOwn && rate === selectedPreset}
                    onClick={() => {
                      setSelectedPreset(rate);
                      setOwnSelected(false);
                    }}
                    className={rowClass(!useOwn && rate === selectedPreset)}
                  >
                    <RowText
                      label={
                        planner.whatIf.rowLabel(formatPercent(rate)) +
                        (rate === 0 ? ` (${planner.whatIf.cashHint})` : "")
                      }
                      plan={plan}
                      rate={rate}
                    />
                  </button>
                </li>
              ))}
              {ownRate !== null && (
                <li>
                  <button
                    type="button"
                    aria-pressed={useOwn}
                    onClick={() => setOwnSelected(true)}
                    className={rowClass(useOwn)}
                  >
                    <RowText
                      label={planner.whatIf.ownRowLabel(formatPercent(ownRate))}
                      plan={plan}
                      rate={ownRate}
                    />
                  </button>
                </li>
              )}
            </ul>
            <div>
              <label htmlFor="own-rate" className="mb-1 block font-medium">
                {planner.whatIf.ownRateLabel}
              </label>
              <input
                id="own-rate"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                className={`${inputClass} w-40`}
                placeholder={planner.whatIf.ownRatePlaceholder}
                value={ownText}
                onChange={(event) => {
                  setOwnText(event.target.value);
                  if (parseGrowthRate(event.target.value).kind === "rate") {
                    setOwnSelected(true);
                  }
                }}
                aria-invalid={ownError ? true : undefined}
                aria-describedby={ownError ? "own-rate-error" : undefined}
              />
              <FieldError id="own-rate-error" message={ownError || undefined} />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {planner.whatIf.notForecast}
            </p>
          </>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">{planner.planHint}</p>
        )}
      </section>
    </div>
  );
}
