<script setup lang="ts">
import type { EngineType } from '../types/database'

defineProps<{
    engine: EngineType
    selected: boolean
    description?: string
}>()

const emit = defineEmits<{
    select: []
}>()
</script>

<template>
    <div @click="emit('select')"
        class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2 flex items-center gap-4"
        :class="selected ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
        <div class="flex-shrink-0">
            <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                :class="selected ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                <div v-if="selected" class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
            </div>
        </div>
        <div class="flex-grow">
            <h4 class="text-xs font-bold text-gray-800">{{ engine }}</h4>
            <p v-if="description" class="text-[10px] text-gray-500 leading-tight mt-0.5">{{ description }}</p>
        </div>
    </div>
</template>
