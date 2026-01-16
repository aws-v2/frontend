<script setup lang="ts">
defineProps<{
    cost: number
    currency?: string
    changePercent?: number
    dataSaverOn?: boolean
}>()

const emit = defineEmits<{
    topUp: []
}>()
</script>

<template>
    <div class="bg-[var(--aws-blue)] text-white p-4 rounded-sm shadow-sm flex justify-between items-center">
        <div>
            <h2 class="text-lg font-bold">Workspace Overview</h2>
            <div class="flex items-baseline gap-2">
                <p class="text-sm opacity-90">Current Est. Cost:</p>
                <span class="font-bold text-xl">{{ currency || 'KES' }} {{ cost.toFixed(2) }}</span>
                <span v-if="changePercent" class="text-xs opacity-75">
                    ({{ changePercent > 0 ? '+' : '' }}{{ changePercent }}% vs last month)
                </span>
            </div>
        </div>
        <div class="flex gap-3 items-center">
            <div v-if="dataSaverOn"
                class="flex items-center gap-2 bg-blue-800/30 px-3 py-1 rounded-full border border-blue-400/30">
                <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span class="text-xs font-bold">Data Saver: ON</span>
            </div>
            <button @click="emit('topUp')"
                class="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-sm text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Top Up (M-PESA)
            </button>
        </div>
    </div>
</template>
