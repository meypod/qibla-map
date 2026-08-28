<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div
      class="md:bg-gray-100 md:shadow-sm md:rounded-lg p-4 w-full md:w-auto text-center"
    >
      <div v-if="phase === 'probing'">
        <p>{{ t("checkingCapabilities") }}</p>
        <p>{{ t("pleaseWait") }}</p>
      </div>

      <div
        v-else-if="phase === 'needs-permission'"
        class="flex flex-col gap-2 items-center"
      >
        <p>{{ t("permissionNeededMotion") }}</p>
        <div class="flex gap-2">
          <button
            class="p-2 bg-sky-600 text-white rounded"
            @click="requestPermission"
          >
            {{ t("allowMotion") }}
          </button>
          <button class="p-2 border rounded" @click="skipCompass">
            {{ t("continueWithoutCompass") }}
          </button>
        </div>
      </div>

      <div v-else-if="phase === 'unavailable'" class="text-orange-700">
        <p>{{ t("noOrientation") }}</p>
        <p>{{ t("compassUnavailable") }}</p>
        <p class="mb-2 text-sm">{{ t("compassBlockedHint") }}</p>
        <div class="flex gap-2 justify-center">
          <button class="p-2 border rounded" @click="retry">
            {{ t("tryAgain") }}
          </button>
          <button
            class="p-2 bg-sky-600 text-white rounded"
            @click="skipCompass"
          >
            {{ t("continueWithoutCompass") }}
          </button>
        </div>
      </div>

      <div v-else class="text-orange-700">{{ t("openingMap") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ORIENTATION_EVENTS,
  readMagneticHeading,
  type OrientationEventName,
} from "@/utils/orientation";

export type CompassCheckResult = {
  /** was compass functionality available? */
  available: boolean;
  /** the event to listen to on window, or null when there is no compass */
  eventlistener: OrientationEventName | null;
};

const emit = defineEmits<{
  (e: "result", result: CompassCheckResult): void;
}>();

const { t } = useI18n();

/**
 * Sensors take time to spin up, and hardened browsers put a permission prompt
 * in front of them. A short probe expires before either can finish and reports
 * a working compass as dead, with no way back. Wait long enough that a slow but
 * healthy sensor still wins.
 */
const PROBE_TIMEOUT_MS = 4000;

type Phase = "probing" | "needs-permission" | "unavailable" | "done";

const phase = ref<Phase>("probing");

let stopProbe: (() => void) | null = null;

/**
 * iOS 13+ (and a handful of Android builds) gate orientation events behind an
 * explicit grant that may only be requested from a user gesture.
 */
function getPermissionRequester(): (() => Promise<PermissionState>) | null {
  if (typeof DeviceOrientationEvent === "undefined") return null;
  const request = (
    DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<PermissionState>;
    }
  ).requestPermission;
  return typeof request === "function"
    ? () => request.call(DeviceOrientationEvent)
    : null;
}

/**
 * Listen to every orientation event at once and take the first that yields a
 * heading referenced to north. Which event that is varies by browser, and the
 * one that answers is the one the map has to subscribe to later.
 */
function probe() {
  stopProbe?.();
  phase.value = "probing";

  const teardown: (() => void)[] = [];
  const stop = () => {
    for (const undo of teardown.splice(0)) undo();
    stopProbe = null;
  };

  for (const name of ORIENTATION_EVENTS) {
    const listener = (event: Event) => {
      if (readMagneticHeading(event) === null) return;
      stop();
      phase.value = "done";
      emit("result", { available: true, eventlistener: name });
    };
    window.addEventListener(name, listener, true);
    teardown.push(() => window.removeEventListener(name, listener, true));
  }

  const timer = setTimeout(() => {
    stop();
    phase.value = "unavailable";
  }, PROBE_TIMEOUT_MS);
  teardown.push(() => clearTimeout(timer));

  stopProbe = stop;
}

async function requestPermission() {
  const request = getPermissionRequester();
  if (!request) {
    probe();
    return;
  }

  try {
    const response = await request();
    if (response === "granted") probe();
    else phase.value = "unavailable";
  } catch {
    phase.value = "unavailable";
  }
}

function retry() {
  if (getPermissionRequester()) {
    phase.value = "needs-permission";
    return;
  }
  probe();
}

function skipCompass() {
  stopProbe?.();
  phase.value = "done";
  emit("result", { available: false, eventlistener: null });
}

onMounted(() => {
  if (typeof DeviceOrientationEvent === "undefined") {
    phase.value = "unavailable";
    return;
  }

  if (getPermissionRequester()) {
    phase.value = "needs-permission";
    return;
  }

  probe();
});

onBeforeUnmount(() => stopProbe?.());
</script>

<style scoped></style>
