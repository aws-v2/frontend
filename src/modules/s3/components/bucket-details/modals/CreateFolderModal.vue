<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'

import { useS3Store } from '@/modules/s3/store/s3Store'

const props = defineProps<{
    isOpen: boolean
    bucketName: string
    currentPrefix?: string
}>()

const emit = defineEmits(['close', 'success'])

const s3Store = useS3Store()
const toastStore = useToastStore()
const folderName = ref('')
const encryptionKeyType = ref('None') // 'None' or 'Specify'

const handleCreateFolder = async () => {
    if (!folderName.value) {
        toastStore.addToast('Folder name is required', 'error')
        return
    }

    if (folderName.value.includes('/')) {
        toastStore.addToast('Folder names cannot contain "/"', 'error')
        return
    }

    const fullFolderName = (props.currentPrefix || '') + folderName.value

    try {
        await s3Store.createFolder(props.bucketName, fullFolderName)
        toastStore.addToast(`Folder "${folderName.value}" created successfully`, 'success')
        emit('success', fullFolderName)
        emit('close')
        folderName.value = ''
    } catch (error) {
        toastStore.addToast('Failed to create folder', 'error')
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
        <div class="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-bold text-gray-900">Create folder</h2>
                <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto space-y-6">
                <!-- Info Alert -->
                <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm flex items-start gap-3">
                    <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="text-xs text-gray-900">
                        <p class="font-bold mb-1">Your bucket policy might block folder creation</p>
                        <p class="text-gray-600 leading-relaxed">
                            If your bucket policy prevents uploading objects without specific tags, metadata, or access
                            control list (ACL) grantees, you will not be able to create a folder using this
                            configuration.
                        </p>
                    </div>
                </div>

                <!-- Folder Name -->
                <div>
                    <label class="block text-xs font-bold text-gray-900 mb-1">Folder name</label>
                    <div class="flex items-center gap-2 max-w-2xl">
                        <input v-model="folderName" type="text" placeholder="Enter folder name"
                            class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none"
                            autofocus>
                        <span class="text-sm text-gray-600">/</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">Folder names can't contain "/". <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer">See rules for naming ↗</span>
                    </p>
                </div>

                <!-- Server-side encryption -->
                <div class="border border-gray-200 rounded-sm p-4">
                    <h2 class="text-sm font-bold text-gray-900 mb-1 flex gap-1">Server-side encryption <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                    </h2>
                    <p class="text-[10px] text-gray-600 mb-4">Server-side encryption protects data at rest.</p>

                    <div class="space-y-4">
                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="radio" value="None" v-model="encryptionKeyType"
                                class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <div>
                                <span class="text-xs font-bold text-gray-900 uppercase tracking-tight">Don't specify an
                                    encryption key</span>
                                <p class="text-[10px] text-gray-600">The bucket settings for default encryption are used
                                    to
                                    encrypt the folder object when storing it in Amazon S3.</p>
                            </div>
                        </label>

                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="radio" value="Specify" v-model="encryptionKeyType"
                                class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                            <div>
                                <span class="text-xs font-bold text-gray-900 uppercase tracking-tight">Specify an
                                    encryption key</span>
                                <p class="text-[10px] text-gray-600">The specified encryption key is used to encrypt the
                                    folder
                                    object before storing it in Amazon S3.</p>
                            </div>
                        </label>

                        <div v-if="encryptionKeyType === 'Specify'"
                            class="mt-4 border border-yellow-400 bg-yellow-50 rounded-sm p-3 flex gap-2">
                            <svg class="w-4 h-4 text-yellow-600 shrink-0" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-[10px] text-gray-900 leading-tight">If your bucket policy requires objects to
                                be encrypted with a
                                specific encryption key, you must specify the same encryption key when you create a
                                folder.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button @click="emit('close')"
                    class="px-4 py-1.5 text-xs font-bold border border-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                <button @click="handleCreateFolder"
                    class="px-6 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 transition-opacity rounded-sm shadow-sm">Create
                    folder</button>
            </div>
        </div>
    </div>
</template>
