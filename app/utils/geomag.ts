/**
 * World Magnetic Model evaluator.
 *
 * Computes the Earth's magnetic field (declination, inclination, intensity)
 * for a given location/date from a set of Gauss coefficients.
 *
 * Ported to modern TypeScript from geomagJS by Christopher Weiss
 * (https://github.com/cmweiss/geomagJS, MIT), which itself adapts the NOAA
 * geomagc / World Magnetic Model software. The numerical algorithm is
 * unchanged; the coefficients are upgraded to WMM2025 (see `wmm2025.ts`) and
 * the API is typed.
 */

import { WMM2025, type WmmModel } from "./wmm2025";

const MAX_ORDER = 12;

export type GeoMagResult = {
  /** geomagnetic declination (variation) in degrees, east positive */
  dec: number;
  /** geomagnetic inclination (dip) in degrees, down positive */
  dip: number;
  /** total field intensity [nT] */
  ti: number;
  /** horizontal field intensity [nT] */
  bh: number;
  /** north component [nT] */
  bx: number;
  /** east component [nT] */
  by: number;
  /** vertical component [nT], down positive */
  bz: number;
  lat: number;
  lon: number;
  /** decimal year actually evaluated (after validity clamping) */
  time: number;
};

type GeoMagFn = (
  glat: number,
  glon: number,
  altKm: number,
  decimalYear: number,
) => GeoMagResult;

// Square matrices are stored as flat Float64Arrays of stride STRIDE; `at(r,c)`
// maps a (row, col) pair to its flat offset. Flat typed arrays keep the hot
// numeric kernel allocation-free and, unlike `number[][]`, index access yields
// a plain `number` (no `noUncheckedIndexedAccess` widening to `undefined`).
const STRIDE = 13;
function at(row: number, col: number): number {
  return row * STRIDE + col;
}

// Read helper for the kernel's flat buffers. Every index is bounds-guaranteed
// by the fixed model order, so the `noUncheckedIndexedAccess` widening to
// `undefined` is spurious here; this is the single point that asserts it away.
// (Only reads need it — writes through an index are never widened.)
function g(buf: Float64Array, i: number): number {
  return buf[i] as number;
}

/**
 * Builds a field evaluator from a WMM model. The Schmidt-normalized
 * coefficients are converted to unnormalized form once here; the returned
 * function is then cheap to call per location.
 */
