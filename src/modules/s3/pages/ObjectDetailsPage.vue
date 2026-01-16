<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'
import EditStorageClassModal from '../components/object-details/modals/EditStorageClassModal.vue'
import EditEncryptionModal from '../components/object-details/modals/EditEncryptionModal.vue'
import EditTagsModal from '../components/object-details/modals/EditTagsModal.vue'
import EditObjectLockModal from '../components/object-details/modals/EditObjectLockModal.vue'

const route = useRoute()
const router = useRouter()
const s3Store = useS3Store()
const toastStore = useToastStore()

const bucketName = computed(() => route.params.bucketName as string)
const objectKey = computed(() => {
    const key = route.params.objectKey
    return Array.isArray(key) ? key.join('/') : key as string
})

const activeTab = ref('properties')
const tabs = ['Properties', 'Permissions', 'Versions']

const fetchData = async () => {
    if (bucketName.value && objectKey.value) {
        await s3Store.fetchFileDetails(bucketName.value, objectKey.value)
    }
}

onMounted(fetchData)

const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toastStore.addToast(`${label} copied to clipboard`, 'success')
}

const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    }) + ' (UTC+03:00)'
}

const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '-'
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const s3Uri = computed(() => `s3://${bucketName.value}/${objectKey.value}`)
const arn = computed(() => `arn:serw:s3:::${bucketName.value}/${objectKey.value}`)
const objectUrl = computed(() => `https://${bucketName.value}.s3.eu-north-1.amazonaws.com/${objectKey.value}`)

// Modal States
const showStorageClassModal = ref(false)
const showEncryptionModal = ref(false)
const showTagsModal = ref(false)
const showObjectLockModal = ref(false)

const handleSaveStorageClass = (newClass: string) => {
    if (s3Store.currentFile) {
        s3Store.currentFile.storage_class = newClass
        toastStore.addToast('Storage class updated successfully', 'success')
    }
}

const handleSaveEncryption = (encryption: any) => {
    toastStore.addToast('Encryption settings updated successfully', 'success')
}

const handleSaveTags = (newTags: any[]) => {
    if (s3Store.currentFile) {
        s3Store.currentFile.tags = newTags
        toastStore.addToast('Tags updated successfully', 'success')
    }
}

const handleSaveObjectLock = (enabled: boolean) => {
    toastStore.addToast('Object Lock settings updated successfully', 'success')
}

</script>

