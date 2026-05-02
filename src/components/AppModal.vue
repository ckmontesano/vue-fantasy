<script setup>
import { onBeforeUnmount, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  maxWidthClass: {
    type: String,
    default: "max-w-md",
  },
});

const emit = defineEmits(["update:modelValue"]);

function closeModal() {
  emit("update:modelValue", false);
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    closeModal();
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof window === "undefined") {
      return;
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeydown);
      return;
    }

    window.removeEventListener("keydown", handleKeydown);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeydown);
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4"
      aria-modal="true"
      role="dialog"
      @click.self="closeModal">
      <div
        class="w-full rounded-lg border border-zinc-300 bg-zinc-100 p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-800 app-modal"
        :class="maxWidthClass">
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-2xl font-semibold tracking-tight">{{ title }}</h2>
          <button
            type="button"
            class="rounded-md border border-zinc-300 px-2 py-1 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            @click="closeModal">
            Close
          </button>
        </div>
        <div class="mt-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
