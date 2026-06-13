import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats a mid-month date correctly", () => {
    expect(formatDate("2026-06-12")).toBe("12 jun 2026");
  });

  it("day < 10: no leading zero", () => {
    expect(formatDate("2026-06-09")).toBe("9 jun 2026");
  });

  it("day 1 has no leading zero", () => {
    expect(formatDate("2026-01-01")).toBe("1 jan 2026");
  });

  it("no 'de' between parts", () => {
    const result = formatDate("2026-05-28");
    expect(result).not.toContain("de");
    expect(result).toBe("28 mai 2026");
  });

  it("no trailing dot on month abbreviation", () => {
    const result = formatDate("2026-03-15");
    expect(result).not.toMatch(/\./);
    expect(result).toBe("15 mar 2026");
  });

  it("stable in UTC (no timezone drift)", () => {
    expect(formatDate("2026-06-01")).toBe("1 jun 2026");
    expect(formatDate("2026-12-31")).toBe("31 dez 2026");
  });

  it("year boundary", () => {
    expect(formatDate("2025-12-31")).toBe("31 dez 2025");
    expect(formatDate("2026-01-01")).toBe("1 jan 2026");
  });
});
