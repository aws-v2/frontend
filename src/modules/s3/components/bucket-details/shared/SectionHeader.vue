<script setup lang="ts">
defineProps<{
    title: string
    description?: string
    showEdit?: boolean
    showDelete?: boolean
    showCreate?: boolean
    createLabel?: string
    editLabel?: string
}>()

const emit = defineEmits<{
    edit: []
    delete: []
    create: []
}>()
</script>

<template>
    <div class="p-4 border-b border-gray-200 flex justify-between items-start">
        <div>
            <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
            <p v-if="description" class="text-xs text-gray-600 mt-1" v-html="description"></p>
        </div>
        <div class="flex gap-2">
            <button v-if="showEdit" @click="emit('edit')"
                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">
                {{ editLabel || 'Edit' }}
            </button>
            <button v-if="showDelete" @click="emit('delete')"
                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-900 bg-white hover:bg-gray-50">
                Delete
            </button>
            <button v-if="showCreate" @click="emit('create')"
                class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">
                {{ createLabel || 'Create' }}
            </button>
        </div>
    </div>
</template>
