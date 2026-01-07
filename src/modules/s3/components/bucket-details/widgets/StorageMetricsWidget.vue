<script setup lang="ts">
defineProps<{
    storageUsed: string
    changePercent?: number
    usagePercent?: number
}>()
</script>

<template>
    <div class="border border-gray-200 rounded-sm bg-white p-4 flex flex-col justify-between">
        <div>
            <h2 class="text-sm font-bold text-gray-900 mb-1">Storage Used</h2>
            <p class="text-xs text-gray-500">Total bytes in standard storage</p>
        </div>
        <div class="flex items-end gap-2 mt-4">
            <span class="text-2xl font-bold text-gray-900">{{ storageUsed }}</span>
            <span v-if="changePercent" class="text-xs font-bold mb-1"
                :class="changePercent > 0 ? 'text-green-600' : 'text-red-600'">
                {{ changePercent > 0 ? '▲' : '▼' }} {{ Math.abs(changePercent) }}%
            </span>
        </div>
        <div class="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-[var(--aws-blue)]" :style="{ width: `${usagePercent || 25}%` }"></div>
        </div>
    </div>
</template>
