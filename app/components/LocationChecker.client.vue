<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div
      class="md:bg-gray-100 md:shadow-sm md:rounded-lg p-4 w-full md:w-auto text-center"
    >
      <div v-if="available === true" class="text-yellow-600">
        <p class="mb-2">{{ t("locationAccessGranted") }}</p>
        <p v-if="result">
          {{ t("latitude") }}: {{ result.coordinates[1].toFixed(6) }},
          {{ t("longitude") }}: {{ result.coordinates[0].toFixed(6) }}
        </p>
        <div class="flex gap-2 justify-center mt-3">
          <button
            class="p-2 border rounded flex items-center justify-center gap-1"
            :disabled="gettingLocation"
            @click="requestLocation"
          >
            {{ t("refresh") }}
            <loading-spinner v-if="gettingLocation" />
          </button>
        </div>
      </div>

      <div v-else-if="available === false" class="text-yellow-600">
        <p class="mb-2">{{ t(locationError ?? "geolocationDenied") }}</p>
        <p class="mb-2">{{ t("enterManually") }}</p>

        <div class="flex gap-2 justify-center mt-3">
          <button
            class="p-2 bg-green-600 text-white rounded disabled:bg-sky-200 disabled:cursor-not-allowed"
            :disabled="!result"
            @click="emitResult"
          >
            {{ t("openMap") }}
          </button>
          <button
            class="p-2 border rounded flex items-center justify-center gap-1"
            :disabled="gettingLocation"
            @click="requestLocation"
          >
            {{ t("tryAgain") }}
            <loading-spinner v-if="gettingLocation" />
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col gap-2 items-center">
        <p class="mb-2">
          {{
            waitingForGps ? t("searchingGps") : t("permissionNeededLocation")
          }}
        </p>
        <div class="flex gap-2">
          <button
            class="p-2 bg-green-600 text-white rounded disabled:bg-sky-200 disabled:cursor-not-allowed"
            :disabled="!result"
            @click="emitResult"
          >
            {{ t("openMap") }}
          </button>
          <button
            class="p-2 bg-sky-600 text-white rounded flex items-center justify-center gap-1"
            :disabled="gettingLocation"
            @click="requestLocation"
          >
            {{ t("getLocation") }}
            <loading-spinner v-if="gettingLocation" />
          </button>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm">{{ t("manualCoordsLabel") }}</label>
        <div class="flex gap-2 mt-2 justify-center">
          <input
            v-model.number="savedCoords.lat"
            type="number"
            step="any"
            :placeholder="t('latitude')"
            class="p-2 border rounded w-32"
          />
          <input
            v-model.number="savedCoords.long"
            type="number"
            step="any"
            :placeholder="t('longitude')"
            class="p-2 border rounded w-32"
          />
          <button
            class="p-2 bg-gray-200 rounded"
            :title="t('pasteTitle')"
            @click="pasteCoordinates"
          >
            {{ t("paste") }}
          </button>
        </div>
        <p v-if="parseError" class="text-red-600 mt-2 text-sm">
          {{ parseError }}
        </p>
        <p v-else-if="manualCoordsInvalid" class="text-red-600 mt-2 text-sm">
          {{ t("invalidCoords") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageKey } from "~/i18n/messages";

export type LocationCheckResult = {
  /** is GPS location available and allowed? */
  available: boolean;
  /** contains last fetched gps location coordinates or user's manually entered coords */
  coordinates: [number, number];
};

const emit = defineEmits<{
  (e: "result", result: LocationCheckResult): void;
}>();

const { t } = useI18n();
const { lastKnown, remember } = useSavedLocation();

// GeolocationPositionError codes. Spelled out rather than read off the global,
// which older WebKit does not expose under that name.
const PERMISSION_DENIED = 1;
const POSITION_TIMEOUT = 3;

/**
 * Two-stage lookup. The first stage accepts a recent cached or network fix so
 * the map opens straight away where one exists. The second waits on a real GPS
 * fix, which on a phone without a network-location backend (de-Googled Android,
 * or a browser that blocks the network provider) routinely takes far longer
 * than a few seconds from cold. Asking for high accuracy on a short timeout,
 * as this used to, guarantees a timeout on exactly those devices.
 */
const COARSE_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8_000,
  maximumAge: 60_000,
};
const PRECISE_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 60_000,
  maximumAge: 0,
};

