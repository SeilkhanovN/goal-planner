import { describe, expect, it } from "vitest";
import { en } from "./en";

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
