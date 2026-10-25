export const en = {
  home: {
    headline: "Plan your purchase without a loan",
    intro: "See how much to save each month instead of taking a loan.",
    start: "Start planning",
  },
  planner: {
    title: "Plan your goal",
    priceLabel: "Price today (₸)",
    pricePlaceholder: "8 850 000",
    dateLabel: "When to buy",
    monthPlaceholder: "Month",
    monthAriaLabel: "Month",
    yearPlaceholder: "Year",
    yearAriaLabel: "Year",
    savingsLabel: "Already saved (₸)",
    savingsPlaceholder: "Optional",
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    monthsAway: (count: number) =>
      count === 1 ? "1 month" : `${count} months`,
    errors: {
      price: {
        notNumber: "Enter a number.",
        priceTooLow: "Minimum ₸10,000.",
        priceTooHigh: "Maximum ₸5bn.",
      },
      savings: {
        notNumber: "Enter a number or leave blank.",
        negative: "Can't be negative.",
      },
      date: {
        notNumber: "Pick a year.",
        dateNotLater: "Pick a later month.",
        dateTooFar: "Within 30 years only.",
      },
    },
    planTitle: "Your plan",
    planHint: "Enter a price and a date.",
    goalByDate: (amount: string, date: string) =>
      `To reach ${amount} by ${date}`,
    saveMonthly: (amount: string) => `Save ${amount} a month`,
    alreadyCovered: "Savings already cover the goal.",
    breakdown: (monthly: string, months: string, total: string) =>
      `${monthly} × ${months} ≈ ${total}`,
    breakdownWithSaved: (
      monthly: string,
      months: string,
      saved: string,
      total: string,
    ) => `${monthly} × ${months} + ${saved} saved ≈ ${total}`,
    paidIn: (monthly: string, months: string, total: string) =>
      `${monthly} × ${months} ≈ ${total} paid in`,
    paidInWithSaved: (
      monthly: string,
      months: string,
      total: string,
      saved: string,
    ) => `${monthly} × ${months} ≈ ${total} paid in, plus ${saved} saved`,
    whatIf: {
      title: "If your money grows by…",
      pickHint: "Pick one for your plan.",
      rowLabel: (rate: string) => `${rate} a year`,
      cashHint: "plain saving",
      growthLine: (amount: string, share: string) =>
        `Growth: ${amount} (${share})`,
      ownRowLabel: (rate: string) => `Your own rate: ${rate} a year`,
      ownRateLabel: "Your own rate (%)",
      ownRatePlaceholder: "7.5",
      ownRateErrors: {
        notNumber: "Enter a number, like 7.5.",
        outOfRange: "Use −50 to 100.",
      },
      notForecast:
        "These rates are examples, not forecasts. Real results can be lower, even losses. Prices are assumed not to rise.",
    },
    loading: "Loading…",
  },
};
