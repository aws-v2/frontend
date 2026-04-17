<script setup lang="ts">
defineProps<{
    title: string
    showInfo?: boolean
}>()
</script>

<template>
    <div
        class="bg-white border-2 border-[#eaeded] flex flex-col group relative overflow-hidden font-urbanist transition-all hover:border-[#232f3e]">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-5 border-b-2 border-[#eaeded] bg-[#fafafa]">
            <div class="flex items-center gap-3">
                <h3 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em]">
                    {{ title }}
                </h3>
                <span v-if="showInfo" class="text-[#879196] hover:text-[#ff9900] cursor-pointer transition-colors p-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
            </div>

            <button class="p-1.5 text-[#879196] hover:text-[#232f3e] hover:bg-[#eaeded] transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto relative z-10 scrollbar-hide">
            <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer"
            class="px-8 py-4 border-t-2 border-[#eaeded] bg-[#fafafa] text-[9px] font-black uppercase tracking-[0.2em] text-[#879196] hover:text-[#ff9900] transition-colors cursor-pointer text-center">
            <slot name="footer" />
        </div>
    </div>
</template>
