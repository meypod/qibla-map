/**
 * Device orientation helpers.
 *
 * Reading a compass heading from the browser is awkward because the two event
 * families report it differently and only some readings are referenced to
 * north at all. Everything that needs a heading goes through here so the
 * "is this reading trustworthy?" decision lives in one place.
 */

/**
 * Orientation events that can carry a heading, most trustworthy first.
 *
 * Chromium fires `deviceorientationabsolute`; WebKit and Firefox only fire
 * `deviceorientation`, where the heading is usable when the platform fills in
 * `webkitCompassHeading` or flags the event as absolute.
 */
export const ORIENTATION_EVENTS = [
  "deviceorientationabsolute",
  "deviceorientation",
] as const;

export type OrientationEventName = (typeof ORIENTATION_EVENTS)[number];

type CompassOrientationEvent = DeviceOrientationEvent & {
  /** WebKit-only: heading against magnetic north, already in compass sense. */
  webkitCompassHeading?: number;
};

/** Wrap an angle in degrees into [0, 360). */
export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * Heading against MAGNETIC north in degrees, or null when the event carries
 * nothing we can point a user with.
 *
 * Rejecting a reading matters as much as reading one:
 *
 * - `alpha` is null while the sensor is still settling, or permanently when a
 *   browser blocks the sensor (Brave shields, GrapheneOS Vanadium without the
 *   sensors permission). Arithmetic on null silently yields a heading of 360.
 * - a `deviceorientation` event with `absolute === false` measures from
 *   wherever the device happened to be when the sensor started, so it would
 *   send the user off in an arbitrary direction rather than toward the Kaaba.
 *
 * Callers must correct for magnetic declination before comparing against a
 * true-north bearing.
 */
export function readMagneticHeading(event: Event): number | null {
  const orientation = event as CompassOrientationEvent;

  const webkitHeading = orientation.webkitCompassHeading;
  if (typeof webkitHeading === "number" && Number.isFinite(webkitHeading)) {
    return normalizeDegrees(webkitHeading);
  }

  const alpha = orientation.alpha;
  if (!orientation.absolute || alpha == null || !Number.isFinite(alpha)) {
    return null;
  }

  // `alpha` rotates counter-clockwise from north; a compass heading rotates
  // clockwise.
  return normalizeDegrees(360 - alpha);
}

/**
 * Smallest angle between two bearings, accounting for the wrap at 360: 359°
 * and 1° are 2° apart, not 358°.
 */
export function angleBetween(a: number, b: number): number {
  const diff = normalizeDegrees(a - b);
  return Math.min(diff, 360 - diff);
}
