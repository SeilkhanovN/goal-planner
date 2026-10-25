import { describe, expect, it } from "vitest";
import { formatMonthly, formatPercent, formatTotal } from "./format";

describe("formatPercent", () => {
  it.each([
    [-0.1, "−10%"],
    [0, "0%"],
    [0.05, "5%"],
    [0.075, "7.5%"],
    [0.2, "20%"],
    [1, "100%"],
    [-0.5, "−50%"],
    [0.0001, "0.01%"],
  ])("shows %d as %s", (rate, label) => {
    expect(formatPercent(rate)).toBe(label);
  });
});

describe("formatMonthly", () => {
  it.each([
    [451_791, "₸452,000"],
    [463_335, "₸463,000"],
    [1_006_434, "₸1,006,000"],
    [499, "₸0"],
    [0, "₸0"],
  ])("shows %d as %s", (amount, text) => {
    expect(formatMonthly(amount)).toBe(text);
  });
});

describe("formatTotal", () => {
  it.each([
    [9_934_536, "₸9.93m"],
    [8_851_400, "₸8.85m"],
    [452_400, "₸452,000"],
    [999_600, "₸1.00m"],
    [2_500_000_000, "₸2.50bn"],
  ])("shows %d as %s", (amount, text) => {
    expect(formatTotal(amount)).toBe(text);
  });
});
