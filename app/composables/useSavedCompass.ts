/**
 * What the compass was last seen to do, kept across launches.
 *
 * Deciding this from scratch means waiting out the probe timeout on every
 * launch, and that whole wait is spent in front of a "checking your device"
 * screen on precisely the devices that turn out to have no compass at all.
 * Remembering the answer lets the map open straight away; the caller re-probes
 * in the background to correct it.
 */

import {
  ORIENTATION_EVENTS,
  type CompassCapability,
  type OrientationEventName,
} from "@/utils/orientation";
import { jsonSerializer } from "@/utils/storage";

const STORAGE_KEY = "last_known_compass";

export type SavedCompass = CompassCapability & {
  /** epoch milliseconds */
  checkedAt: number;
};

function isValidSavedCompass(value: unknown): value is SavedCompass {
  if (!value || typeof value !== "object") return false;
  const { available, eventlistener } = value as SavedCompass;
  if (typeof available !== "boolean") return false;
  return (
    eventlistener === null ||
    (ORIENTATION_EVENTS as readonly string[]).includes(
      eventlistener as OrientationEventName,
    )
  );
}

export function useSavedCompass() {
  const stored = useLocalStorage<SavedCompass | null>(STORAGE_KEY, null, {
    serializer: jsonSerializer<SavedCompass>(),
  });

  const lastKnown = computed(() =>
    isValidSavedCompass(stored.value) ? stored.value : null,
  );

  function remember(capability: CompassCapability) {
    stored.value = { ...capability, checkedAt: Date.now() };
  }

  return { lastKnown, remember };
}
