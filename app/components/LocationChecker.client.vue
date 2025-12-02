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
            <button
              class="p-2 border rounded"
              :disabled="gettingLocation"
              @click="refreshLocation"
            >
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
              class="p-2 bg-green-600 text-white rounded disabled:bg-sky-200 disabled:cursor-not-allowed"
              :disabled="!result"
              @click="emitResult"
            >
              Open Map
            </button>
            <button
              class="p-2 border rounded flex items-center justify-center gap-1"
              :disabled="gettingLocation"
              @click="tryRequestPermission"
            >
              Try Again
              <spinner v-if="gettingLocation" />
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
            class="p-2 bg-green-600 text-white rounded disabled:bg-sky-200 disabled:cursor-not-allowed"
            :disabled="!result"
            @click="emitResult"
          >
            Open Map
          </button>
          <button
            class="p-2 bg-sky-600 text-white rounded flex items-center justify-center gap-1"
            :disabled="gettingLocation"
            @click="tryRequestPermission"
          >
            Get Location
            <spinner v-if="gettingLocation" />
          </button>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm">Manual coordinates (lat, lon)</label>
        <div class="flex gap-2 mt-2 justify-center">
          <input
            v-model.number="savedCoords.lat"
            type="number"
            step="any"
            placeholder="Latitude"
            class="p-2 border rounded w-32"
          />
          <input
            v-model.number="savedCoords.long"
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
const savedCoords = useLocalStorage<{
  lat: null | number;
  long: null | number;
}>("saved_coords", { lat: null, long: null });
const parseError = ref<string | null>(null);
const gettingLocation = ref(false);

function runCheck() {
  if (savedCoords.value.lat != null && savedCoords.value.long != null) {
    result.value = {
      available: false,
      coordinates: [savedCoords.value.long, savedCoords.value.lat],
    };
  }
}

watch(() => savedCoords.value, runCheck);

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
  const cleaned = text.replaceAll(/(and|latitude|longitude)/g, "").trim();
  // Normalize common quote characters to simple ASCII variants
  const norm = cleaned
    .replace(/[‘’′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/''/g, '"');

  // First: try to detect DMS (degrees° minutes' seconds") coordinate groups
  // Examples handled: "35° 41' 57.9984'' N", "51°20'15.9936" E"
  const dmsRegex =
    /([+-]?\d+(?:\.\d+)?)\s*(?:°|deg)?\s*(\d+(?:\.\d+)?)?\s*(?:'|m)?\s*(\d+(?:\.\d+)?)?\s*(?:"|s)?\s*([NSEW])?/gi;
  const dmsParts: { num: number; dir?: string; origDeg: number }[] = [];
  let dm: RegExpExecArray | null;
  while ((dm = dmsRegex.exec(norm)) !== null) {
    // dm[1] = degrees, dm[2] = minutes (optional), dm[3] = seconds (optional), dm[4] = direction (optional)
    const deg = parseFloat(dm[1] as string);
    const min = dm[2] ? parseFloat(dm[2] as string) : 0;
    const sec = dm[3] ? parseFloat(dm[3] as string) : 0;
    const dir = dm[4]?.toUpperCase();
    const decimal = Math.abs(deg) + min / 60 + sec / 3600;
    dmsParts.push({ num: decimal, dir, origDeg: deg });
    if (dmsParts.length >= 2) break;
  }

  if (dmsParts.length >= 2) {
    let lat = dmsParts[0]!.num * (dmsParts[0]!.origDeg < 0 ? -1 : 1);
    let lon = dmsParts[1]!.num * (dmsParts[1]!.origDeg < 0 ? -1 : 1);
    const d0 = dmsParts[0]!.dir;
    const d1 = dmsParts[1]!.dir;
    if (d0 === "S") lat = -Math.abs(lat);
    if (d0 === "N") lat = Math.abs(lat);
    if (d1 === "W") lon = -Math.abs(lon);
    if (d1 === "E") lon = Math.abs(lon);
    return [lat, lon];
  }

  // Next: match number tokens with optional trailing direction letter (decimal degrees)
  const regex = /([+-]?\d+(?:\.\d+)?)(?:\s*°)?\s*([NSEW])?/gi;
  const parts: { num: number; dir?: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(norm)) !== null) {
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
  const nums = norm.match(/-?\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2) {
    let lat = parseFloat(nums[0] as string);
    let lon = parseFloat(nums[1] as string);
    // Apply sign hints if the text contains letters
    if (/[sS]/.test(norm) && !/[nN]/.test(norm)) lat = -Math.abs(lat);
    if (/[wW]/.test(norm) && !/[eE]/.test(norm)) lon = -Math.abs(lon);
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

  savedCoords.value = {
    lat: parsed[0],
    long: parsed[1],
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

  gettingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      gettingLocation.value = false;
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
      gettingLocation.value = false;
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
  runCheck();
});
</script>

<style scoped></style>
