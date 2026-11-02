import { describe, expect, it } from "vitest";
import { en } from "./en";

describe("budget check texts", () => {
  it("words each outcome", () => {
    const { budgetCheck } = en.planner;
    expect(budgetCheck.onTrack).toBe("On track.");
    expect(budgetCheck.onTrackSpare("₸1.15m")).toBe(
      "On track, with ₸1.15m to spare.",
    );
    expect(budgetCheck.shortBy("₸651,000", "April 2028")).toBe(
      "Short by ₸651,000 by April 2028.",
    );
    expect(budgetCheck.reachBy("June 2028")).toBe(
      "On this budget you'd reach it in June 2028.",
    );
    expect(budgetCheck.neverReached).toBe(
      "On this budget the goal isn't reached within 30 years.",
    );
    expect(budgetCheck.saveMore("₸437,000")).toBe("Save ₸437,000");
    expect(budgetCheck.buyLater("June 2028")).toBe("Buy in June 2028");
    expect(budgetCheck.aimFor("₸8.20m")).toBe("Aim for ₸8.20m");
  });
});

describe("budget mode texts", () => {
  it("words each outcome", () => {
    const { budgetMode } = en.planner;
    expect(budgetMode.canBuyIn("June 2028")).toBe("You can buy in June 2028");
    expect(budgetMode.canBuyNow).toBe(
      "Your savings already cover the goal. You can buy now.",
    );
    expect(budgetMode.saving("₸400,000", "20 months")).toBe(
      "Saving ₸400,000 a month for 20 months.",
    );
    expect(budgetMode.useDate).toBe("Use this date");
    expect(budgetMode.notWithin).toBe("Not within 30 years");
    expect(en.planner.planHint).toBe(
      "Enter a price and a date, or a monthly budget.",
    );
  });
});

describe("loan card texts", () => {
  it("words each part respectfully", () => {
    const { loan } = en.planner;
    expect(loan.title).toBe("If you bought today with a loan");
    expect(loan.loanLine("₸7.85m", "18 months", "25%")).toBe(
      "Loan of ₸7.85m over 18 months at 25% a year",
    );
    expect(loan.payment("₸518,000")).toBe("About ₸518,000 a month");
    expect(loan.interest("₸1.47m")).toBe(
      "A loan would cost ₸1.47m more in interest (riba).",
    );
    expect(loan.noInterest).toBe("At 0% a loan adds no interest.");
    expect(loan.compare("₸436,000", "₸1.47m")).toBe(
      "Saving instead: ₸436,000 a month, and the ₸1.47m stays with you.",
    );
    expect(loan.noLoanNeeded).toBe(
      "No loan needed. Your savings cover the price.",
    );
  });
});

describe("goal types", () => {
  it("has the seven goals, car first", () => {
    expect(en.planner.goals.map((goal) => goal.id)).toEqual([
      "car",
      "hajj",
      "wedding",
      "home",
      "education",
      "emergency",
      "other",
    ]);
  });

  it("words the plan for each goal", () => {
    const [car, , wedding] = en.planner.goals;
    expect(en.planner.goalByDate("₸8.85m", car.forPhrase, "April 2028")).toBe(
      "To reach ₸8.85m for the car by April 2028",
    );
    expect(
      en.planner.goalByDate("₸8.85m", wedding.forPhrase, "April 2028"),
    ).toBe("To reach ₸8.85m for the wedding by April 2028");
  });
});

describe("disclaimer", () => {
  it("has the two required sentences", () => {
    expect(en.planner.disclaimer.notAdvice).toBe(
      "Information, not investment advice or a fatwa",
    );
    expect(en.planner.disclaimer.illustrations).toBe(
      "These figures are illustrations, not forecasts. Real results can be lower, including losses.",
    );
  });
});

/** Every string in the texts. Texts that are functions are called with sample words. */
function allTexts(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const sample = Array.from({ length: value.length }, () => "x");
    return allTexts(value(...sample));
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(allTexts);
  }
  return [];
}

const BANNED_PHRASES = [
  "you will earn",
  "guaranteed",
  "expected",
  "recommended",
];

function bannedIn(texts: string[]): string[] {
  return texts.flatMap((text) =>
    BANNED_PHRASES.filter((phrase) => text.toLowerCase().includes(phrase)).map(
      (phrase) => `"${phrase}" in "${text}"`,
    ),
  );
}

describe("wording check", () => {
  it("never promises returns anywhere in the texts", () => {
    expect(allTexts(en).length).toBeGreaterThan(50);
    expect(bannedIn(allTexts(en))).toEqual([]);
  });

  it("would catch a promise", () => {
    expect(bannedIn(["You will earn 10% a year"])).toHaveLength(1);
    expect(bannedIn(["Returns are guaranteed."])).toHaveLength(1);
    expect(bannedIn(["The expected result"])).toHaveLength(1);
    expect(bannedIn(["A recommended fund"])).toHaveLength(1);
    expect(bannedIn(["Real results can be lower."])).toEqual([]);
  });
});