const available = ref<boolean | null>(null);
const result = ref<LocationCheckResult | null>(null);
const savedCoords = useLocalStorage<{
  lat: null | number;
  long: null | number;
}>("saved_coords", { lat: null, long: null });
const parseError = ref<string | null>(null);
const gettingLocation = ref(false);
const waitingForGps = ref(false);
const locationError = ref<MessageKey | null>(null);

function isValidCoordinate(lat: unknown, long: unknown): boolean {
  return isValidCoordinates([long, lat]);
}

const manualCoordsEntered = computed(
  () => savedCoords.value.lat != null || savedCoords.value.long != null,
);
const manualCoordsInvalid = computed(
  () =>
    manualCoordsEntered.value &&
    !isValidCoordinate(savedCoords.value.lat, savedCoords.value.long),
);

/**
 * Keep `result` in step with the manual inputs. `savedCoords` holds an object
 * that `v-model` mutates in place, so this has to watch deeply: a shallow watch
 * never fires and the "Open Map" button stays disabled no matter what the user
 * types, until a reload happens to read the value back out of local storage.
 */
function syncManualCoords() {
  // A live fix is more trustworthy than typed coordinates.
  if (available.value === true) return;

  const { lat, long } = savedCoords.value;
  if (!isValidCoordinate(lat, long)) {
    result.value = null;
    return;
  }

  const coordinates: [number, number] = [long as number, lat as number];
  result.value = { available: false, coordinates };
  remember(coordinates);
}

watch(savedCoords, syncManualCoords, { deep: true, immediate: true });

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
      text = window.prompt(t("pastePrompt"));
    }
  } catch {
    // If clipboard access fails, fallback to prompt
    text = window.prompt(t("pastePrompt"));
  }

  if (!text) {
    parseError.value = t("noClipboard");
    return;
  }

  const parsed = parseClipboardToCoords(text);
  if (!parsed) {
    parseError.value = t("parseError");
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

function getCurrentPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Map a failure onto something the user can act on. Reporting every failure as
 * "permission denied", as this used to, sends people to their browser settings
 * when the real problem is a GPS that has not got a fix yet.
 */
function describeError(error: unknown): MessageKey {
  switch ((error as GeolocationPositionError | undefined)?.code) {
    case PERMISSION_DENIED:
      return "locationDenied";
    case POSITION_TIMEOUT:
      return "locationTimeout";
    default:
      return "locationUnavailable";
  }
}

async function requestLocation() {
  if (gettingLocation.value) return;

  locationError.value = null;

  if (!("geolocation" in navigator)) {
    available.value = false;
    locationError.value = "locationUnavailable";
    return;
  }

  // Browsers only expose geolocation over https (localhost aside), and they
  // report the refusal as a plain position error, which is impossible to act on.
  if (!window.isSecureContext) {
    available.value = false;
    locationError.value = "locationInsecure";
    return;
  }

  gettingLocation.value = true;
  try {
    let position: GeolocationPosition;
    try {
      position = await getCurrentPosition(COARSE_OPTIONS);
    } catch (error) {
      // No amount of waiting turns a refusal into a fix.
      if (
        (error as GeolocationPositionError | undefined)?.code ===
        PERMISSION_DENIED
      ) {
        throw error;
      }
      waitingForGps.value = true;
      position = await getCurrentPosition(PRECISE_OPTIONS);
    }

    const coordinates: [number, number] = [
      position.coords.longitude,
      position.coords.latitude,
    ];
    available.value = true;
    result.value = { available: true, coordinates };
    remember(coordinates);
    emitResult();
  } catch (error) {
    available.value = false;
    locationError.value = describeError(error);
    // Fall back to whatever the user typed, so the map is still reachable.
    syncManualCoords();
  } finally {
    gettingLocation.value = false;
    waitingForGps.value = false;
  }
}

/**
 * Whether the browser will hand over a position without interrupting the user.
 * Treated as unknown rather than denied when the Permissions API is missing or
 * refuses to answer, since the request itself is the reliable test.
 */
async function isGeolocationGranted(): Promise<boolean | null> {
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

onMounted(async () => {
  const remembered = lastKnown.value;
  if (!remembered) {
    requestLocation();
    return;
  }

  // Open the map on the remembered position straight away. index.vue keeps
  // watching the live position from there, so a fresh fix replaces this one as
  // soon as it lands, and the browser raises its own permission prompt if it
  // still needs one. Skip the live watch only when permission is already known
  // to be refused, which no amount of waiting will change.
  const granted = await isGeolocationGranted();
  available.value = granted === true ? true : null;
  result.value = {
    available: granted !== false,
    coordinates: remembered.coordinates,
  };
  emitResult();
});
</script>

<style scoped></style>
