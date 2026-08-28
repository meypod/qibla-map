<template>
  <dialog
    ref="dialog"
    class="p-4 rounded-lg shadow-lg max-w-sm w-[90vw] backdrop:bg-black/50"
    @cancel.prevent="emit('close')"
    @close="emit('close')"
  >
    <h2 class="text-lg mb-2">{{ t("setLocationManually") }}</h2>
    <p class="mb-3 text-sm text-yellow-700">{{ t(reason) }}</p>

    <div class="flex gap-2 items-end justify-center">
      <label class="flex flex-col gap-1 text-sm text-start">
        {{ t("latitude") }}
        <input
          v-model.number="lat"
          type="number"
          step="any"
          class="p-2 border rounded w-28"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-start">
        {{ t("longitude") }}
        <input
          v-model.number="long"
          type="number"
          step="any"
          class="p-2 border rounded w-28"
        />
      </label>
      <button
        class="p-2 bg-gray-200 rounded"
        :title="t('pasteTitle')"
        @click="pasteCoordinates"
      >
        {{ t("paste") }}
      </button>
    </div>

    <p v-if="error" class="text-red-600 mt-2 text-sm">{{ t(error) }}</p>

    <div class="flex gap-2 justify-end mt-4">
      <button class="p-2 border rounded" @click="emit('close')">
        {{ t("cancel") }}
      </button>
      <button
        class="p-2 bg-green-600 text-white rounded disabled:bg-sky-200 disabled:cursor-not-allowed"
        :disabled="!coordinates"
        @click="save"
      >
        {{ t("save") }}
      </button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import type { MessageKey } from "~/i18n/messages";
import { isValidCoordinates, parseCoordinates } from "@/utils/coordinates";

const props = defineProps<{
  /** why the app is asking, e.g. the geolocation failure that led here */
  reason: MessageKey;
  /** coordinates to start from, as [longitude, latitude] */
  initial: [number, number] | null;
}>();

const emit = defineEmits<{
  (e: "submit", coordinates: [number, number]): void;
  (e: "close"): void;
}>();

const { t } = useI18n();

const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const lat = ref<number | null>(props.initial?.[1] ?? null);
const long = ref<number | null>(props.initial?.[0] ?? null);
const error = ref<MessageKey | null>(null);

const coordinates = computed<[number, number] | null>(() => {
  const candidate = [long.value, lat.value] as [number, number];
  return isValidCoordinates(candidate) ? candidate : null;
});

async function pasteCoordinates() {
  error.value = null;

  let text: string | null = null;
  try {
    text = await navigator.clipboard.readText();
  } catch {
    // Clipboard reads need permission the browser may refuse, and Safari only
    // allows them straight off a gesture. Asking outright always works.
    text = window.prompt(t("pastePrompt"));
  }

  if (!text) {
    error.value = "noClipboard";
    return;
  }

  const parsed = parseCoordinates(text);
  if (!parsed) {
    error.value = "parseError";
    return;
  }

  lat.value = parsed[0];
  long.value = parsed[1];
}

function save() {
  if (!coordinates.value) {
    error.value = "invalidCoords";
    return;
  }
  emit("submit", coordinates.value);
}

// showModal gives focus trapping, Esc, and the backdrop for free.
onMounted(() => dialog.value?.showModal());
</script>

<style scoped></style>
