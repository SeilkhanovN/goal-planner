export const en = {
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
    loading: "Loading…",
  },
};
