<script setup lang="ts">
import {
  MglMap,
  MglMarker,
  MglNavigationControl,
  Position,
  useMap,
  MglLineLayer,
  MglGeoJsonSource,
  MglAttributionControl,
} from "@indoorequal/vue-maplibre-gl";
import { LngLat, type StyleSpecification } from "maplibre-gl";
import { Coordinates, Qibla } from "adhan";
import type { GeoJSON } from "geojson";
import { getDeclination } from "@/utils/geomag";
import {
  angleBetween,
  readMagneticHeading,
  type CompassCapability,
} from "@/utils/orientation";
import compassIcon from "@/assets/explore.svg?url";

const { t } = useI18n();

const props = defineProps<{
  userCoordinates: [number, number];
  compassCheckResult: CompassCapability | null;
}>();

function getDirectionSecondPoint({
  lat,
  long,
  degree,
  distance = 10,
}: {
  lat: number;
  long: number;
  degree: number;
  /** in kilometers */
  distance?: number;
}) {
  // assumes degree is between 0-360 degrees from north clockwise
  const bearing = (degree * Math.PI) / 180;
  const R = 6371; // radius of Earth in KM

  const latRad = (lat * Math.PI) / 180;
  const longRad = (long * Math.PI) / 180;

  const latitude2 = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
      Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearing),
  );
  const longitude2 =
    longRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(latRad),
      Math.cos(distance / R) - Math.sin(latRad) * Math.sin(latitude2),
    );

  return {
    lat: (latitude2 * 180) / Math.PI,
    long: (longitude2 * 180) / Math.PI,
  };
}

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      // this is the preferred url: https://github.com/openstreetmap/operations/issues/737
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm", // This must match the source key above
    },
  ],
};

const userCoordinatesLngLat = computed(
  () => new LngLat(props.userCoordinates[0], props.userCoordinates[1]),
);

const qiblaDegrees = computed(() => {
  const long = props.userCoordinates[0];
  const lat = props.userCoordinates[1];
  return Qibla(new Coordinates(lat, long));
});
const qiblaDirCoords = computed(() => {
  const long = props.userCoordinates[0];
  const lat = props.userCoordinates[1];
  const qibla = getDirectionSecondPoint({
    long,
    lat,
    degree: qiblaDegrees.value,
  });
  return [qibla.long, qibla.lat];
});
const qiblaLine = computed<GeoJSON>(() => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [props.userCoordinates, qiblaDirCoords.value],
      },
    },
  ],
}));

// Raw device compass heading, measured against MAGNETIC north.
const magneticHeading = ref(0);

// Magnetic declination at the user's location (WMM2025): the angle from
// magnetic to true north, east positive. The Qibla bearing (adhan) and the
// map are both referenced to TRUE north, so the magnetic heading must be
// corrected before it can be compared with them.
const declination = computed(() =>
  getDeclination(props.userCoordinates[1], props.userCoordinates[0]),
);

// True-north heading, wrapped to [0, 360).
const compassDegrees = computed(
  () => (((magneticHeading.value + declination.value) % 360) + 360) % 360,
);

const userDirCoords = computed(() => {
  const long = props.userCoordinates[0];
  const lat = props.userCoordinates[1];
  const userDirection = getDirectionSecondPoint({
    long,
    lat,
    degree: compassDegrees.value,
  });
  return [userDirection.long, userDirection.lat];
});

const userLine = computed<GeoJSON>(() => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [props.userCoordinates, userDirCoords.value],
      },
    },
  ],
}));

// Straight subtraction never matched across the 360/0 boundary, where a
// heading of 0.5 and a Qibla of 359.5 read as 359 degrees apart.
const FACING_TOLERANCE_DEGREES = 1;

const isFacingKaaba = computed(
  () =>
    angleBetween(compassDegrees.value, qiblaDegrees.value) <
    FACING_TOLERANCE_DEGREES,
);

const compassLockEnabled = ref(false);

const listeningToOrientation = ref(false);

const map = useMap();

function onMapMove() {
  const mapCenter = map.map?.getCenter();
  if (mapCenter && mapCenter.distanceTo(userCoordinatesLngLat.value) > 1) {
    map.map?.setCenter(props.userCoordinates);
  }
}

function onOrientationChanged(event: Event) {
  const heading = readMagneticHeading(event);
  // A reading we cannot trust (sensor still settling, or a relative heading)
  // would point the user somewhere arbitrary, so keep the last good one.
  if (heading === null) return;
  magneticHeading.value = heading;
}

