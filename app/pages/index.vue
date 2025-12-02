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
import type { CompassCheckResult } from "~/components/CompassChecker.client.vue";
import type { LocationCheckResult } from "~/components/LocationChecker.client.vue";

const { coords, resume } = useGeolocation({
  enableHighAccuracy: true,
  maximumAge: 10000,
  immediate: false,
  timeout: 10000,
});

const compassCheckResult = ref<CompassCheckResult | null>(null);
const locationCheckResult = ref<LocationCheckResult | null>(null);
const userCoordinates = ref<[number, number]>([0, 0]);

function onCompassResult(e: CompassCheckResult) {
  compassCheckResult.value = e;
}
function onLocationResult(e: LocationCheckResult) {
  locationCheckResult.value = e;
  userCoordinates.value = e.coordinates;
  if (e.available) {
    resume();
  }
}

watch(coords, () => {
  if (locationCheckResult.value?.available) {
    userCoordinates.value = [coords.value.longitude, coords.value.latitude];
  }
});
</script>

<style scoped></style>
