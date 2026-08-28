<template>
  <compass-checker
    v-if="compassCheckResult === null"
    @result="onCompassResult"
  />
  <location-checker
    v-else-if="locationCheckResult === null"
    @result="onLocationResult"
  />
  <qibla-map
    v-else
    :user-coordinates="userCoordinates"
    :compass-check-result="compassCheckResult"
    :locating="locating"
    :locate-message="locateMessage"
    @locate="onLocate"
  />
</template>

<script setup lang="ts">
import type { LocationCheckResult } from "~/components/LocationChecker.client.vue";
import type { MessageKey } from "~/i18n/messages";
import {
  checkGeolocationUsable,
  describeGeolocationError,
  lookupPosition,
} from "@/utils/geolocation";
import {
  getOrientationPermissionRequester,
  probeOrientationEvent,
  type CompassCapability,
} from "@/utils/orientation";

// Matches the patience the start-up lookup needs: a phone with no network
// location backend can take the better part of a minute to produce a fix, and
// a short timeout here would abandon the live position on exactly the devices
// that most need it.
const { coords, resume } = useGeolocation({
  enableHighAccuracy: true,
  maximumAge: 10000,
  immediate: false,
  timeout: 60000,
});

const { remember } = useSavedLocation();
const { remember: rememberCompass } = useSavedCompass();

const compassCheckResult = ref<CompassCapability | null>(null);
const locationCheckResult = ref<LocationCheckResult | null>(null);
const userCoordinates = ref<[number, number]>([0, 0]);
const locating = ref(false);
// One status slot beside the locate button, carrying either why the lookup is
// taking so long or why it failed.
const locateMessage = ref<MessageKey | null>(null);

// A failure message sits over the map, so it retires itself rather than
// staying until the user happens to try again.
const LOCATE_MESSAGE_TIMEOUT_MS = 6000;
let locateMessageTimer: ReturnType<typeof setTimeout> | undefined;

function setLocateMessage(
  message: MessageKey | null,
  { transient = false } = {},
) {
  clearTimeout(locateMessageTimer);
  locateMessage.value = message;
  if (message && transient) {
    locateMessageTimer = setTimeout(() => {
      locateMessage.value = null;
    }, LOCATE_MESSAGE_TIMEOUT_MS);
  }
}

onBeforeUnmount(() => clearTimeout(locateMessageTimer));

// useGeolocation leaks a watcher if resumed twice, and both the start-up
// result and the locate button want the live position running.
const liveWatchStarted = ref(false);
function startLiveWatch() {
  if (liveWatchStarted.value) return;
  liveWatchStarted.value = true;
  resume();
}

/**
 * A remembered capability got us past the start-up check without waiting for
 * the probe. Confirm it against the device now, in the background, so a
 * compass that has since appeared or stopped working is picked up. Skipped
 * where permission gates the sensor, because an unattended probe there would
 * find nothing and wrongly record that there is no compass.
 */
async function confirmCompass() {
  if (getOrientationPermissionRequester()) return;
  if (document.visibilityState !== "visible") return;

  const eventlistener = await probeOrientationEvent();
  const capability: CompassCapability = eventlistener
    ? { available: true, eventlistener }
    : { available: false, eventlistener: null };

  rememberCompass(capability);
  compassCheckResult.value = capability;
}

function onCompassResult(
  result: CompassCapability,
  meta: { fromCache: boolean },
) {
  compassCheckResult.value = result;
  if (meta.fromCache) confirmCompass();
}

function onLocationResult(e: LocationCheckResult) {
  locationCheckResult.value = e;
  userCoordinates.value = e.coordinates;
  if (e.available) startLiveWatch();
}

/**
 * The map's locate button. Being a deliberate tap, this is also the one place
 * a permission prompt is certain to be attributed to a user gesture.
 */
async function onLocate() {
  if (locating.value) return;

  const blocked = checkGeolocationUsable();
  if (blocked) {
    setLocateMessage(blocked, { transient: true });
    return;
  }

  locating.value = true;
  setLocateMessage(null);
  try {
    // Say so when the lookup falls through to waiting on GPS, which can take
    // the better part of a minute and otherwise looks like a stuck button.
    const coordinates = await lookupPosition(() =>
      setLocateMessage("searchingGps"),
    );
    setLocateMessage(null);
    userCoordinates.value = coordinates;
    remember(coordinates);
    // Getting a fix by hand proves the live watch is worth running.
    if (locationCheckResult.value) {
      locationCheckResult.value = { available: true, coordinates };
    }
    startLiveWatch();
  } catch (error) {
    setLocateMessage(describeGeolocationError(error), { transient: true });
  } finally {
    locating.value = false;
  }
}

watch(coords, () => {
  if (!locationCheckResult.value?.available) return;

  const next: [number, number] = [
    coords.value.longitude,
    coords.value.latitude,
  ];
  // useGeolocation seeds coords with Infinity until the first fix arrives.
  if (!isValidCoordinates(next)) return;

  userCoordinates.value = next;
  // Keep the remembered position warm so the next launch starts here.
  remember(next);
});
</script>

<style scoped></style>