const evtOptions: AddEventListenerOptions = { passive: true };

function stopListeningToOrientation() {
  const evt = props.compassCheckResult?.eventlistener;
  if (!evt) return;
  window.removeEventListener(evt, onOrientationChanged, evtOptions);
  listeningToOrientation.value = false;
}

function startListeningToOrientation() {
  const evt = props.compassCheckResult?.eventlistener;
  if (!evt) return;
  window.addEventListener(evt, onOrientationChanged, evtOptions);
  listeningToOrientation.value = true;
}

function toggleCompassLock() {
  if (props.compassCheckResult?.available !== true) return;
  compassLockEnabled.value = !compassLockEnabled.value;

  if (!compassLockEnabled.value) {
    // Nothing reads the heading while unlocked, so stop draining the sensor.
    stopListeningToOrientation();
    return;
  }

  if (!listeningToOrientation.value) {
    startListeningToOrientation();
  }
  // immediately align map bearing with the current compass heading
  try {
    map.map?.rotateTo(compassDegrees.value, { duration: 0 });
  } catch {
    // ignore if map isn't ready yet
  }
}

onBeforeUnmount(stopListeningToOrientation);

watch(
  () => compassDegrees.value,
  (val) => {
    if (!compassLockEnabled.value) return;
    if (!map?.map) return;
    try {
      map.map.rotateTo(val, { duration: 0 });
    } catch {
      // swallow errors if rotate isn't available yet
    }
  },
);
</script>

<template>
  <mgl-map
    :map-style="mapStyle"
    :min-zoom="12"
    :zoom="10"
    :center="userCoordinates"
    :drag-pan="false"
    :box-zoom="false"
    :attribution-control="false"
    @map:moveend="onMapMove"
  >
    <MglAttributionControl :compact="true" />
    <mgl-navigation-control
      :show-compass="true"
      :position="Position.TOP_LEFT"
    />
    <mgl-marker :coordinates="userCoordinates">
      <template #marker>
        <div class="user-location-dot"></div>
      </template>
    </mgl-marker>
    <mgl-geo-json-source source-id="qibla_line" :data="qiblaLine">
      <MglLineLayer
        layer-id="qibla_line"
        :layout="{
          'line-cap': 'round',
          'line-join': 'round',
        }"
        :paint="{
          'line-color': '#444',
          'line-width': 10,
        }"
      />
    </mgl-geo-json-source>
    <mgl-geo-json-source source-id="qibla_line_highlight" :data="qiblaLine">
      <MglLineLayer
        layer-id="qibla_line_highlight"
        :layout="{
          'line-cap': 'round',
          'line-join': 'round',
        }"
        :paint="{
          'line-color': '#ffdd00',
          'line-width': 3,
        }"
      />
    </mgl-geo-json-source>

    <mgl-geo-json-source
      v-if="compassLockEnabled"
      source-id="user_line"
      :data="userLine"
    >
      <MglLineLayer
        layer-id="user_line"
        :layout="{
          'line-cap': 'round',
          'line-join': 'round',
        }"
        :paint="{
          'line-color': isFacingKaaba ? '#59cf78' : '#000',
          'line-width': 3,
        }"
      />
    </mgl-geo-json-source>
    <button
      v-if="compassCheckResult?.available"
      class="p-1 flex items-center fixed bottom-1 border left-1 text-white gap-1 rounded text-sm"
      :class="{
        'bg-black/60 border-black/50': !compassLockEnabled,
        'bg-cyan-600 border-cyan-400': compassLockEnabled,
      }"
      dir="ltr"
      @click="toggleCompassLock"
    >
      <img :src="compassIcon" :alt="t('compassIconAlt')" />
      {{ t("compassLock") }}
    </button>

    <div
      v-if="compassLockEnabled"
      class="flex justify-center items-center bg-black/50 fixed top-0 left-1/2 -translate-x-1/2"
      aria-live="polite"
      :aria-label="isFacingKaaba ? t('facingKaaba') : t('notFacingKaaba')"
    >
      <CheckIcon v-if="isFacingKaaba" class="text-[#59cf78] size-11" />
      <CrossIcon v-else class="text-red-400 size-11" />
    </div>
  </mgl-map>
</template>

<style lang="css">
@import "maplibre-gl/dist/maplibre-gl.css";

.user-location-dot {
  background-color: rgb(0, 116, 211);
  border: 3px solid white;
  width: 14px;
  height: 14px;
  border-radius: 999px;
}
</style>
