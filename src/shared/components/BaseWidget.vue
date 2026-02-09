<script setup lang="ts">
defineProps<{
    title: string
    showInfo?: boolean
}>()
</script>

<template>
    <div class="glass-card rounded-xl flex flex-col h-full group relative overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div class="flex items-center gap-3">
                <h3 class="text-sm font-bold text-white tracking-wide font-display">
                    {{ title }}
                </h3>
                <span v-if="showInfo" class="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
            </div>

            <button class="text-slate-500 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto relative z-10">
            <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-6 py-3 border-t border-white/5 bg-white/[0.02] text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">
            <slot name="footer" />
        </div>
    </div>
</template>
