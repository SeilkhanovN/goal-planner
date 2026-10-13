import { describe, expect, it } from "vitest";
import { formatMonthly, formatTotal } from "./format";

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
