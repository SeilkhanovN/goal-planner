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
