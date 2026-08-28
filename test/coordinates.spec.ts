import { describe, expect, it } from "vitest";
import { isValidCoordinates, parseCoordinates } from "@/utils/coordinates";

describe("isValidCoordinates", () => {
  it("accepts a longitude/latitude pair inside the world", () => {
    expect(isValidCoordinates([51.389, 35.6892])).toBe(true);
    expect(isValidCoordinates([0, 0])).toBe(true);
    expect(isValidCoordinates([-180, -90])).toBe(true);
    expect(isValidCoordinates([180, 90])).toBe(true);
  });

  it("rejects values outside it", () => {
    expect(isValidCoordinates([181, 0])).toBe(false);
    expect(isValidCoordinates([0, 91])).toBe(false);
  });

  it("rejects anything that is not a finite pair", () => {
    for (const bad of [
      null,
      undefined,
      "35,51",
      [35],
      [1, 2, 3],
      [Number.NaN, 0],
      // useGeolocation seeds its coords with Infinity before the first fix.
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      [null, 5],
    ]) {
      expect(isValidCoordinates(bad)).toBe(false);
    }
  });
});

describe("parseCoordinates", () => {
  // Every case returns [latitude, longitude], which is the order people write
  // coordinates in, and the reverse of the [lng, lat] the map uses.
  it("reads a plain decimal pair", () => {
    expect(parseCoordinates("35.6892, 51.389")).toEqual([35.6892, 51.389]);
    expect(parseCoordinates("35.6892 51.389")).toEqual([35.6892, 51.389]);
  });

  it("keeps negative signs", () => {
    expect(parseCoordinates("-33.8688, 151.2093")).toEqual([
      -33.8688, 151.2093,
    ]);
    expect(parseCoordinates("40.7128, -74.006")).toEqual([40.7128, -74.006]);
  });

  it("applies hemisphere letters", () => {
    expect(parseCoordinates("33.8688 S, 151.2093 E")).toEqual([
      -33.8688, 151.2093,
    ]);
    expect(parseCoordinates("40.7128 N, 74.006 W")).toEqual([40.7128, -74.006]);
  });

  it("reads degrees/minutes/seconds", () => {
    const [lat, lon] = parseCoordinates("35° 41' 21.12\" N, 51° 23' 20.4\" E")!;
    expect(lat).toBeCloseTo(35.6892, 3);
    expect(lon).toBeCloseTo(51.389, 3);
  });

  it("survives the words people paste around coordinates", () => {
    expect(parseCoordinates("Latitude 35.6892 and Longitude 51.389")).toEqual([
      35.6892, 51.389,
    ]);
  });

  it("does not mangle words that merely contain a stripped word", () => {
    // "Sandton" contains "and"; removing it as a substring used to leave "Ston".
    expect(parseCoordinates("Sandton -26.1076, 28.0567")).toEqual([
      -26.1076, 28.0567,
    ]);
  });

  it("returns null when there is nothing to read", () => {
    expect(parseCoordinates("")).toBeNull();
    expect(parseCoordinates("nowhere in particular")).toBeNull();
    expect(parseCoordinates("35.6892")).toBeNull();
  });
});
