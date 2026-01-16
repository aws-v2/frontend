<script setup lang="ts">
const props = defineProps<{
    totalSize: number
    totalFiles?: number
    totalFolders?: number
    changePercent?: number
    usagePercent?: number
}>()

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
    <div
        class="border border-gray-200 rounded-sm bg-white p-4 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
        <div>
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-sm font-bold text-gray-900 mb-1">Storage Used</h2>
                    <p class="text-[10px] text-gray-500">Total bytes in standard storage</p>
                </div>
                <div v-if="totalFiles !== undefined" class="text-right">
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Bucket Content</p>
                    <p class="text-[11px] font-bold text-gray-900">
                        {{ totalFiles }} objects & {{ totalFolders || 0 }} folders
                    </p>
                </div>
            </div>
        </div>
        <div class="flex items-end gap-2 mt-4">
            <span class="text-2xl font-bold text-gray-900">{{ formatSize(totalSize) }}</span>
            <span v-if="changePercent" class="text-xs font-bold mb-1"
                :class="changePercent > 0 ? 'text-[var(--aws-green)]' : 'text-red-600'">
                {{ changePercent > 0 ? '▲' : '▼' }} {{ Math.abs(changePercent) }}%
            </span>
        </div>
        <div class="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-[var(--aws-blue)]" :style="{ width: `${usagePercent || 25}%` }"></div>
        </div>
    </div>
</template>
