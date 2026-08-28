import { describe, expect, it } from "vitest";
import {
  angleBetween,
  normalizeDegrees,
  readMagneticHeading,
} from "@/utils/orientation";

describe("normalizeDegrees", () => {
  it("wraps into [0, 360)", () => {
    expect(normalizeDegrees(0)).toBe(0);
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(370)).toBe(10);
    expect(normalizeDegrees(-10)).toBe(350);
    expect(normalizeDegrees(-370)).toBe(350);
  });
});

describe("angleBetween", () => {
  it("measures the short way round", () => {
    expect(angleBetween(10, 20)).toBe(10);
    expect(angleBetween(20, 10)).toBe(10);
    expect(angleBetween(0, 180)).toBe(180);
  });

  it("crosses the 360/0 boundary", () => {
    // The whole point: a straight subtraction calls these 359 degrees apart,
    // so the facing indicator could never confirm a direction near due north.
    expect(angleBetween(0.5, 359.5)).toBe(1);
    expect(angleBetween(359, 1)).toBe(2);
  });

  it("never exceeds half a turn", () => {
    for (let a = 0; a < 360; a += 7) {
      for (let b = 0; b < 360; b += 11) {
        expect(angleBetween(a, b)).toBeLessThanOrEqual(180);
      }
    }
  });
});

describe("readMagneticHeading", () => {
  const event = (props: Record<string, unknown>) => props as unknown as Event;

  it("takes webkitCompassHeading as given", () => {
    expect(readMagneticHeading(event({ webkitCompassHeading: 90 }))).toBe(90);
    // Due north is a legitimate zero, not a missing value.
    expect(readMagneticHeading(event({ webkitCompassHeading: 0 }))).toBe(0);
  });

  it("converts an absolute alpha to a clockwise heading", () => {
    expect(readMagneticHeading(event({ absolute: true, alpha: 0 }))).toBe(0);
    expect(readMagneticHeading(event({ absolute: true, alpha: 90 }))).toBe(270);
    expect(readMagneticHeading(event({ absolute: true, alpha: 270 }))).toBe(90);
  });

  it("rejects a reading that is not referenced to north", () => {
    // Relative readings measure from wherever the device happened to start,
    // which would point the user in an arbitrary direction.
    expect(
      readMagneticHeading(event({ absolute: false, alpha: 90 })),
    ).toBeNull();
  });

  it("rejects a sensor that has not produced a value", () => {
    // Arithmetic on these used to yield a heading of 360, silently pinning the
    // compass to north instead of admitting it had nothing.
    expect(
      readMagneticHeading(event({ absolute: true, alpha: null })),
    ).toBeNull();
    expect(readMagneticHeading(event({ absolute: true }))).toBeNull();
    expect(
      readMagneticHeading(event({ absolute: true, alpha: Number.NaN })),
    ).toBeNull();
  });
});
