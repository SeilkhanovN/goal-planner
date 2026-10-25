import { describe, expect, it } from "vitest";
import {
  formatMonthly,
  formatPercent,
  formatShare,
  groupDigits,
  formatSigned,
  formatTotal,
} from "./format";

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

describe("formatSigned", () => {
  it.each([
    [-855_960, "−₸856,000"],
    [736_493, "₸736,000"],
    [1_067_591, "₸1.07m"],
    [1_377_178, "₸1.38m"],
    [0, "₸0"],
    [-0.4, "₸0"],
  ])("shows %d as %s", (amount, label) => {
    expect(formatSigned(amount)).toBe(label);
  });
});

describe("formatShare", () => {
  it.each([
    [-0.0856, "−9%"],
    [0.0382, "4%"],
    [0.0736, "7%"],
    [0.1377, "14%"],
    [0, "0%"],
    [-0.0001, "0%"],
  ])("shows %d as %s", (fraction, label) => {
    expect(formatShare(fraction)).toBe(label);
  });
});

describe("groupDigits", () => {
  it.each([
    ["10000000", "10 000 000"],
    ["1000", "1 000"],
    ["999", "999"],
    ["8 850 000", "8 850 000"],
    ["8,850,000", "8 850 000"],
    ["1234567.5", "1 234 567.5"],
    ["1000.", "1 000."],
    ["-1000", "-1 000"],
    ["", ""],
  ])("shows %j as %j", (typed, grouped) => {
    expect(groupDigits(typed)).toBe(grouped);
  });

  it.each(["abc", "12abc", "1e5", "₸100", "1.2.3"])(
    "leaves %j alone so the error still shows",
    (typed) => {
      expect(groupDigits(typed)).toBe(typed);
    },
  );
});
