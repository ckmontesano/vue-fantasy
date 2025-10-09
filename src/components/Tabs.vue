<script setup>
const props = defineProps({
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
  <div class="tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="{ active: modelValue === tab.id }" 
      @click="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  margin: 16px 0;
  display: flex;
  gap: 8px;
}

.tabs button {
  padding: 6px 12px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 2px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
}

.tabs button.active {
  background: var(--color-link);
  color: #fff;
  border-color: var(--color-link);
}

.tabs button:hover:not(.active) {
  background: var(--color-surface);
}
</style>
