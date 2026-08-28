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

/** What the device can do, and which event carries it. */
export type CompassCapability = {
  /** was compass functionality available? */
  available: boolean;
  /** the event to listen to on window, or null when there is no compass */
  eventlistener: OrientationEventName | null;
};

/**
 * Sensors take time to spin up, and hardened browsers put a permission prompt
 * in front of them. A short probe expires before either can finish and reports
 * a working compass as dead. Wait long enough that a slow but healthy sensor
 * still wins.
 */
export const ORIENTATION_PROBE_TIMEOUT_MS = 4000;

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

/**
 * iOS 13+ (and a handful of Android builds) gate orientation events behind an
 * explicit grant that may only be requested from a user gesture. Returns null
 * where no such gate exists, which is also the signal that a probe can safely
 * run unattended.
 */
export function getOrientationPermissionRequester():
  (() => Promise<PermissionState>) | null {
  if (typeof DeviceOrientationEvent === "undefined") return null;
  const request = (
    DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<PermissionState>;
    }
  ).requestPermission;
  return typeof request === "function"
    ? () => request.call(DeviceOrientationEvent)
    : null;
}

/**
 * Listen to every orientation event at once and resolve with the first that
 * yields a heading referenced to north, or null if none does before the
 * timeout. Which event answers varies by browser, and the one that answers is
 * the one the map has to subscribe to afterwards.
 *
 * Aborting resolves null; callers that would act on the result should check
 * the signal, since null otherwise reads as "no compass".
 */
export function probeOrientationEvent(
  timeoutMs = ORIENTATION_PROBE_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<OrientationEventName | null> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve(null);

    const teardown: (() => void)[] = [];
    const finish = (result: OrientationEventName | null) => {
      for (const undo of teardown.splice(0)) undo();
      resolve(result);
    };

    for (const name of ORIENTATION_EVENTS) {
      const listener = (event: Event) => {
        if (readMagneticHeading(event) === null) return;
        finish(name);
      };
      window.addEventListener(name, listener, true);
      teardown.push(() => window.removeEventListener(name, listener, true));
    }

    const timer = setTimeout(() => finish(null), timeoutMs);
    teardown.push(() => clearTimeout(timer));

    const onAbort = () => finish(null);
    signal?.addEventListener("abort", onAbort);
    teardown.push(() => signal?.removeEventListener("abort", onAbort));
  });
}
