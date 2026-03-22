<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true,
    // Each tab should be an object with { id: string, label: string }
  },
  modelValue: {
    type: String,
    required: true,
  }
});

const emit = defineEmits(['update:modelValue']);

function selectTab(tabId) {
  emit('update:modelValue', tabId);
}
</script>

<template>
  <div class="my-4 flex flex-wrap gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="rounded-md border px-3 py-1.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none"
      :class="
        modelValue === tab.id
          ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-zinc-950'
          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
      "
      @click="selectTab(tab.id)">
      {{ tab.label }}
    </button>
  </div>
</template>
