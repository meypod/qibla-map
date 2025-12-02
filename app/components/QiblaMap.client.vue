<script setup lang="ts">
import {
  MglMap,
  MglMarker,
  MglNavigationControl,
  Position,
  useMap,
  MglLineLayer,
  MglGeoJsonSource,
} from "@indoorequal/vue-maplibre-gl";
import { LngLat, type StyleSpecification } from "maplibre-gl";
import { Coordinates, Qibla } from "adhan";
import type { GeoJSON } from "geojson";

const props = defineProps<{
  userCoordinates: [number, number];
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

const qiblaDirCoords = computed(() => {
  const long = props.userCoordinates[0];
  const lat = props.userCoordinates[1];
  const qibla = getDirectionSecondPoint({
    long,
    lat,
    degree: Qibla(new Coordinates(lat, long)),
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

const map = useMap();

function onMapMove() {
  const mapCenter = map.map?.getCenter();
  if (mapCenter && mapCenter.distanceTo(userCoordinatesLngLat.value) > 1) {
    map.map?.setCenter(props.userCoordinates);
  }
}
</script>

<template>
  <mgl-map
    ref="map"
    :map-style="mapStyle"
    :min-zoom="12"
    :zoom="10"
    :center="userCoordinates"
    :drag-pan="false"
    :box-zoom="false"
    @map:moveend="onMapMove"
  >
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
