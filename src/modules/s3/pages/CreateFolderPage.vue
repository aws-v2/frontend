<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/shared/store/toastStore'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const bucketName = computed(() => route.params.bucketName as string)
const folderName = ref('')
const encryptionKeyType = ref('None') // 'None' or 'Specify'

const handleCreateFolder = () => {
    if (!folderName.value) {
        toastStore.addToast('Folder name is required', 'error')
        return
    }
    // Simulate creation
    toastStore.addToast(`Folder "${folderName.value}" created successfully`, 'success')
    router.push(`/s3/buckets/${bucketName.value}?tab=objects`)
}
</script>

<template>
    <div class="min-h-screen bg-white font-sans pb-24">
        <!-- Breadcrumbs -->
        <div class="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-[11px] gap-2 text-gray-500">
            <span @click="router.push('/s3')" class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon
                S3</span>
            <span>></span>
            <span @click="router.push('/s3/buckets')"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">Buckets</span>
            <span>></span>
            <span @click="router.push(`/s3/buckets/${bucketName}`)"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">{{ bucketName }}</span>
            <span>></span>
            <span class="text-gray-900 font-bold">Create folder</span>
        </div>

        <div class="max-w-7xl mx-auto p-8 px-10">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-1">Create folder <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                </h1>
                <p class="text-xs text-gray-600">Use folders to group objects in buckets. When you create a folder, S3
                    creates an object using the name that you specify followed by a slash (/). This object then appears
                    as folder on the console. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn
                        more ↗</span></p>
            </div>

            <!-- Policy Alert -->
            <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-4 rounded-sm flex items-start gap-3 mb-6">
                <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-xs text-gray-900">
                    <p class="font-bold mb-1">Your bucket policy might block folder creation</p>
                    <p class="text-gray-600 leading-relaxed">
                        If your bucket policy prevents uploading objects without specific tags, metadata, or access
                        control list (ACL) grantees, you will not be able to create a folder using this configuration.
                        Instead, you can use the <a href="#" class="text-[var(--aws-blue)] underline">upload
                            configuration</a> to upload an empty folder and specify the appropriate settings.
                    </p>
                </div>
            </div>

            <!-- Folder Name -->
            <section class="border border-gray-200 rounded-sm mb-6 bg-white p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Folder</h2>

                <label class="block text-xs font-bold text-gray-900 mb-1">Folder name</label>
                <div class="flex items-center gap-2 max-w-2xl">
                    <input v-model="folderName" type="text" placeholder="Enter folder name"
                        class="w-full px-3 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                    <span class="text-sm text-gray-600">/</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">Folder names can't contain "/". <span
                        class="text-[var(--aws-blue)] hover:underline cursor-pointer">See rules for naming ↗</span></p>
            </section>

            <!-- Server-side encryption -->
            <section class="border border-gray-200 rounded-sm mb-6 bg-white p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-1 flex gap-1">Server-side encryption <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight align-middle">Info</span>
                </h2>
                <p class="text-xs text-gray-600 mb-4">Server-side encryption protects data at rest.</p>

                <!-- Info Alert -->
                <div class="border border-[var(--aws-blue)] bg-blue-50/10 p-3 rounded-sm flex items-start gap-3 mb-6">
                    <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-xs text-gray-900">The following encryption settings apply only to the folder object
                        and not to sub-folder objects.</p>
                </div>

                <h4 class="text-xs font-bold text-gray-900 mb-3">Server-side encryption</h4>
                <div class="space-y-3">
                    <label class="flex items-start gap-2 cursor-pointer">
                        <input type="radio" value="None" v-model="encryptionKeyType"
                            class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                        <div>
                            <span class="text-sm font-medium text-gray-900">Don't specify an encryption key</span>
                            <p class="text-xs text-gray-600">The bucket settings for default encryption are used to
                                encrypt the folder object when storing it in Amazon S3.</p>
                        </div>
                    </label>

                    <label class="flex items-start gap-2 cursor-pointer">
                        <input type="radio" value="Specify" v-model="encryptionKeyType"
                            class="w-4 h-4 mt-0.5 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                        <div>
                            <span class="text-sm font-medium text-gray-900">Specify an encryption key</span>
                            <p class="text-xs text-gray-600">The specified encryption key is used to encrypt the folder
                                object before storing it in Amazon S3.</p>
                        </div>
                    </label>

                    <div v-if="encryptionKeyType === 'Specify'"
                        class="mt-4 border border-yellow-400 bg-yellow-50 rounded-sm p-3 flex gap-2">
                        <svg class="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p class="text-xs text-gray-900">If your bucket policy requires objects to be encrypted with a
                            specific encryption key, you must specify the same encryption key when you create a folder.
                            Otherwise, folder creation will fail.</p>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <div
                class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-[100] px-10 shadow-2xl">
                <button @click="router.back()"
                    class="px-6 py-2 text-xs font-bold border border-gray-300 hover:bg-gray-50 transition-colors text-[var(--aws-blue)]">Cancel</button>
                <button @click="handleCreateFolder"
                    class="px-8 py-2 text-xs font-bold bg-[var(--aws-orange)] text-white hover:opacity-90 transition-opacity rounded-sm">Create
                    folder</button>
            </div>
        </div>
    </div>
</template>
