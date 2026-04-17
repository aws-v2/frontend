<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isOpen: boolean
    currentTags?: { key: string; value: string }[]
}>()

const emit = defineEmits(['close', 'save'])

const tags = ref(props.currentTags?.length ? [...props.currentTags] : [{ key: '', value: '' }])

const addTag = () => {
    tags.value.push({ key: '', value: '' })
}

const removeTag = (index: number) => {
    tags.value.splice(index, 1)
    if (tags.value.length === 0) {
        addTag()
    }
}

const handleSave = () => {
    const validTags = tags.value.filter(t => t.key.trim() !== '')
    emit('save', validTags)
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-bold text-gray-900">Edit tags</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-6">
                <p class="text-sm text-gray-600">
                    Tags are key-value pairs used to categorize resources. For example, you can use tags to categorize
                    your objects by project, task, or team.
                </p>

                <div class="space-y-4">
                    <div v-for="(tag, index) in tags" :key="index" class="flex gap-4 items-end">
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-900 mb-2">Key</label>
                            <input type="text" v-model="tag.key" placeholder="Enter key"
                                class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none focus:border-[var(--aws-blue)]">
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-900 mb-2">Value</label>
                            <input type="text" v-model="tag.value" placeholder="Enter value"
                                class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none focus:border-[var(--aws-blue)]">
                        </div>
                        <button @click="removeTag(index)"
                            class="px-3 py-1.5 text-sm font-bold border border-gray-400 rounded-sm hover:bg-gray-100 mb-[1px]">
                            Remove
                        </button>
                    </div>

                    <button @click="addTag"
                        class="px-4 py-2 text-sm font-bold border border-gray-400 rounded-sm hover:bg-gray-100 transition-colors">
                        Add tag
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="$emit('close')"
                    class="px-4 py-2 text-sm font-bold border border-gray-400 rounded-sm hover:bg-gray-100 transition-colors bg-white">
                    Cancel
                </button>
                <button @click="handleSave"
                    class="px-4 py-2 text-sm font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 transition-colors">
                    Save changes
                </button>
            </div>
        </div>
    </div>
</template>
