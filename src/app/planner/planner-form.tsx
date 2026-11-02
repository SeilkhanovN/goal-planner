"use client";

import { type ReactNode, use, useState } from "react";
import { io } from "next/cache";
import { en as text } from "@/content/en";
import { loanCost } from "@/lib/engine/loan";
import {
  formatMonthly,
  formatPercent,
  formatShare,
  formatSigned,
  formatTotal,
  groupDigits,
} from "@/lib/planner/format";
import { DEFAULT_LOAN_RATE, parseLoanRate } from "@/lib/planner/loan";
import {
  addMonths,
  budgetCheck,
  budgetFixes,
  buildBudgetPlan,
  buildPlan,
  dateIsBlank,
  growthAdded,
  monthlyAtGrowth,
  monthsToGoal,
  type Plan,
  type YearMonth,
  parseBudget,
  parseGrowthRate,
  WHAT_IF_RATES,
  yearOptions,
} from "@/lib/planner/plan";

const { planner } = text;

const inputClass =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

const fixButtonClass =
  "rounded-lg border border-zinc-300 px-3 py-2 hover:bg-foreground/5 dark:border-zinc-700";

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

function LoanCard({
  plan,
  rateText,
  onRateText,
}: {
  plan: Plan;
  rateText: string;
  onRateText: (text: string) => void;
}) {
  const { loan } = planner;
  const parsed = parseLoanRate(rateText);
  const rateError = parsed.kind === "error" && loan.rateErrors[parsed.error];
  const cost =
    parsed.kind === "rate"
      ? loanCost({
          price: plan.goalAmount,
          downPayment: plan.saved,
          months: plan.months,
          yearlyRate: parsed.rate,
        })
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
      <h3 className="text-lg font-semibold">{loan.title}</h3>
      {cost && cost.loanAmount === 0 && (
        <p className="text-zinc-600 dark:text-zinc-400">{loan.noLoanNeeded}</p>
      )}
      {cost && parsed.kind === "rate" && cost.loanAmount > 0 && (
        <>
          <p className="text-zinc-600 dark:text-zinc-400">
            {loan.loanLine(
              formatTotal(cost.loanAmount),
              planner.monthsAway(plan.months),
              formatPercent(parsed.rate),
            )}
          </p>
          <p className="text-xl font-semibold">
            {loan.payment(formatMonthly(cost.monthlyPayment))}
          </p>
          {parsed.rate === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              {loan.noInterest}
            </p>
          ) : (
            <>
              <p>{loan.interest(formatTotal(cost.totalInterest))}</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                {loan.compare(
                  formatMonthly(plan.monthlySaving),
                  formatTotal(cost.totalInterest),
                )}
              </p>
            </>
          )}
        </>
      )}
      <div>
        <label htmlFor="loan-rate" className="mb-1 block font-medium">
          {loan.rateLabel}
        </label>
        <input
          id="loan-rate"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`${inputClass} w-40`}
          placeholder={loan.ratePlaceholder}
          value={rateText}
          onChange={(event) => onRateText(event.target.value)}
          aria-invalid={rateError ? true : undefined}
          aria-describedby={rateError ? "loan-rate-error" : undefined}
        />
        <FieldError id="loan-rate-error" message={rateError || undefined} />
      </div>
    </div>
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

  const [goalId, setGoalId] = useState<string>(planner.goals[0].id);
  const goal =
    planner.goals.find((item) => item.id === goalId) ?? planner.goals[0];

  const [price, setPrice] = useState("");
  const [savings, setSavings] = useState("");
  const [budgetText, setBudgetText] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [loanRateText, setLoanRateText] = useState(
    String(DEFAULT_LOAN_RATE * 100),
  );

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

  const budget = parseBudget(budgetText);
  const budgetError =
    budget.kind === "error" && planner.errors.budget[budget.error];
  const check =
    plan && budget.kind === "budget"
      ? budgetCheck(plan, growth, budget.value)
      : null;
  const fixes =
    plan && check?.kind === "short" && budget.kind === "budget"
      ? budgetFixes(plan, growth, budget.value, today)
      : null;
  const buyLater = fixes?.buyLater ?? null;
  const dateText = (date: YearMonth) =>
    `${planner.monthNames[date.month - 1]} ${date.year}`;

  const budgetPlan =
    budget.kind === "budget" && dateIsBlank(month, year)
      ? buildBudgetPlan({ price, savings }, budget.value)
      : null;
  const budgetMonths = budgetPlan ? monthsToGoal(budgetPlan, growth) : null;

  // The growth table, shared by both views; `renderRow` fills in each row.
  const whatIfSection = (
    renderRow: (rate: number, label: string) => ReactNode,
  ) => (
    <>
      <h3 className="mt-4 text-lg font-semibold">{planner.whatIf.title}</h3>
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
              {renderRow(
                rate,
                planner.whatIf.rowLabel(formatPercent(rate)) +
                  (rate === 0 ? ` (${planner.whatIf.cashHint})` : ""),
              )}
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
              {renderRow(
                ownRate,
                planner.whatIf.ownRowLabel(formatPercent(ownRate)),
              )}
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
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <div role="group" aria-labelledby="goal-type-label">
          <p id="goal-type-label" className="mb-1 font-medium">
            {planner.goalTypeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {planner.goals.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === goalId}
                onClick={() => setGoalId(item.id)}
                className={`rounded-lg border px-3 py-2 ${
                  item.id === goalId
                    ? "border-foreground bg-foreground/10"
                    : "border-zinc-300 hover:bg-foreground/5 dark:border-zinc-700"
                }`}
              >
                {item.button}
              </button>
            ))}
          </div>
        </div>

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

        <div>
          <label htmlFor="budget" className="mb-1 block font-medium">
            {planner.budgetLabel}
          </label>
          <input
            id="budget"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={`${inputClass} w-full`}
            placeholder={planner.budgetPlaceholder}
            value={budgetText}
            onChange={(event) => setBudgetText(groupDigits(event.target.value))}
            aria-invalid={budgetError ? true : undefined}
            aria-describedby={budgetError ? "budget-error" : undefined}
          />
          <FieldError id="budget-error" message={budgetError || undefined} />
        </div>
      </form>

      <section aria-live="polite" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{planner.planTitle}</h2>
        {plan ? (
          <>
            <p className="text-zinc-600 dark:text-zinc-400">
              {planner.goalByDate(
                formatTotal(plan.goalAmount),
                goal.forPhrase,
                `${planner.monthNames[Number(month) - 1]} ${year.trim()}`,
              )}
            </p>
            <p className="text-3xl font-semibold tracking-tight">
              {planner.saveMonthly(formatMonthly(plan.monthlySaving))}
            </p>
            {check && (
              <p
                className={`font-medium ${
                  check.kind === "short"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-700 dark:text-green-400"
                }`}
              >
                {check.kind === "short"
                  ? planner.budgetCheck.shortBy(
                      formatTotal(check.shortBy),
                      `${planner.monthNames[Number(month) - 1]} ${year.trim()}`,
                    )
                  : check.surplus !== undefined
                    ? planner.budgetCheck.onTrackSpare(
                        formatTotal(check.surplus),
                      )
                    : planner.budgetCheck.onTrack}
              </p>
            )}
            {fixes && (
              <div className="flex flex-col gap-3">
                <p className="text-zinc-600 dark:text-zinc-400">
                  {buyLater
                    ? planner.budgetCheck.reachBy(dateText(buyLater.date))
                    : planner.budgetCheck.neverReached}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={fixButtonClass}
                    onClick={() =>
                      setBudgetText(groupDigits(String(fixes.saveMore)))
                    }
                  >
                    {planner.budgetCheck.saveMore(
                      formatMonthly(fixes.saveMore),
                    )}
                  </button>
                  {buyLater && (
                    <button
                      type="button"
                      className={fixButtonClass}
                      onClick={() => {
                        setMonth(String(buyLater.date.month));
                        setYear(String(buyLater.date.year));
                      }}
                    >
                      {planner.budgetCheck.buyLater(dateText(buyLater.date))}
                    </button>
                  )}
                  {fixes.aimFor !== null && (
                    <button
                      type="button"
                      className={fixButtonClass}
                      onClick={() =>
                        setPrice(groupDigits(String(fixes.aimFor)))
                      }
                    >
                      {planner.budgetCheck.aimFor(formatTotal(fixes.aimFor))}
                    </button>
                  )}
                </div>
              </div>
            )}
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

            <LoanCard
              plan={plan}
              rateText={loanRateText}
              onRateText={setLoanRateText}
            />
            {whatIfSection((rate, label) => (
              <RowText label={label} plan={plan} rate={rate} />
            ))}
          </>
        ) : budgetPlan ? (
          <>
            <p className="text-3xl font-semibold tracking-tight">
              {budgetMonths === null
                ? planner.budgetCheck.neverReached
                : budgetMonths === 0
                  ? planner.budgetMode.canBuyNow
                  : planner.budgetMode.canBuyIn(
                      dateText(addMonths(today, budgetMonths)),
                    )}
            </p>
            {budgetMonths !== null && budgetMonths > 0 && (
              <>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {planner.budgetMode.saving(
                    formatMonthly(budgetPlan.budget),
                    planner.monthsAway(budgetMonths),
                  )}
                </p>
                <div>
                  <button
                    type="button"
                    className={fixButtonClass}
                    onClick={() => {
                      const date = addMonths(today, budgetMonths);
                      setMonth(String(date.month));
                      setYear(String(date.year));
                    }}
                  >
                    {planner.budgetMode.useDate}
                  </button>
                </div>
              </>
            )}
            {whatIfSection((rate, label) => {
              const months = monthsToGoal(budgetPlan, rate);
              return (
                <>
                  <span>{label}</span>
                  <span className="font-medium">
                    {months === null
                      ? planner.budgetMode.notWithin
                      : months === 0
                        ? planner.budgetMode.now
                        : dateText(addMonths(today, months))}
                  </span>
                </>
              );
            })}
          </>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">{planner.planHint}</p>
        )}
        {(plan || budgetPlan) && (
          <div className="mt-2 flex flex-col gap-1 border-t border-zinc-300 pt-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            <p className="font-medium">{planner.disclaimer.notAdvice}</p>
            <p>{planner.disclaimer.illustrations}</p>
          </div>
        )}
      </section>
    </div>
  );
}
