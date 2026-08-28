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
  (e: "result", result: CompassCapability): void;
}>();

const { t } = useI18n();

type Phase = "probing" | "needs-permission" | "unavailable" | "done";

const phase = ref<Phase>("probing");

const probeAbort = new AbortController();

function finish(capability: CompassCapability) {
  phase.value = "done";
  emit("result", capability);
}

async function probe() {
  phase.value = "probing";
  const eventlistener = await probeOrientationEvent(
    undefined,
    probeAbort.signal,
  );
  if (probeAbort.signal.aborted) return;

  if (!eventlistener) {
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

  if (getOrientationPermissionRequester()) {
    phase.value = "needs-permission";
    return;
  }

  probe();
});

onBeforeUnmount(() => probeAbort.abort());
</script>

<style scoped></style>
