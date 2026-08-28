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
  />
</template>

<script setup lang="ts">
import type { LocationCheckResult } from "~/components/LocationChecker.client.vue";
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
  if (e.available) resume();
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
