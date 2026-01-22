<template>
  <div class="time-range-dropdown">
    <div 
      v-for="range in ranges" 
      :key="range"
      :class="['range-item', { active: range === currentRange }]"
      @click="$emit('select', range)"
    >
      <span class="label">{{ range }}</span>
      <span v-if="range === currentRange" class="check">✓</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentRange: string
}>()

defineEmits(['select'])

const ranges = [
  'Last 12 hours',
  'Last 24 hours',
  'Last 2 days',
  'Last 7 days',
  'Last 14 days',
  'Last 30 days'
]
</script>

<style scoped>
.time-range-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background-color: #0c0c0c;
  border: 1px solid #333;
  border-radius: 4px;
  width: 240px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 1000;
  padding: 4px 0;
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #999;
}

.range-item:hover {
  background-color: #111;
  color: #fff;
}

.range-item.active {
  background-color: #1a1033;
  color: #fff;
}

.check {
  color: #7b3fe4;
  font-size: 12px;
}

.range-item.active .label {
  font-weight: 500;
}
</style>
