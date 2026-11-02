import { describe, expect, it } from "vitest";
import { DEFAULT_LOAN_RATE, parseLoanRate } from "./loan";

describe("parseLoanRate", () => {
  it("starts at 25%", () => {
    expect(DEFAULT_LOAN_RATE).toBe(0.25);
  });

  it.each(["", "  "])("treats %j as the default rate", (text) => {
    expect(parseLoanRate(text)).toEqual({ kind: "rate", rate: 0.25 });
  });

  it.each([
    ["18.5", 0.185],
    ["18,5", 0.185],
    ["30%", 0.3],
    ["0", 0],
    ["100", 1],
  ])("reads %j as %d", (text, rate) => {
    expect(parseLoanRate(text)).toEqual({ kind: "rate", rate });
  });

  it.each(["abc", "1.2.3"])("rejects %j as not a number", (text) => {
    expect(parseLoanRate(text)).toEqual({ kind: "error", error: "notNumber" });
  });

  it.each(["150", "-5", "100.5"])("rejects %j as out of range", (text) => {
    expect(parseLoanRate(text)).toEqual({ kind: "error", error: "outOfRange" });
  });
});
