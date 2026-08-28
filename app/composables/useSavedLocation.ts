/**
 * The last position the app knew about, kept across launches.
 *
 * Acquiring a GPS fix can take the better part of a minute on a phone with no
 * network-location backend, and the map is useless until it has coordinates.
 * Remembering the previous position lets the map open on it immediately while
 * a fresh fix is acquired in the background.
 */

import { isValidCoordinates } from "@/utils/coordinates";
import { jsonSerializer } from "@/utils/storage";

const STORAGE_KEY = "last_known_location";

export type SavedLocation = {
  /** [longitude, latitude], the order the map and the Qibla math both use */
  coordinates: [number, number];
  /** epoch milliseconds */
  savedAt: number;
};

export function useSavedLocation() {
  const stored = useLocalStorage<SavedLocation | null>(STORAGE_KEY, null, {
    serializer: jsonSerializer<SavedLocation>(),
  });

  // Anything on disk is user-editable and may predate a change to this shape,
  // so it is only usable once the coordinates check out.
  const lastKnown = computed(() =>
    stored.value && isValidCoordinates(stored.value.coordinates)
      ? stored.value
      : null,
  );

  function remember(coordinates: [number, number]) {
    if (!isValidCoordinates(coordinates)) return;
    stored.value = { coordinates, savedAt: Date.now() };
  }

  return { lastKnown, remember };
}
