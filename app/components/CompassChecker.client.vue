<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div
      class="md:bg-gray-100 md:shadow-sm md:rounded-lg p-4 w-full md:w-auto text-center"
    >
      <div v-if="compassWorking === null">
        <p>Checking your device capabilities</p>
        <p>Please wait</p>
      </div>
      <div v-else-if="compassWorking !== null" class="text-orange-700">
        <div v-if="!compassWorking">
          <p>Your browser cannot access Device Orientation events.</p>
          <p class="mb-2">Compass functionality will be unavailable</p>
          <button class="p-2 bg-sky-600 text-white rounded" @click="emitResult">
            Get Location
          </button>
        </div>
        <div v-else>Openning map...</div>
      </div>
      <div
        v-else-if="isIOS && !permissionRequested"
        class="flex flex-col gap-2 items-center"
      >
        <p>
          This device may require permission to access motion sensors for
          compass functionality.
        </p>

        <button
          class="p-2 bg-sky-600 text-white rounded"
          @click="requestPermission"
        >
          Allow Motion Access
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type CompassCheckResult = {
  /** was compass functionality available? */
  available: boolean;
  /** the event listener name to use on window */
  eventlistener: string;
};

const emit = defineEmits<{
  (e: "result", result: CompassCheckResult): void;
}>();

const compassSupported = ref<boolean | null>(null);
const compassWorking = ref<boolean | null>(null);
const isIOS = ref(false);
const permissionGranted = ref(false);
const permissionRequested = ref(false);

function getEventListenerName() {
  return isIOS.value ? "deviceorientation" : "deviceorientationabsolute";
}

function emitResult() {
  emit("result", {
    available: !!compassWorking.value,
    eventlistener: getEventListenerName(),
  });
}

function testOrientationAvailable() {
  let failTimeout: number | undefined = undefined;

  function onOrientationData() {
    clearTimeout(failTimeout);
    compassWorking.value = true;
    window.removeEventListener(getEventListenerName(), onOrientationData, true);
    emitResult();
  }

  window.addEventListener(getEventListenerName(), onOrientationData, true);

  failTimeout = setTimeout(() => {
    compassWorking.value = false;
    window.removeEventListener(getEventListenerName(), onOrientationData, true);
  }, 600);
}

async function requestPermission() {
  permissionRequested.value = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = (DeviceOrientationEvent as any).requestPermission;
    // iOS 13+ requires a user gesture and explicit permission
    if (typeof req === "function") {
      const response = await req();
      if (response === "granted") {
        permissionGranted.value = true;
        testOrientationAvailable();
      } else {
        compassSupported.value = false;
      }
    } else {
      // If requestPermission doesn't exist, fallback to listening
      testOrientationAvailable();
      permissionGranted.value = true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    compassSupported.value = false;
  }
}

onMounted(() => {
  isIOS.value =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /AppleWebKit/.test(navigator.userAgent);

  const hasDeviceOrientation =
    "DeviceOrientationEvent" in window || "ondeviceorientation" in window;
  compassSupported.value = !!hasDeviceOrientation;

  if (isIOS.value) {
    // do not automatically request; show a button instead
    return;
  }

  // Non-iOS: try to listen to the best event available
  // Prefer deviceorientationabsolute if available
  try {
    testOrientationAvailable();
    permissionGranted.value = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    compassSupported.value = false;
  }
});
</script>

<style scoped></style>
