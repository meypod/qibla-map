/**
 * Locating the device.
 *
 * Kept out of the components because both the start-up check and the map's
 * locate button need the same staged lookup and the same reading of what went
 * wrong.
 */

import type { MessageKey } from "~/i18n/messages";

// GeolocationPositionError codes. Spelled out rather than read off the global,
// which older WebKit does not expose under that name.
const PERMISSION_DENIED = 1;
const POSITION_TIMEOUT = 3;

/**
 * Accepts a recent cached or network fix, so a position that is already known
 * comes back immediately.
 */
const COARSE_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8_000,
  maximumAge: 60_000,
};

/**
 * Waits on a real GPS fix. On a phone with no network location backend this
 * routinely takes the better part of a minute from cold, which is why the
 * timeout is nothing like the few seconds that feel reasonable.
 */
const PRECISE_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 60_000,
  maximumAge: 0,
};

function getCurrentPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Why a lookup cannot even be attempted, or null when it can. Browsers only
 * expose geolocation over https and report the refusal as an ordinary position
 * error, which on its own is impossible to act on.
 */
export function checkGeolocationUsable(): MessageKey | null {
  if (!("geolocation" in navigator)) return "locationUnavailable";
  if (!window.isSecureContext) return "locationInsecure";
  return null;
}

/**
 * Turn a failure into something the user can act on. Reporting everything as
 * "permission denied" sends people into their browser settings when the real
 * problem is a GPS that has not got a fix yet.
 */
export function describeGeolocationError(error: unknown): MessageKey {
  switch ((error as GeolocationPositionError | undefined)?.code) {
    case PERMISSION_DENIED:
      return "locationDenied";
    case POSITION_TIMEOUT:
      return "locationTimeout";
    default:
      return "locationUnavailable";
  }
}

/**
 * Current position as [longitude, latitude], in two stages: a quick attempt
 * that will take an already-known fix, then a patient one that waits for GPS.
 * `onWaitingForGps` fires when the slow stage starts, so the caller can say so.
 */
export async function lookupPosition(
  onWaitingForGps?: () => void,
): Promise<[number, number]> {
  const toCoordinates = (position: GeolocationPosition): [number, number] => [
    position.coords.longitude,
    position.coords.latitude,
  ];

  try {
    return toCoordinates(await getCurrentPosition(COARSE_OPTIONS));
  } catch (error) {
    // No amount of waiting turns a refusal into a fix.
    if (
      (error as GeolocationPositionError | undefined)?.code ===
      PERMISSION_DENIED
    ) {
      throw error;
    }
    onWaitingForGps?.();
    return toCoordinates(await getCurrentPosition(PRECISE_OPTIONS));
  }
}

/**
 * Whether the browser will hand over a position without interrupting the user.
 * Unknown rather than denied when the Permissions API is missing or refuses to
 * answer, since the request itself is the reliable test.
 */
export async function isGeolocationGranted(): Promise<boolean | null> {
  if (!navigator.permissions?.query) return null;
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state === "granted") return true;
    if (status.state === "denied") return false;
    return null;
  } catch {
    return null;
  }
}
