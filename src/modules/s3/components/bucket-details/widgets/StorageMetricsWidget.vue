<script setup lang="ts">
const props = defineProps<{
    totalSize: number
    totalFiles?: number
    totalFolders?: number
    changePercent?: number
    usagePercent?: number
}>()

const formatSize = (bytes: number) => {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    if (i < 0 || isNaN(i)) return '0 B'
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
    <div
        class="bg-white border-2 border-[#eaeded] p-8 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#ff9900]/30 transition-all shadow-sm">
        <div class="absolute inset-0 bg-[#ff9900]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h2 class="text-[11px] font-black text-[#ff9900] uppercase tracking-[0.2em] mb-3 italic">Storage
                        Used</h2>
                    <p class="text-[11px] text-[#545b64] font-bold uppercase tracking-widest">Standard storage capacity
                    </p>
                </div>
                <div v-if="totalFiles !== undefined" class="text-right">
                    <p class="text-[9px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-2">Bucket Assets</p>
                    <p
                        class="text-sm font-black text-[#232f3e] flex items-center justify-end gap-2 uppercase tracking-tight italic">
                        <span class="text-[#ff9900] underline decoration-2 decoration-[#ff9900]/30">{{ totalFiles
                            }}</span>
                        <span class="text-[10px] text-[#545b64] font-black">objects</span>
                        <span class="mx-1 text-[#eaeded] font-normal not-italic">/</span>
                        <span class="text-[#232f3e]">{{ totalFolders || 0 }}</span>
                        <span class="text-[10px] text-[#545b64] font-black">folders</span>
                    </p>
                </div>
            </div>
        </div>
        <div class="flex items-end gap-4 mb-8 relative z-10">
            <span class="text-5xl font-black text-[#232f3e] tracking-tighter italic">{{ formatSize(totalSize) }}</span>
            <span v-if="changePercent"
                class="text-[10px] font-black mb-2 px-3 py-1 border-2 border-[#eaeded] uppercase tracking-widest italic"
                :class="changePercent > 0 ? 'text-rose-500 bg-rose-50' : 'text-[#ff9900] bg-[#fafafa]'">
                {{ changePercent > 0 ? '▲' : '▼' }} {{ Math.abs(changePercent) }}%
            </span>
        </div>
        <div class="relative pt-6 z-10">
            <div class="h-2 bg-[#fafafa] border-2 border-[#eaeded] overflow-hidden">
                <div class="h-full bg-[#ff9900] transition-all duration-1000 ease-out"
                    :style="{ width: `${usagePercent || 25}%` }"></div>
            </div>
            <div class="flex justify-between mt-3">
                <span class="text-[9px] text-[#545b64] font-black uppercase tracking-[0.2em]">0%</span>
                <span class="text-[9px] text-[#ff9900] font-black uppercase tracking-[0.2em] italic">{{ usagePercent ||
                    25 }}%
                    utilization</span>
                <span class="text-[9px] text-[#545b64] font-black uppercase tracking-[0.2em]">100%</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Removed glass-panel styles */
</style>
