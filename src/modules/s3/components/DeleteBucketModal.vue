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
    return confirmationInput.value === props.bucketName
})

const handleDelete = async () => {
    if (!isConfirmationValid.value) return

    isLoading.value = true
    try {
        await apiClient.delete(`/api/v1/buckets/${props.bucketId}`)

        toastStore.addToast(`Successfully deleted bucket "${props.bucketName}"`, 'success')
        emit('success')
        handleClose()
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.error || 'Failed to delete bucket', 'error')
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
                    Delete bucket
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
                <div class="border border-[var(--aws-orange)] bg-[#fffbf0] rounded-sm p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-[var(--aws-orange)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <ul class="list-disc text-xs text-gray-900 pl-4 space-y-1">
                            <li>Deleting a bucket cannot be undone.</li>
                            <li>Bucket names are unique. If you delete a bucket, another AWS user can use the name.</li>
                            <li>If this bucket is used with a Multi-Region Access Point in an external account, initiate
                                failover before deleting the bucket.</li>
                        </ul>
                    </div>
                </div>

                <!-- Confirmation Card -->
                <div class="border border-gray-200 rounded-sm p-6 bg-white">
                    <h3 class="text-sm font-bold text-gray-900 mb-4">Delete bucket "{{ bucketName }}"?</h3>
                    <p class="text-xs text-gray-600 mb-4">
                        To confirm deletion, enter the name of the bucket in the text input field.
                    </p>
                    <input v-model="confirmationInput" type="text" :placeholder="bucketName"
                        class="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] outline-none placeholder-gray-400">
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-sm">
                <button @click="handleClose"
                    class="px-5 py-1.5 text-xs font-bold border border-gray-300 bg-white text-[var(--aws-blue)] hover:bg-gray-50 transition-colors rounded-sm">Cancel</button>
                <button @click="handleDelete" :disabled="!isConfirmationValid || isLoading"
                    :class="[!isConfirmationValid || isLoading ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'bg-[var(--aws-orange)] text-white hover:opacity-90 border-transparent shadow-sm']"
                    class="px-6 py-1.5 text-xs font-bold border rounded-sm flex items-center gap-2 transition-all">
                    <svg v-if="isLoading" class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Delete bucket
                </button>
            </div>
        </div>
    </div>
</template>
