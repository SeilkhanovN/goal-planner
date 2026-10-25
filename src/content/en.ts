export const en = {
  home: {
    headline: "Plan your purchase without a loan",
    intro:
      "Find out how much to save each month for a big purchase, instead of taking a loan.",
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
    savingsLabel: "Already saved (₸, optional)",
    savingsPlaceholder: "0",
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
        notNumber: "Enter a number, for example 8 850 000.",
        priceTooLow: "The price must be at least ₸10,000.",
        priceTooHigh: "The price can be at most ₸5bn.",
      },
      savings: {
        notNumber: "Enter a number, for example 1 000 000, or leave it blank.",
        negative: "Savings can't be negative.",
      },
      date: {
        notNumber: "Enter a four-digit year, for example 2028.",
        dateNotLater: "Choose a month after this one.",
        dateTooFar: "Choose a date within 30 years (360 months).",
      },
    },
    planTitle: "Your plan",
    planHint: "Enter a price and a date to see your plan.",
    goalByDate: (amount: string, date: string) =>
      `To reach ${amount} by ${date}`,
    saveMonthly: (amount: string) => `Save ${amount} a month`,
    alreadyCovered: "Your savings already cover the goal.",
    breakdown: (monthly: string, months: string, total: string) =>
      `${monthly} × ${months} ≈ ${total}`,
    breakdownWithSaved: (
      monthly: string,
      months: string,
      saved: string,
      total: string,
    ) => `${monthly} × ${months} + ${saved} already saved ≈ ${total}`,
    assumption:
      "This plan assumes no interest on your savings and no price rise. You simply set the money aside, in a bank account or even in cash.",
    assumptionGrowth: (rate: string) =>
      `This plan assumes your money grows by ${rate} a year, as an example. It assumes no price rise.`,
    paidIn: (monthly: string, months: string, total: string) =>
      `${monthly} × ${months} ≈ ${total} paid in`,
    paidInWithSaved: (
      monthly: string,
      months: string,
      total: string,
      saved: string,
    ) =>
      `${monthly} × ${months} ≈ ${total} paid in, plus ${saved} already saved`,
    growthCovers: (rate: string) =>
      `The assumed growth of ${rate} a year would cover the rest.`,
    lossCovered: (rate: string) =>
      `With an assumed loss of ${rate} a year, you need to save more to make up for it.`,
    whatIf: {
      title: "If your money grows by…",
      pickHint: "Pick a row to use it in your plan.",
      rowLabel: (rate: string) => `${rate} a year`,
      cashHint: "cash or a plain account",
      ownRowLabel: (rate: string) => `Your own rate: ${rate} a year`,
      ownRateLabel: "Your own yearly rate (%)",
      ownRatePlaceholder: "7.5",
      ownRateErrors: {
        notNumber: "Enter a number, for example 7.5.",
        outOfRange: "Enter a rate from −50 to 100.",
      },
      notForecast:
        "These percentages are examples, not forecasts. Nobody knows what any investment will earn, and real results can be lower, including losses.",
    },
    loading: "Loading…",
  },
};
