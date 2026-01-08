<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isOpen: boolean
    currentStatus?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const isEnabled = ref(props.currentStatus || false)

const handleSave = () => {
    emit('save', isEnabled.value)
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-sm shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-bold text-gray-900">Edit Object Lock</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4">
                <p class="text-sm text-gray-600">
                    Object Lock stores objects using a write-once-read-many (WORM) model to help you prevent objects
                    from being deleted or overwritten for a fixed amount of time or indefinitely.
                </p>

                <div class="p-4 bg-blue-50/50 border border-blue-100 rounded-sm">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-[var(--aws-blue)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-xs text-gray-700 leading-relaxed">
                            Object Lock can only be enabled for objects in buckets that have Object Lock enabled. <b>You
                                cannot enable Object Lock on an existing object if the bucket doesn't support it.</b>
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3 pt-4">
                    <input type="checkbox" v-model="isEnabled" id="objectLock"
                        class="w-4 h-4 text-[var(--aws-blue)] rounded-sm border-gray-300 focus:ring-0">
                    <label for="objectLock" class="text-sm font-medium text-gray-900">Enable Object Lock for this
                        object</label>
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
