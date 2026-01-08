<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import apiClient from '@/shared/api/apiClient'

const props = defineProps<{
    isOpen: boolean
    bucketName: string
    bucketId: string
}>()

const emit = defineEmits(['close', 'success'])
const toastStore = useToastStore()

const confirmationInput = ref('')
const isLoading = ref(false)

const isConfirmationValid = computed(() => {
    return confirmationInput.value === 'permanently delete'
})

const handleEmpty = async () => {
    if (!isConfirmationValid.value) return

    isLoading.value = true
    try {
        await apiClient.post(`/api/v1/buckets/${props.bucketId}/empty`)

        toastStore.addToast(`Successfully emptied bucket "${props.bucketName}"`, 'success')
        emit('success')
        handleClose()
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.error || 'Failed to empty bucket', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleClose = () => {
    confirmationInput.value = ''
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0" @click="handleClose"></div>

        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-2xl shadow-2xl rounded-sm flex flex-col">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Empty bucket
                    <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                </h2>
                <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto max-h-[70vh]">
                <!-- Warning Alert -->
                <div class="border border-red-200 bg-red-50 rounded-sm p-4 mb-6 relative">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd" />
                        </svg>
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 mb-1">Permanently delete all objects in bucket {{
                                bucketName }}?</h3>
                            <p class="text-xs text-gray-600 leading-relaxed">This action cannot be undone. All objects
                                currently in the bucket will be permanently deleted.</p>
                        </div>
                    </div>
                </div>

                <!-- Confirmation Card -->
                <div class="border border-gray-200 rounded-sm p-6 bg-white">
                    <p class="text-[13px] text-gray-900 mb-4 font-medium">To confirm deletion, type <span
                            class="italic font-bold">permanently delete</span> in the text input field.</p>
                    <input v-model="confirmationInput" type="text" placeholder="permanently delete"
                        class="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] outline-none placeholder-gray-400 bg-gray-50">
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-sm">
                <button @click="handleClose"
                    class="px-5 py-1.5 text-xs font-bold border border-gray-300 bg-white text-[var(--aws-blue)] hover:bg-gray-50 transition-colors rounded-sm">Cancel</button>
                <button @click="handleEmpty" :disabled="!isConfirmationValid || isLoading"
                    :class="[!isConfirmationValid || isLoading ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'bg-[var(--aws-orange)] text-white hover:opacity-90 border-transparent shadow-sm']"
                    class="px-6 py-1.5 text-xs font-bold border rounded-sm flex items-center gap-2 transition-all">
                    <svg v-if="isLoading" class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Empty
                </button>
            </div>
        </div>
    </div>
</template>
