<script setup lang="ts">
defineProps<{
    title: string
    showInfo?: boolean
}>()
</script>

<template>
    <div class="bg-white dark:bg-gray-800 border border-[var(--border-main)] flex flex-col h-full group">
        <!-- Header -->
        <div
            class="flex items-center justify-between px-4 py-2 border-b border-[var(--border-main)] bg-gray-50/50 dark:bg-gray-900/50 cursor-move">
            <div class="flex items-center gap-2">
                <div class="grid grid-cols-2 gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                    <div v-for="i in 4" :key="i" class="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">{{ title }}</h3>
                <span v-if="showInfo"
                    class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer">Info</span>
            </div>

            <button class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto">
            <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer"
            class="px-4 py-2 border-t border-[var(--border-main)] text-[10px] font-bold text-[var(--aws-blue)] hover:underline cursor-pointer">
            <slot name="footer" />
        </div>

        <!-- Resize Handle -->
        <div
            class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-50 transition-opacity">
            <svg class="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 19L5 5" />
            </svg>
        </div>
    </div>
</template>

<style scoped>
.cursor-move {
    cursor: grab;
}

.cursor-move:active {
    cursor: grabbing;
}
</style>
