export const en = {
  home: {
    headline: "Plan your purchase without a loan",
    intro: "See how much to save each month instead of taking a loan.",
    start: "Start planning",
  },
  planner: {
    title: "Plan your goal",
    goalTypeLabel: "What are you saving for?",
    goals: [
      { id: "car", button: "Car", forPhrase: "the car" },
      { id: "hajj", button: "Hajj or Umrah", forPhrase: "Hajj or Umrah" },
      { id: "wedding", button: "Wedding", forPhrase: "the wedding" },
      { id: "home", button: "Home deposit", forPhrase: "the home deposit" },
      { id: "education", button: "Education", forPhrase: "education" },
      {
        id: "emergency",
        button: "Emergency fund",
        forPhrase: "the emergency fund",
      },
      { id: "other", button: "Other", forPhrase: "your goal" },
    ],
    priceLabel: "Price today (₸)",
    pricePlaceholder: "8 850 000",
    dateLabel: "When to buy",
    monthPlaceholder: "Month",
    monthAriaLabel: "Month",
    yearPlaceholder: "Year",
    yearAriaLabel: "Year",
    savingsLabel: "Already saved (₸)",
    savingsPlaceholder: "Optional",
    budgetLabel: "Monthly budget (₸)",
    budgetPlaceholder: "Optional",
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
      budget: {
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
    planHint: "Enter a price and a date, or a monthly budget.",
    budgetMode: {
      canBuyIn: (date: string) => `You can buy in ${date}`,
      canBuyNow: "Your savings already cover the goal. You can buy now.",
      saving: (amount: string, months: string) =>
        `Saving ${amount} a month for ${months}.`,
      now: "Now",
      useDate: "Use this date",
      notWithin: "Not within 30 years",
    },
    goalByDate: (amount: string, goal: string, date: string) =>
      `To reach ${amount} for ${goal} by ${date}`,
    saveMonthly: (amount: string) => `Save ${amount} a month`,
    alreadyCovered: "Savings already cover the goal.",
    budgetCheck: {
      onTrack: "On track.",
      onTrackSpare: (amount: string) => `On track, with ${amount} to spare.`,
      shortBy: (amount: string, date: string) =>
        `Short by ${amount} by ${date}.`,
      reachBy: (date: string) => `On this budget you'd reach it in ${date}.`,
      neverReached: "On this budget the goal isn't reached within 30 years.",
      saveMore: (amount: string) => `Save ${amount}`,
      buyLater: (date: string) => `Buy in ${date}`,
      aimFor: (amount: string) => `Aim for ${amount}`,
    },
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
      notForecast: "These rates are examples. Prices are assumed not to rise.",
    },
    loan: {
      title: "If you bought today with a loan",
      loanLine: (amount: string, months: string, rate: string) =>
        `Loan of ${amount} over ${months} at ${rate} a year`,
      payment: (amount: string) => `About ${amount} a month`,
      interest: (amount: string) =>
        `A loan would cost ${amount} more in interest (riba).`,
      noInterest: "At 0% a loan adds no interest.",
      compare: (monthly: string, interest: string) =>
        `Saving instead: ${monthly} a month, and the ${interest} stays with you.`,
      noLoanNeeded: "No loan needed. Your savings cover the price.",
      rateLabel: "Loan rate (%)",
      ratePlaceholder: "25",
      rateErrors: {
        notNumber: "Enter a number, like 25.",
        outOfRange: "Use 0 to 100.",
      },
    },
    disclaimer: {
      notAdvice: "Information, not investment advice or a fatwa",
      illustrations:
        "These figures are illustrations, not forecasts. Real results can be lower, including losses.",
    },
    howLink: "How we calculate",
    loading: "Loading…",
  },
  howWeCalculate: {
    title: "How we calculate",
    backToPlanner: "Back to the planner",
    sections: [
      {
        id: "idea",
        heading: "The idea",
        paragraphs: [
          "The monthly amount is what you put aside at the end of each month so that, on your date, you have the price.",
        ],
      },
      {
        id: "example",
        heading: "An example",
        paragraphs: [
          "Say a goal costs ₸10,000,000 and you want it in 20 months, with nothing saved yet.",
          "With no growth, you save ₸10,000,000 ÷ 20 = ₸500,000 a month.",
          "If your money grows by 10% a year, you need about ₸463,000 a month. The growth does part of the work: about ₸736,000 of the ₸10,000,000 comes from growth, and the rest from your deposits.",
        ],
      },
      {
        id: "inputs",
        heading: "What goes in",
        paragraphs: [
          "The price today, the months until your date, what you have already saved and the yearly growth you assume.",
          "Money already saved grows from the start. Each deposit is made at the end of a month and grows from then on. Growth is spread evenly over the months, so 10% a year is a little under 0.8% a month.",
          "Prices are assumed not to rise, so the goal stays the same amount until your date.",
        ],
      },
      {
        id: "growth",
        heading: "The growth table",
        paragraphs: [
          "The rows show how the monthly amount changes at different yearly growth rates, from −10% to 20%, and you can add your own. They are examples to compare, not forecasts. Real results can be lower, including losses.",
        ],
      },
      {
        id: "budget",
        heading: "Your monthly budget",
        paragraphs: [
          "If you enter a budget, we compare it with the monthly amount. If it is smaller, the gap is how much would be missing on your date when you save only your budget each month.",
          "The earliest month is the first month in which your budget, saved every month, reaches the price. Leave the date empty and we show that month.",
        ],
      },
      {
        id: "loan",
        heading: "The loan comparison",
        paragraphs: [
          "The loan card shows what buying today with a bank loan would cost. Your savings are the down payment, and the rest is borrowed over the same number of months. The bank is paid back in equal monthly payments, and the interest is everything paid back above the amount borrowed.",
          "For ₸10,000,000 over 20 months at 25% a year, that is about ₸604,000 a month and ₸2.09m of interest (riba).",
          "The 25% is a placeholder until real bank offers are collected. It is an effective yearly rate: the cost over a full year, including compounding. A bank may quote a different rate for the same loan, so a real payment can differ.",
        ],
      },
    ],
  },
};
