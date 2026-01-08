<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'
import apiClient from '@/shared/api/apiClient'

const router = useRouter()
const route = useRoute()
const s3Store = useS3Store()
const toastStore = useToastStore()

const bucketName = route.params.bucketName as string
const confirmationInput = ref('')
const isLoading = ref(false)

const isConfirmationValid = computed(() => {
    return confirmationInput.value === bucketName
})

const handleDelete = async () => {
    if (!isConfirmationValid.value) return

    isLoading.value = true
    try {
        // TODO: Implement actual delete bucket API call
        // For now, we'll simulate a delay and success
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulating API call: await apiClient.post(`/api/v1/buckets/delete`, { bucketName })
        // or await apiClient.delete(`/api/v1/buckets/${bucketName}`)

        toastStore.addToast(`Successfully deleted bucket "${bucketName}"`, 'success')
        router.push('/s3/buckets')
    } catch (error: any) {
        toastStore.addToast(error.response?.data?.message || 'Failed to delete bucket', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleCancel = () => {
    router.push('/s3/buckets')
}
</script>

<template>
    <div class="min-h-screen bg-white font-sans pb-20">
        <!-- Breadcrumbs -->
        <div class="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-[11px] gap-2 text-gray-400">
            <span class="hover:underline cursor-pointer">Amazon S3</span>
            <span>></span>
            <span @click="router.push('/s3/buckets')"
                class="hover:underline cursor-pointer text-[var(--aws-blue)]">Buckets</span>
            <span>></span>
            <span class="text-gray-900 font-medium">Delete bucket</span>
        </div>

        <div class="max-w-4xl mx-auto pt-8 px-4">
            <h1 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Delete bucket <span
                    class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
            </h1>

            <!-- Warning Alert -->
            <div class="border border-[var(--aws-orange)] bg-[#fffbf0] rounded-sm p-4 mb-6">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-[var(--aws-orange)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <ul class="list-disc text-sm text-gray-900 pl-4 space-y-1">
                            <li>Deleting a bucket cannot be undone.</li>
                            <li>Bucket names are unique. If you delete a bucket, another AWS user can use the name.</li>
                            <li>If this bucket is used with a Multi-Region Access Point in an external account, initiate
                                failover before deleting the bucket.</li>
                            <li>If this bucket is used with an access point in an external account, the requests made
                                through those access points will fail after you delete this bucket.</li>
                        </ul>
                        <div
                            class="mt-2 text-xs text-[var(--aws-blue)] hover:underline cursor-pointer flex items-center gap-1">
                            Learn more <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirmation Card -->
            <div class="border border-gray-200 rounded-sm p-6 bg-white mb-6">
                <h2 class="text-sm font-bold text-gray-900 mb-4">Delete bucket "{{ bucketName }}"?</h2>
                <p class="text-xs text-gray-600 mb-4">
                    To confirm deletion, enter the name of the bucket in the text input field.
                </p>
                <input v-model="confirmationInput" type="text" :placeholder="bucketName"
                    class="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-sm focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] outline-none placeholder-gray-400">
            </div>

        </div>

        <!-- Footer Actions -->
        <div
            class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-[100] px-16 shadow-2xl">
            <button @click="handleCancel"
                class="px-6 py-2 text-xs font-bold border border-gray-300 text-[var(--aws-blue)] hover:bg-gray-50 transition-colors rounded-sm">Cancel</button>
            <button @click="handleDelete" :disabled="!isConfirmationValid || isLoading"
                :class="[!isConfirmationValid || isLoading ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'bg-[var(--aws-orange)] text-white hover:opacity-90 border-transparent']"
                class="px-6 py-2 text-xs font-bold border rounded-sm flex items-center gap-2 transition-all">
                <svg v-if="isLoading" class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                Delete bucket
            </button>
        </div>
    </div>
</template>
