import { describe, expect, it } from "vitest";
import { clampToValidYear, getDeclination } from "@/utils/geomag";
import { WMM2025 } from "@/utils/wmm2025";

const IN_MODEL = new Date("2026-08-28T00:00:00Z");

describe("clampToValidYear", () => {
  const { epoch, validYears } = WMM2025;

  it("passes a year inside the model through untouched", () => {
    expect(clampToValidYear(epoch + 1)).toEqual({
      year: epoch + 1,
      clamped: false,
    });
  });

  it("pins a year outside the model to the nearest valid edge", () => {
    expect(clampToValidYear(epoch - 5)).toEqual({ year: epoch, clamped: true });
    expect(clampToValidYear(epoch + validYears + 5)).toEqual({
      year: epoch + validYears,
      clamped: true,
    });
  });
});

describe("getDeclination", () => {
  // Reference values for the WMM2025 epoch, east positive. Bands are wide
  // enough to absorb the drift within the model's validity, and narrow enough
  // that a sign error or a wrong coefficient set would fail.
  const places: [string, number, number, number][] = [
    ["Tehran", 35.6892, 51.389, 5.0],
    ["London", 51.5074, -0.1278, 1.2],
    ["New York", 40.7128, -74.006, -12.5],
    ["Sydney", -33.8688, 151.2093, 12.8],
    ["Mecca", 21.4225, 39.8262, 3.5],
  ];

  it.each(places)(
    "is close to the known value at %s",
    (_name, lat, lon, expected) => {
      expect(getDeclination(lat, lon, IN_MODEL)).toBeCloseTo(expected, 0);
    },
  );

  it("stays finite and inside half a turn everywhere", () => {
    for (let lat = -85; lat <= 85; lat += 17) {
      for (let lon = -180; lon <= 180; lon += 37) {
        const dec = getDeclination(lat, lon, IN_MODEL);
        expect(Number.isFinite(dec)).toBe(true);
        expect(Math.abs(dec)).toBeLessThanOrEqual(180);
      }
    }
  });

  it("changes smoothly between neighbouring points", () => {
    const a = getDeclination(35.6892, 51.389, IN_MODEL);
    const b = getDeclination(35.6992, 51.399, IN_MODEL);
    expect(Math.abs(a - b)).toBeLessThan(0.1);
  });
});
