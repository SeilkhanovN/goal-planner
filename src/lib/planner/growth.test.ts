import { describe, expect, it } from "vitest";
import {
  buildPlan,
  growthAdded,
  monthlyAtGrowth,
  parseGrowthRate,
  WHAT_IF_RATES,
  yearOptions,
} from "./plan";

function expectAbout(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

const today = { year: 2026, month: 10 };

// ₸10,000,000 in 20 months (June 2028), nothing saved yet.
const tenMillion = { price: "10000000", savings: "", month: "6", year: "2028" };

function planOf(input = tenMillion, rate?: number) {
  const { plan } = buildPlan(input, today, rate);
  if (!plan) throw new Error("expected a plan");
  return plan;
}

describe("what-if growth rates", () => {
  it("lists −10%, 0%, 5%, 10%, 15% and 20%", () => {
    expect(WHAT_IF_RATES).toEqual([-0.1, 0, 0.05, 0.1, 0.15, 0.2]);
  });

  it.each([
    [-0.1, 542_798],
    [0, 500_000],
    [0.05, 480_923],
    [0.1, 463_175],
    [0.15, 446_620],
    [0.2, 431_141],
  ])(
    "₸10,000,000 in 20 months at %d a year needs ₸%d a month",
    (rate, amount) => {
      expectAbout(monthlyAtGrowth(planOf(), rate), amount);
    },
  );

  it("is the plain-saving amount at 0%", () => {
    const plan = planOf();
    expect(plan.growth).toBe(0);
    expect(plan.monthlySaving).toBe(monthlyAtGrowth(plan, 0));
  });

  it("never needs more a month when growth is higher", () => {
    const plan = planOf({ ...tenMillion, savings: "1000000" });
    const amounts = [-0.5, -0.1, 0, 0.01, 0.05, 0.1, 0.2, 0.5, 1].map((rate) =>
      monthlyAtGrowth(plan, rate),
    );
    for (let i = 1; i < amounts.length; i++) {
      expect(amounts[i]).toBeLessThanOrEqual(amounts[i - 1]);
    }
  });

  it("lets the savings already set aside grow too", () => {
    const plan = planOf({ ...tenMillion, savings: "1000000" }, 0.1);
    expectAbout(plan.monthlySaving, 408_883.66);
  });

  it("makes the plan follow the selected rate and reports what is paid in", () => {
    const plan = planOf(tenMillion, 0.1);
    expect(plan.growth).toBe(0.1);
    expectAbout(plan.monthlySaving, 463_175);
    expect(Math.abs(plan.monthlySaving * plan.months - 9_263_507)).toBeLessThan(
      25,
    );
  });

  it("needs more paid in than the goal when the assumed growth is negative", () => {
    const plan = planOf(tenMillion, -0.1);
    expect(plan.monthlySaving * plan.months).toBeGreaterThan(plan.goalAmount);
  });
});

describe("parseGrowthRate", () => {
  it.each([
    ["7.5", 0.075],
    ["7,5", 0.075],
    ["10%", 0.1],
    [" 12 % ", 0.12],
    ["-50", -0.5],
    ["100", 1],
    ["0", 0],
    ["-10", -0.1],
    ["−10", -0.1],
  ])("reads %j as %d", (text, rate) => {
    const result = parseGrowthRate(text);
    expect(result.kind).toBe("rate");
    if (result.kind === "rate") expect(result.rate).toBeCloseTo(rate, 10);
  });

  it("treats blank text as blank", () => {
    expect(parseGrowthRate("  ")).toEqual({ kind: "blank" });
  });

  it.each(["abc", "1e2", "1.2.3", "--5", "7%%", "₸5"])(
    "rejects %j as not a number",
    (text) => {
      expect(parseGrowthRate(text)).toEqual({
        kind: "error",
        error: "notNumber",
      });
    },
  );

  it.each(["150", "100.5", "-51", "-50.1"])(
    "rejects %j as out of range",
    (text) => {
      expect(parseGrowthRate(text)).toEqual({
        kind: "error",
        error: "outOfRange",
      });
    },
  );
});

describe("yearOptions", () => {
  it("lists this year and the next 30 years", () => {
    const years = yearOptions(2026);
    expect(years[0]).toBe(2026);
    expect(years[years.length - 1]).toBe(2056);
    expect(years).toHaveLength(31);
  });

  it("makes April 2028 and the last allowed month pickable", () => {
    const years = yearOptions(2026);
    expect(years).toContain(2028);
    const { errors } = buildPlan(
      { price: "10000000", savings: "", month: "10", year: String(years[30]) },
      { year: 2026, month: 10 },
    );
    expect(errors).toEqual({});
  });
});

describe("growthAdded", () => {
  it.each([
    [-0.1, -855_960],
    [0, 0],
    [0.05, 381_535],
    [0.1, 736_493],
    [0.15, 1_067_591],
    [0.2, 1_377_178],
  ])(
    "₸10,000,000 in 20 months at %d a year: growth adds ₸%d",
    (rate, amount) => {
      expectAbout(growthAdded(planOf(), rate), amount);
    },
  );

  it("counts only what is left after the savings: ₸1,000,000 saved at 10%", () => {
    const plan = planOf({ ...tenMillion, savings: "1000000" });
    expectAbout(growthAdded(plan, 0.1), 822_327);
  });

  it("is the goal minus the savings minus the total paid in", () => {
    const plan = planOf({ ...tenMillion, savings: "2500000" });
    for (const rate of [-0.3, -0.1, 0.03, 0.1, 0.25, 0.8]) {
      const paidIn = monthlyAtGrowth(plan, rate) * plan.months;
      expect(
        Math.abs(
          growthAdded(plan, rate) - (plan.goalAmount - plan.saved - paidIn),
        ),
      ).toBeLessThan(1e-6);
    }
  });

  it("adds nothing when the savings already cover the goal", () => {
    const plan = planOf({ ...tenMillion, savings: "15000000" });
    for (const rate of [-0.1, 0, 0.2]) {
      expect(growthAdded(plan, rate)).toBe(0);
    }
  });

  it("is exactly 0 at 0%, whatever the goal", () => {
    const plan = planOf({
      price: "8851400",
      savings: "1000000",
      month: "4",
      year: "2028",
    });
    expect(growthAdded(plan, 0)).toBe(0);
  });
});
