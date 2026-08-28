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
  capabilityFor,
  getOrientationPermissionRequester,
  probeOrientationEvent,
  NO_COMPASS,
  type CompassCapability,
} from "@/utils/orientation";

const emit = defineEmits<{
  (
    e: "result",
    result: CompassCapability,
    /**
     * `provisional` means this answer was not measured just now: it came from
     * a previous launch, or the user chose not to wait. The caller should
     * confirm it against the device in the background.
     */
    meta: { provisional: boolean },
  ): void;
}>();

const { t } = useI18n();
const { lastKnown, remember } = useSavedCompass();

type Phase = "probing" | "needs-permission" | "unavailable" | "done";

const phase = ref<Phase>("probing");

// One controller per probe. A shared one stays aborted once used, which would
// leave any later probe resolving instantly and the UI stuck on "probing".
let currentProbe: AbortController | null = null;

function announce(capability: CompassCapability, provisional: boolean) {
  phase.value = "done";
  emit("result", capability, { provisional });
}

async function probe() {
  currentProbe?.abort();
  const attempt = new AbortController();
  currentProbe = attempt;
  phase.value = "probing";

  const eventlistener = await probeOrientationEvent(undefined, attempt.signal);
  if (attempt.signal.aborted) return;
  currentProbe = null;

  const capability = capabilityFor(eventlistener);
  // Record what was actually measured, misses included: the miss is what lets
  // the next launch skip this wait.
  remember(capability);

  if (!capability.available) {
    phase.value = "unavailable";
    return;
  }
  announce(capability, false);
}

async function requestPermission() {
  const request = getOrientationPermissionRequester();
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
  if (getOrientationPermissionRequester()) {
    phase.value = "needs-permission";
    return;
  }
  probe();
}

/**
 * Move on without waiting. Deliberately does not record anything: choosing not
 * to wait says nothing about whether the device has a compass, and storing it
 * as though it did would hide the compass on hardware that works. The answer
 * is marked provisional so the caller measures it properly in the background.
 */
function skipCompass() {
  currentProbe?.abort();
  currentProbe = null;
  announce(NO_COMPASS, true);
}

onMounted(() => {
  if (typeof DeviceOrientationEvent === "undefined") {
    phase.value = "unavailable";
    return;
  }

  // A permission gate has to be answered in this page session, so a remembered
  // answer says nothing about whether events will arrive now. Ask, as before.
  if (getOrientationPermissionRequester()) {
    phase.value = "needs-permission";
    return;
  }

  const remembered = lastKnown.value;
  if (remembered) {
    announce(
      remembered.available
        ? { available: true, eventlistener: remembered.eventlistener }
        : NO_COMPASS,
      true,
    );
    return;
  }

  probe();
});

onBeforeUnmount(() => currentProbe?.abort());
</script>

<style scoped></style>
