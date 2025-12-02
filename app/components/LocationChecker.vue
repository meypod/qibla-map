<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div
      class="md:bg-gray-100 md:shadow-sm md:rounded-lg p-4 w-full md:w-auto text-center"
    >
      <div v-if="available !== null" class="text-yellow-600">
        <div v-if="available">
          <p class="mb-2">Location access granted.</p>
          <p v-if="result">
            Latitude: {{ result.coordinates[0].toFixed(6) }}, Longitude:
            {{ result.coordinates[1].toFixed(6) }}
          </p>
          <div class="flex gap-2 justify-center mt-3">
            <button class="p-2 border rounded" @click="refreshLocation">
              Refresh
            </button>
          </div>
        </div>

        <div v-else>
          <p class="mb-2">
            Your browser cannot access Geolocation or permission was denied.
          </p>
          <p class="mb-2">
            You can enter coordinates manually to open the map.
          </p>

          <div class="flex gap-2 justify-center mt-3">
            <button
              class="p-2 bg-sky-600 text-white rounded disabled:bg-sky-200 disabled:cursor-not-allowed"
              :disabled="!result"
              @click="emitResult"
            >
              Open Map
            </button>
            <button class="p-2 border rounded" @click="tryRequestPermission">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-2 items-center">
        <p class="mb-2">
          This device may require permission to access location.
        </p>
        <div class="flex gap-2">
          <button
            class="p-2 bg-sky-600 text-white rounded"
            @click="tryRequestPermission"
          >
            Allow Location Access
          </button>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm">Manual coordinates (lat, lon)</label>
        <div class="flex gap-2 mt-2 justify-center">
          <input
            v-model.number="manualLat"
            type="number"
            step="any"
            placeholder="Latitude"
            class="p-2 border rounded w-32"
          />
          <input
            v-model.number="manualLon"
            type="number"
            step="any"
            placeholder="Longitude"
            class="p-2 border rounded w-32"
          />
          <button
            class="p-2 bg-gray-200 rounded"
            title="Paste coordinates from clipboard"
            @click="pasteCoordinates"
          >
            Paste
          </button>
        </div>
        <p v-if="parseError" class="text-red-600 mt-2 text-sm">
          {{ parseError }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";

export type LocationCheckResult = {
  /** is GPS location available and allowed? */
  available: boolean;
  /** contains last fetched gps location coordinates or user's manually entered coords */
  coordinates: [number, number];
};

const emit = defineEmits<{
  (e: "result", result: LocationCheckResult): void;
}>();

const available = ref<boolean | null>(null);
const result = ref<LocationCheckResult | null>(null);
const manualLat = ref<number | null>(null);
const manualLon = ref<number | null>(null);
const parseError = ref<string | null>(null);

watch(
  () => `${manualLat.value}|${manualLon.value}`,
  () => {
    if (manualLat.value != null && manualLon.value != null) {
      result.value = {
        available: false,
        coordinates: [manualLon.value, manualLat.value],
      };
    }
  },
);

function emitResult() {
  if (!result.value) return;
  emit("result", result.value);
}
/**
 * Try to parse clipboard text into [lat, lon].
 * Accepts formats like "35.6895, 139.6917", "35.6895 N, 139.6917 E",
 * or numbers with degree symbol. It strips commas and degree symbols,
 * and applies sign rules for N/S and E/W.
 */
function parseClipboardToCoords(text: string): [number, number] | null {
  if (!text) return null;
  // Replace degree symbols and commas with spaces to simplify parsing
  const cleaned = text
    .replace(/[°,]/g, " ")
    .replaceAll(/(and|latitude|longitude)/g, "")
    .trim();

  // Match number tokens with optional trailing direction letter
  const regex = /([+-]?\d+(?:\.\d+)?)(?:\s*°)?\s*([NSEW])?/gi;
  const parts: { num: number; dir?: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(cleaned)) !== null) {
    const num = parseFloat(m[1] as string);
    const dir = m[2]?.toUpperCase();
    parts.push({ num, dir });
    if (parts.length >= 2) break;
  }

  if (parts.length >= 2) {
    let lat = parts[0]!.num;
    let lon = parts[1]!.num;
    const d0 = parts[0]!.dir;
    const d1 = parts[1]!.dir;
    if (d0 === "S") lat = -Math.abs(lat);
    if (d0 === "N") lat = Math.abs(lat);
    if (d1 === "W") lon = -Math.abs(lon);
    if (d1 === "E") lon = Math.abs(lon);
    return [lat, lon];
  }

  // Fallback: pick the first two numbers found anywhere
  const nums = cleaned.match(/-?\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2) {
    let lat = parseFloat(nums[0] as string);
    let lon = parseFloat(nums[1] as string);
    // Apply sign hints if the text contains letters
    if (/[sS]/.test(cleaned) && !/[nN]/.test(cleaned)) lat = -Math.abs(lat);
    if (/[wW]/.test(cleaned) && !/[eE]/.test(cleaned)) lon = -Math.abs(lon);
    return [lat, lon];
  }

  return null;
}

async function pasteCoordinates() {
  parseError.value = null;
  let text: string | null = null;
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      text = await navigator.clipboard.readText();
    } else {
      // Fallback: prompt the user to paste manually
      text = window.prompt("Paste coordinates here:");
    }
  } catch {
    // If clipboard access fails, fallback to prompt
    text = window.prompt("Paste coordinates here:");
  }

  if (!text) {
    parseError.value = "No clipboard text available.";
    return;
  }

  const parsed = parseClipboardToCoords(text);
  if (!parsed) {
    parseError.value = "Could not parse coordinates from clipboard.";
    return;
  }

  result.value = {
    available: false,
    coordinates: [parsed[1], parsed[0]],
  };

  // Small UI nicety: clear any previous error after a tick
  await nextTick();
  parseError.value = null;
}

function tryRequestPermission() {
  // Attempt to get current position with a short timeout
  if (!("geolocation" in navigator)) {
    available.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      available.value = true;
      result.value = {
        available: true,
        coordinates: [position.coords.longitude, position.coords.latitude],
      };
      emitResult();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err) => {
      available.value = false;
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
  );
}

function refreshLocation() {
  tryRequestPermission();
}

onMounted(() => {
  // Auto-check once on mount if geolocation present
  if ("geolocation" in navigator) {
    tryRequestPermission();
  } else {
    available.value = false;
  }
});
</script>

<style scoped></style>
