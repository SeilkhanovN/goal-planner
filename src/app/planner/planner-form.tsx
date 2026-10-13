"use client";

import { use, useState } from "react";
import { io } from "next/cache";
import { en as text } from "@/content/en";
import { formatMonthly, formatTotal } from "@/lib/planner/format";
import { buildPlan } from "@/lib/planner/plan";

const { planner } = text;

const inputClass =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

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

  const { errors, plan } = buildPlan({ price, savings, month, year }, today);

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
            onChange={(event) => setPrice(event.target.value)}
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
            <input
              id="year"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label={planner.yearAriaLabel}
              className={`${inputClass} w-28`}
              placeholder={planner.yearPlaceholder}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? "date-error" : undefined}
            />
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
            onChange={(event) => setSavings(event.target.value)}
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
            <p className="text-zinc-600 dark:text-zinc-400">
              {plan.monthlySaving === 0
                ? planner.alreadyCovered
                : plan.saved > 0
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
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {planner.assumption}
            </p>
          </>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">{planner.planHint}</p>
        )}
      </section>
    </div>
  );
}
