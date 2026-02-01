<script setup lang="ts">
defineProps<{
    title: string
    showInfo?: boolean
}>()
</script>

<template>
    <div class="bg-black border border-white/5 flex flex-col h-full group relative shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505] cursor-move">
            <div class="flex items-center gap-4">
                <div class="flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div class="w-4 h-[1px] bg-white"></div>
                    <div class="w-2 h-[1px] bg-white"></div>
                </div>
                <h3
                    class="text-[10px] font-black text-white/60 group-hover:text-white uppercase tracking-[0.4em] transition-colors">
                    {{ title }}</h3>
                <span v-if="showInfo"
                    class="text-[9px] font-black text-[#007AFF] uppercase tracking-widest cursor-pointer opacity-70 hover:opacity-100 transition-opacity underline underline-offset-4">Spec_Info</span>
            </div>

            <button class="text-white/20 hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="square" stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto relative z-10">
            <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer"
            class="px-6 py-4 border-t border-white/5 bg-[#050505] text-[9px] font-black text-[#007AFF] uppercase tracking-[0.3em] hover:text-white transition-all cursor-pointer">
            <slot name="footer" />
        </div>

        <!-- Monolithic Detail (Top Line Glow) -->
        <div
            class="absolute top-0 right-0 w-16 h-[2px] bg-[#007AFF] opacity-0 group-hover:opacity-100 transition-all duration-700">
        </div>
    </div>
</template>

<style scoped>
.cursor-move {
    cursor: crosshair;
}
</style>
