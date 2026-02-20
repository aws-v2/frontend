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
    <div
        class="bg-white border-2 border-[#eaeded] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden group italic">
        <div
            class="absolute -top-10 -right-10 w-48 h-48 bg-[#ff9900]/5 rounded-full blur-3xl transition-all group-hover:bg-[#ff9900]/10">
        </div>

        <div class="relative">
            <h2 class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.3em] mb-3 italic">Workspace Financial
                Summary</h2>
            <div class="flex items-baseline gap-4">
                <span
                    class="text-5xl font-black text-[#232f3e] tracking-tighter italic uppercase underline decoration-[#ff9900]/30 decoration-4 underline-offset-8">{{
                    currency || 'KES' }} {{ cost.toFixed(2) }}</span>
                <span v-if="changePercent"
                    class="text-[11px] font-black px-3 py-1 bg-[#fafafa] border-2 border-[#eaeded] uppercase italic tracking-widest"
                    :class="changePercent > 0 ? 'text-rose-500' : 'text-[#ff9900]'">
                    {{ changePercent > 0 ? '▲' : '▼' }} {{ Math.abs(changePercent) }}% <span
                        class="text-[#545b64] font-bold ml-1">VS PREVIOUS</span>
                </span>
            </div>
        </div>

        <div class="flex flex-wrap gap-6 items-center mt-8 md:mt-0 relative">
            <div v-if="dataSaverOn"
                class="flex items-center gap-4 bg-[#fafafa] px-6 py-2.5 border-2 border-[#eaeded] shadow-sm">
                <span class="w-2.5 h-2.5 bg-[#ff9900] rotate-45 animate-pulse"></span>
                <span class="text-[10px] font-black uppercase tracking-widest text-[#545b64] italic">Data Saver: <span
                        class="text-[#ff9900]">Optimized</span></span>
            </div>

            <button @click="emit('topUp')"
                class="bg-[#ff9900] text-[#232f3e] px-10 py-3 font-black shadow-xl shadow-[#ff9900]/20 hover:bg-[#ff9900]/90 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs italic">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deploy Funds (M-PESA)
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Removed legacy glassmorphism */
</style>