function buildEvaluator(wmm: WmmModel): GeoMagFn {
  const epoch = wmm.epoch;
  const maxord = MAX_ORDER;

  const c = new Float64Array(STRIDE * STRIDE);
  const cd = new Float64Array(STRIDE * STRIDE);
  const snorm = new Float64Array(STRIDE * STRIDE);
  const k = new Float64Array(STRIDE * STRIDE);
  const fn = Float64Array.from([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  const fm = Float64Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  for (const t of wmm.terms) {
    if (t.m > t.n) continue;
    c[at(t.m, t.n)] = t.gnm;
    cd[at(t.m, t.n)] = t.dgnm;
    if (t.m !== 0) {
      c[at(t.n, t.m - 1)] = t.hnm;
      cd[at(t.n, t.m - 1)] = t.dhnm;
    }
  }

  // Convert Schmidt normalized Gauss coefficients to unnormalized.
  snorm[at(0, 0)] = 1;
  for (let n = 1; n <= maxord; n++) {
    snorm[at(0, n)] = (g(snorm, at(0, n - 1)) * (2 * n - 1)) / n;
    let j = 2;
    for (let m = 0, d2 = n - m + 1; d2 > 0; d2--, m++) {
      k[at(m, n)] = ((n - 1) * (n - 1) - m * m) / ((2 * n - 1) * (2 * n - 3));
      if (m > 0) {
        const flnmj = ((n - m + 1) * j) / (n + m);
        snorm[at(m, n)] = g(snorm, at(m - 1, n)) * Math.sqrt(flnmj);
        j = 1;
        c[at(n, m - 1)] = g(snorm, at(m, n)) * g(c, at(n, m - 1));
        cd[at(n, m - 1)] = g(snorm, at(m, n)) * g(cd, at(n, m - 1));
      }
      c[at(m, n)] = g(snorm, at(m, n)) * g(c, at(m, n));
      cd[at(m, n)] = g(snorm, at(m, n)) * g(cd, at(m, n));
    }
  }
  k[at(1, 1)] = 0;

  // WGS-84 ellipsoid constants.
  const a = 6378.137;
  const b = 6356.7523142;
  const re = 6371.2;
  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 - b2;
  const a4 = a2 * a2;
  const b4 = b2 * b2;
  const c4 = a4 - b4;

  // Per-call scratch buffers (reused; the evaluator is single-threaded).
  const sp = new Float64Array(STRIDE);
  const cp = new Float64Array(STRIDE);
  const pp = new Float64Array(STRIDE);
  const p = new Float64Array(STRIDE * STRIDE);
  const dp = new Float64Array(STRIDE * STRIDE);
  const tc = new Float64Array(STRIDE * STRIDE);
  cp[0] = 1;
  pp[0] = 1;
  p[at(0, 0)] = 1;

  return function evaluate(glat, glon, altKm, decimalYear): GeoMagResult {
    const dt = decimalYear - epoch;
    const rlat = (glat * Math.PI) / 180;
    const rlon = (glon * Math.PI) / 180;
    const srlon = Math.sin(rlon);
    const srlat = Math.sin(rlat);
    const crlon = Math.cos(rlon);
    const crlat = Math.cos(rlat);
    const srlat2 = srlat * srlat;
    const crlat2 = crlat * crlat;

    sp[1] = srlon;
    cp[1] = crlon;

    // Geodetic -> spherical coordinates.
    const q = Math.sqrt(a2 - c2 * srlat2);
    const q1 = altKm * q;
    const q2 = ((q1 + a2) / (q1 + b2)) ** 2;
    const ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
    const st = Math.sqrt(1 - ct * ct);
    const r2 = altKm * altKm + 2 * q1 + (a4 - c4 * srlat2) / (q * q);
    const r = Math.sqrt(r2);
    const d = Math.sqrt(a2 * crlat2 + b2 * srlat2);
    const ca = (altKm + d) / r;
    const sa = (c2 * crlat * srlat) / (r * d);

    for (let m = 2; m <= maxord; m++) {
      sp[m] = g(sp, 1) * g(cp, m - 1) + g(cp, 1) * g(sp, m - 1);
      cp[m] = g(cp, 1) * g(cp, m - 1) - g(sp, 1) * g(sp, m - 1);
    }

    const aor = re / r;
    let ar = aor * aor;
    let br = 0;
    let bt = 0;
    let bp = 0;
    let bpp = 0;

    for (let n = 1; n <= maxord; n++) {
      ar *= aor;
      for (let m = 0, d4 = n + m + 1; d4 > 0; d4--, m++) {
        // Unnormalized associated Legendre polynomials + derivatives.
        if (n === m) {
          p[at(m, n)] = st * g(p, at(m - 1, n - 1));
          dp[at(m, n)] =
            st * g(dp, at(m - 1, n - 1)) + ct * g(p, at(m - 1, n - 1));
        } else if (n === 1 && m === 0) {
          p[at(m, n)] = ct * g(p, at(m, n - 1));
          dp[at(m, n)] = ct * g(dp, at(m, n - 1)) - st * g(p, at(m, n - 1));
        } else if (n > 1 && n !== m) {
          if (m > n - 2) {
            p[at(m, n - 2)] = 0;
            dp[at(m, n - 2)] = 0;
          }
          p[at(m, n)] =
            ct * g(p, at(m, n - 1)) - g(k, at(m, n)) * g(p, at(m, n - 2));
          dp[at(m, n)] =
            ct * g(dp, at(m, n - 1)) -
            st * g(p, at(m, n - 1)) -
            g(k, at(m, n)) * g(dp, at(m, n - 2));
        }

        // Time-adjust the Gauss coefficients to the requested year.
        tc[at(m, n)] = g(c, at(m, n)) + dt * g(cd, at(m, n));
        if (m !== 0) {
          tc[at(n, m - 1)] = g(c, at(n, m - 1)) + dt * g(cd, at(n, m - 1));
        }

        // Accumulate spherical harmonic terms.
        const par = ar * g(p, at(m, n));
        let temp1: number;
        let temp2: number;
        if (m === 0) {
          temp1 = g(tc, at(m, n)) * g(cp, m);
          temp2 = g(tc, at(m, n)) * g(sp, m);
        } else {
          temp1 = g(tc, at(m, n)) * g(cp, m) + g(tc, at(n, m - 1)) * g(sp, m);
          temp2 = g(tc, at(m, n)) * g(sp, m) - g(tc, at(n, m - 1)) * g(cp, m);
        }
        bt -= ar * temp1 * g(dp, at(m, n));
        bp += g(fm, m) * temp2 * par;
        br += g(fn, n) * temp1 * par;

        // Special case: geographic poles.
        if (st === 0 && m === 1) {
          pp[n] =
            n === 1
              ? g(pp, n - 1)
              : ct * g(pp, n - 1) - g(k, at(m, n)) * g(pp, n - 2);
          const parp = ar * g(pp, n);
          bpp += g(fm, m) * temp2 * parp;
        }
      }
    }

    bp = st === 0 ? bpp : bp / st;

    // Rotate from spherical to geodetic, then derive D / I / F.
    const bx = -bt * ca - br * sa;
    const by = bp;
    const bz = bt * sa - br * ca;
    const bh = Math.sqrt(bx * bx + by * by);
    const ti = Math.sqrt(bh * bh + bz * bz);
    const dec = (Math.atan2(by, bx) * 180) / Math.PI;
    const dip = (Math.atan2(bz, bh) * 180) / Math.PI;

    return {
      dec,
      dip,
      ti,
      bh,
      bx,
      by,
      bz,
      lat: glat,
      lon: glon,
      time: decimalYear,
    };
  };
}

/** Converts a Date to a decimal year (UTC). */
function toDecimalYear(date: Date): number {
  const year = date.getUTCFullYear();
  const isLeap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const msInYear = (isLeap ? 366 : 365) * 24 * 60 * 60 * 1000;
  return year + (date.valueOf() - Date.UTC(year, 0)) / msInYear;
}

const model = WMM2025;
const evaluator = buildEvaluator(model);

/**
 * Clamps a decimal year into the model's valid span. Outside the span the
 * spherical-harmonic extrapolation degrades, so we fall back to the nearest
 * valid epoch ("latest known values") rather than return a wrong field.
 *
 * @returns the clamped year and whether clamping occurred
 */
export function clampToValidYear(decimalYear: number): {
  year: number;
  clamped: boolean;
} {
  const min = model.epoch;
  const max = model.epoch + model.validYears;
  if (decimalYear < min) return { year: min, clamped: true };
  if (decimalYear > max) return { year: max, clamped: true };
  return { year: decimalYear, clamped: false };
}

let outOfRangeWarned = false;

/**
 * Full magnetic field at a location.
 *
 * @param lat geodetic latitude, decimal degrees (north positive)
 * @param lon geodetic longitude, decimal degrees (east positive)
 * @param date evaluation date (default: now)
 * @param altitudeKm height above WGS-84 ellipsoid in km (default: 0)
 */
export function geoMag(
  lat: number,
  lon: number,
  date: Date = new Date(),
  altitudeKm = 0,
): GeoMagResult {
  const { year, clamped } = clampToValidYear(toDecimalYear(date));
  if (clamped && !outOfRangeWarned) {
    outOfRangeWarned = true;
    console.warn(
      `[geomag] date outside ${model.model} validity (${model.epoch}-${
        model.epoch + model.validYears
      }); using nearest valid epoch ${year}. Update WMM coefficients.`,
    );
  }
  return evaluator(lat, lon, altitudeKm, year);
}

/**
 * Magnetic declination only: the angle between magnetic north and true
 * (geographic) north, east positive. Add this to a magnetic compass heading
 * to obtain a true-north heading.
 */
export function getDeclination(
  lat: number,
  lon: number,
  date: Date = new Date(),
): number {
  return geoMag(lat, lon, date).dec;
}
