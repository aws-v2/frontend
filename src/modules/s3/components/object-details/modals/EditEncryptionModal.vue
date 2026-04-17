<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isOpen: boolean
    currentEncryption?: string
}>()

const emit = defineEmits(['close', 'save'])

const encryptionType = ref(props.currentEncryption?.includes('KMS') ? 'SSE-KMS' : 'SSE-S3')
const kmsKeyArn = ref('')
const bucketKeyEnabled = ref(true)

const handleSave = () => {
    emit('save', {
        type: encryptionType.value,
        kmsKeyArn: encryptionType.value === 'SSE-KMS' ? kmsKeyArn.value : undefined,
        bucketKeyEnabled: bucketKeyEnabled.value
    })
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-sm shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-bold text-gray-900">Edit server-side encryption</h2>
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
                    Server-side encryption protects your data at rest. You can choose to use Amazon S3 managed keys
                    (SSE-S3) or AWS Key Management Service (AWS KMS) keys (SSE-KMS).
                </p>

                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-gray-900">Encryption type</h3>

                    <label class="flex items-start gap-3 p-3 border rounded-sm cursor-pointer"
                        :class="encryptionType === 'SSE-S3' ? 'border-[var(--aws-blue)] bg-blue-50/50' : 'border-gray-300'">
                        <input type="radio" v-model="encryptionType" value="SSE-S3" class="mt-1">
                        <div>
                            <span class="text-sm font-bold text-gray-900 block">SSE-S3</span>
                            <span class="text-[11px] text-gray-600">Server-side encryption with Amazon S3 managed
                                keys.</span>
                        </div>
                    </label>

                    <label class="flex items-start gap-3 p-3 border rounded-sm cursor-pointer"
                        :class="encryptionType === 'SSE-KMS' ? 'border-[var(--aws-blue)] bg-blue-50/50' : 'border-gray-300'">
                        <input type="radio" v-model="encryptionType" value="SSE-KMS" class="mt-1">
                        <div>
                            <span class="text-sm font-bold text-gray-900 block">SSE-KMS</span>
                            <span class="text-[11px] text-gray-600">Server-side encryption with AWS Key Management
                                Service keys.</span>
                        </div>
                    </label>
                </div>

                <div v-if="encryptionType === 'SSE-KMS'" class="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                        <label class="block text-xs font-bold text-gray-900 mb-2">AWS KMS key ARN</label>
                        <input type="text" v-model="kmsKeyArn" placeholder="arn:serw:kms:..."
                            class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm outline-none focus:border-[var(--aws-blue)]">
                    </div>
                </div>

                <div class="pt-4 border-t border-gray-100 flex items-center gap-3">
                    <input type="checkbox" v-model="bucketKeyEnabled" id="bucketKey"
                        class="w-4 h-4 text-[var(--aws-blue)] rounded-sm border-gray-300 focus:ring-0">
                    <label for="bucketKey" class="text-sm font-medium text-gray-900">Bucket Key enabled</label>
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
