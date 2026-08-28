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
  getOrientationPermissionRequester,
  probeOrientationEvent,
  type CompassCapability,
} from "@/utils/orientation";

const emit = defineEmits<{
  (e: "result", result: CompassCapability, meta: { fromCache: boolean }): void;
}>();

const { t } = useI18n();
const { lastKnown, remember } = useSavedCompass();

type Phase = "probing" | "needs-permission" | "unavailable" | "done";

const phase = ref<Phase>("probing");

const probeAbort = new AbortController();

function finish(capability: CompassCapability, fromCache = false) {
  phase.value = "done";
  if (!fromCache) remember(capability);
  emit("result", capability, { fromCache });
}

async function probe() {
  phase.value = "probing";
  const eventlistener = await probeOrientationEvent(
    undefined,
    probeAbort.signal,
  );
  if (probeAbort.signal.aborted) return;

  if (!eventlistener) {
    // Record the miss too: it is what lets the next launch skip this wait.
    remember({ available: false, eventlistener: null });
    phase.value = "unavailable";
    return;
  }
  finish({ available: true, eventlistener });
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

function skipCompass() {
  probeAbort.abort();
  finish({ available: false, eventlistener: null });
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
    // Go straight through on what we knew last time. index.vue re-probes in
    // the background and corrects this if the device has changed since.
    finish(
      {
        available: remembered.available,
        eventlistener: remembered.eventlistener,
      },
      true,
    );
    return;
  }

  probe();
});

onBeforeUnmount(() => probeAbort.abort());
</script>

<style scoped></style>
