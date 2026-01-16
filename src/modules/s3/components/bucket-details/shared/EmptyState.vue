<script setup lang="ts">
defineProps<{
    title: string
    message: string
    buttonLabel?: string
    showButton?: boolean
}>()

const emit = defineEmits<{
    action: []
}>()
</script>

<template>
    <div class="p-8 text-center text-gray-600">
        <p class="text-sm font-bold mb-1">{{ title }}</p>
        <p class="text-xs mb-4">{{ message }}</p>
        <button v-if="showButton" @click="emit('action')"
            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">
            {{ buttonLabel || 'Get Started' }}
        </button>
    </div>
</template>
