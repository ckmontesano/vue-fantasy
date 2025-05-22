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
  border: 1px solid #000;
  background: #e0e0e0;
  color: #000;
  cursor: pointer;
  border-radius: 2px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
}

.tabs button.active {
  background: #000;
  color: #fff;
}

.tabs button:hover:not(.active) {
  background: #d0d0d0;
}
</style> 