<template>
    <div class="min-h-screen bg-white font-sans pb-24">
        <!-- Breadcrumbs -->
        <div class="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-[11px] gap-2 text-gray-500">
            <span @click="router.push('/s3')" class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">
                Amazon S3
            </span>
            <span>></span>
            <span @click="router.push('/s3/buckets')"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">
                Buckets
            </span>
            <span>></span>
            <span @click="router.push(`/s3/buckets/${bucketName}`)"
                class="hover:text-[var(--aws-blue)] hover:underline cursor-pointer">
                {{ bucketName }}
            </span>
            <span>></span>
            <span class="text-gray-900 font-bold">{{ objectKey }}</span>
        </div>

        <div class="p-8 px-10">
            <!-- Header -->
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                        {{ objectKey }}
                        <span
                            class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">
                            Info
                        </span>
                    </h1>
                </div>
                <div class="flex gap-2">
                    <button @click="copyToClipboard(s3Uri, 'S3 URI')"
                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-full hover:bg-gray-50 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Copy S3 URI
                    </button>
                    <button
                        class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-full hover:bg-gray-50 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                    <button class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-full hover:bg-gray-50">
                        Open ↗
                    </button>
                    <div class="relative">
                        <button
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-white bg-[var(--aws-blue)] rounded-full flex items-center gap-1">
                            Object actions
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 flex gap-8 mb-6">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab.toLowerCase()"
                    class="pb-2 text-sm font-bold border-b-2 transition-colors px-1" :class="activeTab === tab.toLowerCase()
                        ? 'border-[var(--aws-blue)] text-[var(--aws-blue)]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        ">
                    {{ tab }}
                </button>
            </div>

            <!-- Tab Content (Properties) -->
            <div v-if="activeTab === 'properties'" class="space-y-6">
                <!-- Object Overview -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4">
                        <h2 class="text-lg font-bold text-gray-900 mb-4">Object overview</h2>
                        <div class="grid grid-cols-2 gap-x-12 gap-y-6">
                            <!-- Column 1 -->
                            <div class="space-y-6">
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Owner
                                    </p>
                                    <p class="text-xs text-gray-900 break-all">
                                        a80eb1031764ce392d55d37678e6efc4eecab7506f540e81ffbf2390f7ebc7f7</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">AWS
                                        Region</p>
                                    <p class="text-xs text-gray-900">Europe (Stockholm) eu-north-1</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Last
                                        modified</p>
                                    <p class="text-xs text-gray-900">{{ formatDate(s3Store.currentFile?.last_modified)
                                    }}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Size
                                    </p>
                                    <p class="text-xs text-gray-900">{{ formatSize(s3Store.currentFile?.size) }}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Type
                                    </p>
                                    <p class="text-xs text-gray-900">{{ s3Store.currentFile?.mime_type || 'zip' }}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Key</p>
                                    <div @click="copyToClipboard(objectKey, 'Key')"
                                        class="flex items-center gap-1 cursor-pointer group">
                                        <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--aws-blue)]"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p class="text-xs text-[var(--aws-blue)] font-bold group-hover:underline">{{
                                            objectKey }}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- Column 2 -->
                            <div class="space-y-6">
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">S3 URI
                                    </p>
                                    <div @click="copyToClipboard(s3Uri, 'S3 URI')"
                                        class="flex items-center gap-1 cursor-pointer group">
                                        <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--aws-blue)]"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-xs text-[var(--aws-blue)] font-bold group-hover:underline break-all">
                                            {{ s3Uri }}</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Amazon
                                        Resource Name (ARN)</p>
                                    <div @click="copyToClipboard(arn, 'ARN')"
                                        class="flex items-center gap-1 cursor-pointer group">
                                        <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--aws-blue)]"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-xs text-[var(--aws-blue)] font-bold group-hover:underline break-all">
                                            {{ arn }}</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Entity
                                        tag (ETag)</p>
                                    <div class="flex items-center gap-1 group">
                                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p class="text-xs text-gray-900 break-all">519a8b3308872b0ed015963c9f3fc623</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Object
                                        URL</p>
                                    <div @click="copyToClipboard(objectUrl, 'Object URL')"
                                        class="flex items-center gap-1 cursor-pointer group">
                                        <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--aws-blue)]"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-xs text-[var(--aws-blue)] font-bold group-hover:underline break-all">
                                            {{ objectUrl }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Storage Class -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 class="text-sm font-bold text-gray-900">Storage class</h2>
                            <p class="text-[10px] text-gray-500">Amazon S3 offers a range of storage classes designed
                                for different use cases. <span
                                    class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span> or
                                see <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon S3
                                    pricing ↗</span></p>
                        </div>
                        <button @click="showStorageClassModal = true"
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                            Edit
                        </button>
                    </div>
                    <div class="p-4">
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Storage class</p>
                        <p class="text-xs text-gray-900 font-medium">{{ s3Store.currentFile?.storage_class || 'Standard'
                        }}</p>
                    </div>
                </div>

                <!-- Encryption Settings -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 class="text-sm font-bold text-gray-900 flex items-center gap-1">Server-side encryption
                                settings <span
                                    class="text-[10px] text-[var(--aws-blue)] font-bold uppercase tracking-tight">Info</span>
                            </h2>
                            <p class="text-[10px] text-gray-500">Server-side encryption protects data at rest.</p>
                        </div>
                        <button @click="showEncryptionModal = true"
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                            Edit
                        </button>
                    </div>
                    <div class="p-4">
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Encryption type
                            <span
                                class="text-[10px] text-[var(--aws-blue)] font-bold uppercase tracking-tight">Info</span>
                        </p>
                        <p class="text-xs text-gray-900 font-medium">Server-side encryption with Amazon S3 managed keys
                            (SSE-S3)</p>
                    </div>
                </div>

                <!-- Checksums -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-sm font-bold text-gray-900">Checksums</h2>
                        <p class="text-[10px] text-gray-500">Checksums are used for data integrity verification of new
                            objects. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more
                                ↗</span></p>
                    </div>
                    <div class="p-4 grid grid-cols-3 gap-8">
                        <div>
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Checksum
                                function</p>
                            <p class="text-xs text-gray-900 font-medium">CRC64NVME</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Checksum type
                            </p>
                            <p class="text-xs text-gray-900 font-medium">Full object</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Checksum value
                            </p>
                            <div class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                                <p class="text-xs text-gray-900 font-medium">OMt2K9lhp4g=</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tags -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 class="text-sm font-bold text-gray-900">Tags ({{ s3Store.currentFile?.tags?.length || 0
                            }})</h2>
                            <p class="text-[10px] text-gray-500">Track storage cost of other criteria by tagging your
                                objects. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more
                                    ↗</span></p>
                        </div>
                        <button @click="showTagsModal = true"
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                            Edit
                        </button>
                    </div>
                    <div v-if="s3Store.currentFile?.tags?.length" class="p-4">
                        <div
                            class="flex text-[11px] font-bold text-gray-600 uppercase tracking-tight border-b border-gray-200 pb-2">
                            <div class="w-1/2">Key</div>
                            <div class="w-1/2">Value</div>
                        </div>
                        <div v-for="tag in s3Store.currentFile.tags" :key="tag.key"
                            class="flex text-xs py-2 border-b border-gray-50 last:border-0">
                            <div class="w-1/2 text-gray-900">{{ tag.key }}</div>
                            <div class="w-1/2 text-gray-900">{{ tag.value }}</div>
                        </div>
                    </div>
                    <div v-else class="p-8 text-center text-xs text-gray-500 italic">
                        No tags associated with this resource.
                    </div>
                </div>

                <!-- Metadata -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-sm font-bold text-gray-900">Metadata (1)</h2>
                        <p class="text-[10px] text-gray-500">Metadata is optional information provided as a name-value
                            (key-value) pair. <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn
                                more ↗</span></p>
                    </div>
                    <div class="p-4">
                        <div
                            class="flex text-[11px] font-bold text-gray-600 uppercase tracking-tight border-b border-gray-200 pb-2">
                            <div class="w-1/3">Type</div>
                            <div class="w-1/3">Key</div>
                            <div class="w-1/3">Value</div>
                        </div>
                        <div class="flex text-xs py-2">
                            <div class="w-1/3 text-gray-900">System defined</div>
                            <div class="w-1/3 text-gray-900">Content-Type</div>
                            <div class="w-1/3 text-gray-900">{{ s3Store.currentFile?.mime_type || 'application/zip' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Object Lock -->
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-sm font-bold text-gray-900">Object Lock</h2>
                        <p class="text-[10px] text-gray-500">Store objects using a write-once-read-many (WORM) model to
                            help you prevent objects from being deleted or overwritten for a fixed amount of time or
                            indefinitely. Object Lock works only in versioned buckets. <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span></p>
                    </div>
                    <div class="p-4">
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Object Lock</p>
                        <p class="text-xs text-gray-900 font-medium">Disabled</p>
                    </div>
                    <div class="p-4 bg-blue-50/30 border-t border-blue-100 flex justify-between items-center">
                        <div class="flex items-center gap-2 text-xs text-gray-700">
                            <svg class="w-4 h-4 text-[var(--aws-blue)]" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd" />
                            </svg>
                            This bucket doesn't have Object Lock enabled. You can enable Object Lock for a versioned
                            bucket under the bucket's <b>properties</b> tab. <span
                                class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span>
                        </div>
                        <button @click="showObjectLockModal = true"
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-1">
                            Edit Object Lock ↗
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tab Content (Permissions) -->
            <div v-else-if="activeTab === 'permissions'" class="space-y-6">
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-sm font-bold text-gray-900">Access control list (ACL)</h2>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                            Edit
                        </button>
                    </div>
                    <div class="p-4">
                        <p class="text-xs text-gray-600 mb-4">You can use ACLs to grant basic read/write permissions to
                            other AWS accounts.</p>

                        <div class="border border-gray-200 rounded-sm overflow-hidden">
                            <table class="w-full text-left text-xs text-gray-900">
                                <thead class="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Grantee
                                        </th>
                                        <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Objects
                                        </th>
                                        <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Object
                                            ACL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td class="px-4 py-3">
                                            <p class="font-bold">Bucket owner (your AWS account)</p>
                                            <p class="text-[10px] text-gray-500">
                                                a80eb1031764ce392d55d37678e6efc4eecab7506f540e81ffbf2390f7ebc7f7</p>
                                        </td>
                                        <td class="px-4 py-3">
                                            <div class="flex items-center gap-2">
                                                <svg class="w-4 h-4 text-green-600 shrink-0" fill="currentColor"
                                                    viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Read, Write
                                            </div>
                                        </td>
                                        <td class="px-4 py-3">
                                            <div class="flex items-center gap-2">
                                                <svg class="w-4 h-4 text-green-600 shrink-0" fill="currentColor"
                                                    viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Read, Write
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Content (Versions) -->
            <div v-else-if="activeTab === 'versions'" class="space-y-6">
                <div class="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 class="text-sm font-bold text-gray-900">Versions</h2>
                            <p class="text-[10px] text-gray-500">Bucket versioning is enabled. You can see historical
                                versions of this object below.</p>
                        </div>
                        <div class="flex gap-2">
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                                Download
                            </button>
                            <button
                                class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs text-gray-900">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th
                                        class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight w-10 text-center">
                                        <input type="checkbox" class="rounded-sm border-gray-300">
                                    </th>
                                    <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Version ID
                                    </th>
                                    <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Last modified
                                    </th>
                                    <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Size</th>
                                    <th class="px-4 py-2 font-bold text-gray-700 uppercase tracking-tight">Storage class
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    class="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 cursor-pointer transition-colors">
                                    <td class="px-4 py-3 text-center">
                                        <input type="checkbox" checked class="rounded-sm border-gray-300">
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold">Current version</span>
                                            <span
                                                class="px-1.5 py-0.5 bg-blue-100 text-[9px] text-[var(--aws-blue)] font-bold rounded-sm uppercase tracking-tight">Latest</span>
                                        </div>
                                        <p class="text-[10px] text-gray-500 mt-0.5 font-mono">null</p>
                                    </td>
                                    <td class="px-4 py-3">{{ formatDate(s3Store.currentFile?.last_modified) }}</td>
                                    <td class="px-4 py-3">{{ formatSize(s3Store.currentFile?.size) }}</td>
                                    <td class="px-4 py-3">{{ s3Store.currentFile?.storage_class || 'Standard' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <EditStorageClassModal v-if="showStorageClassModal" :isOpen="showStorageClassModal"
        :currentStorageClass="s3Store.currentFile?.storage_class" @close="showStorageClassModal = false"
        @save="handleSaveStorageClass" />

    <EditEncryptionModal v-if="showEncryptionModal" :isOpen="showEncryptionModal" @close="showEncryptionModal = false"
        @save="handleSaveEncryption" />

    <EditTagsModal v-if="showTagsModal" :isOpen="showTagsModal" :currentTags="s3Store.currentFile?.tags"
        @close="showTagsModal = false" @save="handleSaveTags" />

    <EditObjectLockModal v-if="showObjectLockModal" :isOpen="showObjectLockModal" @close="showObjectLockModal = false"
        @save="handleSaveObjectLock" />
</template>
