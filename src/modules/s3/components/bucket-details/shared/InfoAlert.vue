<script setup lang="ts">
defineProps<{
    message: string
    title?: string
    type?: 'info' | 'warning'
    showButton?: boolean
    buttonLabel?: string
}>()

const emit = defineEmits<{
    action: []
}>()
</script>

<template>
    <div :class="[
        'border rounded-sm p-3 flex gap-2',
        type === 'warning' ? 'border-yellow-500 bg-yellow-50/10' : 'border-[var(--aws-blue)] bg-blue-50/10'
    ]">
        <svg class="w-5 h-5 shrink-0 mt-0.5" :class="type === 'warning' ? 'text-yellow-600' : 'text-[var(--aws-blue)]'"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
            <h4 v-if="title" class="text-xs font-bold text-gray-900 mb-1">{{ title }}</h4>
            <p class="text-xs text-gray-600" v-html="message"></p>
        </div>
        <button v-if="showButton" @click="emit('action')"
            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50 self-start">
            {{ buttonLabel || 'Action' }}
        </button>
    </div>
</template>
