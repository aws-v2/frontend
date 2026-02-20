<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    isOpen: boolean
    result: {
        succeededCount: number
        failedCount: number
        totalSize: number
        destination: string
    } | null
}>()

const emit = defineEmits(['close'])

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1000
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const isSuccess = computed(() => (props.result?.failedCount ?? 0) === 0)
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[#232f3e]/20 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div
            class="relative w-full max-w-lg bg-white border-2 border-[#232f3e] shadow-none animate-in fade-in zoom-in-95 duration-200">
            <!-- Subtle Grid -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none">
            </div>

            <div class="relative p-10 italic">
                <div class="flex items-center gap-6 mb-8">
                    <div :class="[
                        'w-14 h-14 flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform',
                        isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
                    ]">
                        <svg v-if="isSuccess" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter">
                            {{ isSuccess ? 'Upload Succeeded' : 'Upload Completed with issues' }}
                        </h3>
                        <p class="text-[11px] text-[#545b64] font-black uppercase tracking-widest mt-1">
                            {{ isSuccess ? 'Deployment fully synchronized' : 'Some items failed to sync' }}
                        </p>
                    </div>
                </div>

                <div class="space-y-6 mb-10">
                    <div class="flex justify-between items-center border-b border-[#eaeded] pb-4">
                        <span class="text-[11px] font-black text-[#545b64] uppercase tracking-widest">Succeeded</span>
                        <span class="text-lg font-black text-[#232f3e]">{{ result?.succeededCount || 0 }} Objects</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-[#eaeded] pb-4">
                        <span class="text-[11px] font-black text-[#545b64] uppercase tracking-widest">Total
                            Magnitude</span>
                        <span class="text-lg font-black text-[#232f3e]">{{ formatSize(result?.totalSize || 0) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[11px] font-black text-[#545b64] uppercase tracking-widest">Destination</span>
                        <span class="text-[13px] font-bold text-[#ff9900] truncate max-w-[240px]">{{ result?.destination
                            }}</span>
                    </div>
                </div>

                <button @click="$emit('close')"
                    class="w-full py-4 bg-[#232f3e] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#ff9900] transition-colors active:scale-[0.98]">
                    Dismiss Manifest
                </button>
            </div>
        </div>
    </div>
</template>
