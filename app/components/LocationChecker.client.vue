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
          {{ t(parseError) }}
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
import { isValidCoordinates, parseCoordinates } from "@/utils/coordinates";
import {
  checkGeolocationUsable,
  describeGeolocationError,
  isGeolocationGranted,
  lookupPosition,
} from "@/utils/geolocation";

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

const available = ref<boolean | null>(null);
const result = ref<LocationCheckResult | null>(null);
const savedCoords = useLocalStorage<{
  lat: null | number;
  long: null | number;
}>("saved_coords", { lat: null, long: null });
const parseError = ref<MessageKey | null>(null);
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

  result.value = {
    available: false,
    coordinates: [long as number, lat as number],
  };
}

watch(savedCoords, syncManualCoords, { deep: true, immediate: true });

function emitResult() {
  if (!result.value) return;
  // Persist on commit, not on every keystroke: a deep watch on the inputs
  // would otherwise remember half-typed numbers as the start-up position.
  remember(result.value.coordinates);
  emit("result", result.value);
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
    parseError.value = "noClipboard";
    return;
  }

  const parsed = parseCoordinates(text);
  if (!parsed) {
    parseError.value = "parseError";
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

async function requestLocation() {
  if (gettingLocation.value) return;

  locationError.value = checkGeolocationUsable();
  if (locationError.value) {
    available.value = false;
    return;
  }

  gettingLocation.value = true;
  try {
    const coordinates = await lookupPosition(() => {
      waitingForGps.value = true;
    });
    available.value = true;
    result.value = { available: true, coordinates };
    remember(coordinates);
    emitResult();
  } catch (error) {
    available.value = false;
    locationError.value = describeGeolocationError(error);
    // Fall back to whatever the user typed, so the map is still reachable.
    syncManualCoords();
  } finally {
    gettingLocation.value = false;
    waitingForGps.value = false;
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
