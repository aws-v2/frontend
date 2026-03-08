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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    })
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

const navigateBack = () => {
    // If we have a prefix, we should go back to the folder view
    const lastSlashIndex = objectKey.value.lastIndexOf('/')
    if (lastSlashIndex !== -1) {
        const prefix = objectKey.value.substring(0, lastSlashIndex + 1)
        router.push({
            name: 's3-folder-contents',
            params: {
                bucketName: bucketName.value,
                prefix: prefix
            }
        })
    } else {
        router.push(`/s3/buckets/${bucketName.value}?tab=overview`)
    }
}

</script>

<template>
    <div
        class="min-h-screen bg-white text-[#232f3e] pb-32 font-urbanist relative overflow-hidden selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        </div>

        <!-- Breadcrumbs -->
        <div
            class="h-12 border-b border-[#eaeded] bg-white flex items-center px-8 text-[11px] gap-2 text-[#545b64] relative z-10 font-black uppercase tracking-widest italic">
            <span @click="router.push('/s3')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Amazon S3
            </span>
            <span class="text-[#eaeded] font-normal not-italic mx-1">/</span>
            <span @click="router.push('/s3/buckets')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Buckets
            </span>
            <span class="text-[#eaeded] font-normal not-italic mx-1">/</span>
            <span @click="navigateBack" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                {{ bucketName }}
            </span>
            <span class="text-[#eaeded] font-normal not-italic mx-1">/</span>
            <span class="text-[#232f3e] truncate max-w-[300px]">{{ objectKey }}</span>
        </div>

        <div class="relative z-10 p-8 px-8 md:px-24 pt-16 max-w-[1800px] mx-auto">
            <!-- Header -->
            <div
                class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 border-b-2 border-[#eaeded] pb-8">
                <div class="space-y-2">
                    <h1
                        class="text-5xl font-black text-[#232f3e] flex items-baseline gap-4 tracking-tighter uppercase italic break-all">
                        {{ objectKey.split('/').pop() }}
                        <span
                            class="text-[10px] text-[#ff9900] bg-[#fafafa] px-3 py-1 border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer uppercase font-black tracking-[0.2em] transition-all not-italic whitespace-nowrap">
                            Object Details
                        </span>
                    </h1>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button @click="copyToClipboard(s3Uri, 'S3 URI')"
                        class="px-6 py-2.5 bg-white border-2 border-[#eaeded] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:border-[#ff9900] transition-all active:scale-95 italic">
                        Copy S3 URI
                    </button>
                    <button
                        class="px-6 py-2.5 bg-white border-2 border-[#eaeded] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:border-[#ff9900] transition-all active:scale-95 italic">
                        Download
                    </button>
                    <button
                        class="px-6 py-2.5 bg-white border-2 border-[#eaeded] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:border-[#ff9900] transition-all active:scale-95 italic">
                        Open ↗
                    </button>
                    <button
                        class="px-8 py-2.5 bg-[#ff9900] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:bg-[#ff9900]/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#ff9900]/20 active:scale-95">
                        Object actions
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-12 mb-12 border-b-2 border-[#eaeded] pb-0">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab.toLowerCase()"
                    class="relative pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all" :class="activeTab === tab.toLowerCase()
                        ? 'text-[#ff9900]'
                        : 'text-[#545b64] hover:text-[#232f3e]'
                        ">
                    {{ tab }}
                    <div v-if="activeTab === tab.toLowerCase()"
                        class="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ff9900]"></div>
                </button>
            </div>

            <!-- Tab Content (Properties) -->
            <div v-if="activeTab === 'properties'"
                class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <!-- Object Overview -->
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-8 bg-[#fafafa] border-b-2 border-[#eaeded]">
                        <h2 class="text-[12px] font-black text-[#ff9900] uppercase tracking-[0.2em] italic">Object
                            overview</h2>
                    </div>
                    <div class="p-8 pt-10">
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-y-10 xl:gap-x-24">
                            <!-- Column 1 -->
                            <div class="space-y-8">
                                <div class="group">
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                        Owner</p>
                                    <p
                                        class="text-[13px] text-[#232f3e] font-bold break-all leading-relaxed uppercase tracking-tight italic">
                                        a80eb1031764ce392d55d37678e6efc4eecab7506f540e81ffbf2390f7ebc7f7
                                    </p>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="group">
                                        <p
                                            class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                            Region</p>
                                        <p
                                            class="text-[13px] text-[#232f3e] font-black uppercase tracking-tight italic">
                                            Europe (Stockholm) eu-north-1</p>
                                    </div>
                                    <div class="group">
                                        <p
                                            class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                            Last modified</p>
                                        <p
                                            class="text-[13px] text-[#232f3e] font-black uppercase tracking-tight italic">
                                            {{ formatDate(s3Store.currentFile?.last_modified) }}</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="group">
                                        <p
                                            class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                            Size</p>
                                        <p
                                            class="text-[13px] text-[#232f3e] font-black uppercase tracking-tight italic">
                                            {{ formatSize(s3Store.currentFile?.size) }}</p>
                                    </div>
                                    <div class="group">
                                        <p
                                            class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                            Type</p>
                                        <p
                                            class="text-[13px] text-[#232f3e] font-black uppercase tracking-tight italic">
                                            {{ s3Store.currentFile?.mime_type || 'Object' }}</p>
                                    </div>
                                </div>
                                <div class="group relative">
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                        Key</p>
                                    <div @click="copyToClipboard(objectKey, 'Key')"
                                        class="flex items-center gap-3 cursor-pointer group/link bg-[#fafafa] border-2 border-[#eaeded] p-4 hover:border-[#ff9900] transition-all">
                                        <svg class="w-4 h-4 text-[#545b64] group-hover/link:text-[#ff9900]" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-[12px] text-[#232f3e] font-black group-hover/link:text-[#ff9900] break-all uppercase tracking-tight italic">
                                            {{ objectKey }}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- Column 2 -->
                            <div class="space-y-8">
                                <div class="group">
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                        S3 URI</p>
                                    <div @click="copyToClipboard(s3Uri, 'S3 URI')"
                                        class="flex items-center gap-3 cursor-pointer group/link bg-[#fafafa] border-2 border-[#eaeded] p-4 hover:border-[#ff9900] transition-all">
                                        <svg class="w-4 h-4 text-[#545b64] group-hover/link:text-[#ff9900]" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-[12px] text-[#232f3e] font-black group-hover/link:text-[#ff9900] break-all uppercase tracking-tight italic">
                                            {{ s3Uri }}</p>
                                    </div>
                                </div>
                                <div class="group">
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                        Amazon Resource Name (ARN)</p>
                                    <div @click="copyToClipboard(arn, 'ARN')"
                                        class="flex items-center gap-3 cursor-pointer group/link bg-[#fafafa] border-2 border-[#eaeded] p-4 hover:border-[#ff9900] transition-all">
                                        <svg class="w-4 h-4 text-[#545b64] group-hover/link:text-[#ff9900]" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-[12px] text-[#232f3e] font-black group-hover/link:text-[#ff9900] break-all uppercase tracking-tight italic">
                                            {{ arn }}</p>
                                    </div>
                                </div>
                                <div class="group">
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                        Entity tag (ETag)</p>
                                    <div class="flex items-center gap-3 bg-[#fafafa] border-2 border-[#eaeded] p-4">
                                        <svg class="w-4 h-4 text-[#eaeded]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-[12px] text-[#232f3e] font-black break-all uppercase tracking-tight italic">
                                            519a8b3308872b0ed015963c9f3fc623</p>
                                    </div>
                                </div>
                                <div class="group">
                                    <p
                                        class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                        Object URL</p>
                                    <div @click="copyToClipboard(objectUrl, 'Object URL')"
                                        class="flex items-center gap-3 cursor-pointer group/link bg-[#fafafa] border-2 border-[#eaeded] p-4 hover:border-[#ff9900] transition-all">
                                        <svg class="w-4 h-4 text-[#545b64] group-hover/link:text-[#ff9900]" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <p
                                            class="text-[12px] text-[#232f3e] font-black group-hover/link:text-[#ff9900] break-all uppercase tracking-tight italic">
                                            {{ objectUrl }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Feature Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Storage Class -->
                    <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden flex flex-col">
                        <div class="p-6 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                            <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">Storage
                                class</h2>
                            <button @click="showStorageClassModal = true"
                                class="px-5 py-2 text-[10px] font-black border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all italic bg-white uppercase tracking-widest">
                                Edit
                            </button>
                        </div>
                        <div class="p-6 flex-1">
                            <p
                                class="text-[11px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight italic mb-6">
                                Amazon S3 offers a range of storage classes designed for different use cases.
                            </p>
                            <div class="bg-[#fafafa] border-2 border-[#eaeded] p-6 italic">
                                <p class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-2">Current
                                    Class</p>
                                <p class="text-xl font-black text-[#ff9900] tracking-tighter uppercase italic">
                                    {{ s3Store.currentFile?.storage_class || 'Standard' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Server-side encryption -->
                    <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden flex flex-col">
                        <div class="p-6 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                            <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">
                                Encryption settings</h2>
                            <button @click="showEncryptionModal = true"
                                class="px-5 py-2 text-[10px] font-black border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all italic bg-white uppercase tracking-widest">
                                Edit
                            </button>
                        </div>
                        <div class="p-6 flex-1">
                            <p
                                class="text-[11px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight italic mb-6">
                                Server-side encryption protects data at rest.
                            </p>
                            <div class="bg-[#fafafa] border-2 border-[#eaeded] p-6 italic">
                                <p class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-2">
                                    Encryption Type</p>
                                <p
                                    class="text-[13px] font-black text-[#232f3e] tracking-tight uppercase italic leading-tight">
                                    Server-side encryption with Amazon S3 managed keys (SSE-S3)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Checksums -->
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-6 border-b-2 border-[#eaeded] bg-[#fafafa]">
                        <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">Checksums
                        </h2>
                    </div>
                    <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 pt-10">
                        <div class="group">
                            <p class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                Function</p>
                            <p class="text-[14px] text-[#232f3e] font-black uppercase tracking-tight italic">CRC64NVME
                            </p>
                        </div>
                        <div class="group">
                            <p class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">Type
                            </p>
                            <p class="text-[14px] text-[#232f3e] font-black uppercase tracking-tight italic">Full object
                            </p>
                        </div>
                        <div class="group">
                            <p class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.2em] mb-3 italic">
                                Value</p>
                            <div class="flex items-center gap-3">
                                <svg class="w-4 h-4 text-[#eaeded]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                                <p class="text-[14px] text-[#232f3e] font-black uppercase tracking-tight italic">
                                    OMt2K9lhp4g=</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tags -->
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-6 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                        <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">Tags ({{
                            s3Store.currentFile?.tags?.length || 0 }})</h2>
                        <button @click="showTagsModal = true"
                            class="px-5 py-2 text-[10px] font-black border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all italic bg-white uppercase tracking-widest">
                            Edit
                        </button>
                    </div>
                    <div v-if="s3Store.currentFile?.tags?.length" class="p-8">
                        <div class="border-2 border-[#eaeded] overflow-hidden">
                            <table class="w-full text-left italic">
                                <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                    <tr class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Key</th>
                                        <th class="px-6 py-4">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="tag in s3Store.currentFile.tags" :key="tag.key"
                                        class="text-[12px] text-[#232f3e] font-black border-b-2 border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-colors uppercase tracking-tight">
                                        <td class="px-6 py-4 border-r-2 border-[#eaeded]">{{ tag.key }}</td>
                                        <td class="px-6 py-4">{{ tag.value }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div v-else class="p-16 text-center italic">
                        <p class="text-[11px] text-[#545b64] font-black uppercase tracking-[0.2em]">No tags associated
                            with this resource.</p>
                    </div>
                </div>

                <!-- Metadata -->
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-6 border-b-2 border-[#eaeded] bg-[#fafafa]">
                        <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">Metadata
                        </h2>
                    </div>
                    <div class="p-8">
                        <div class="border-2 border-[#eaeded] overflow-hidden">
                            <table class="w-full text-left italic">
                                <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                    <tr class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Type</th>
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Key</th>
                                        <th class="px-6 py-4">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="text-[12px] text-[#232f3e] font-black border-b-2 border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-colors uppercase tracking-tight">
                                        <td class="px-6 py-4 border-r-2 border-[#eaeded] text-[#545b64]">System defined
                                        </td>
                                        <td class="px-6 py-4 border-r-2 border-[#eaeded]">Content-Type</td>
                                        <td class="px-6 py-4">{{ s3Store.currentFile?.mime_type ||
                                            'application/octet-stream' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Content (Permissions) -->
            <div v-else-if="activeTab === 'permissions'"
                class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-6 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                        <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">Access
                            control list (ACL)</h2>
                        <button
                            class="px-5 py-2 text-[10px] font-black border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all italic bg-white uppercase tracking-widest">
                            Edit
                        </button>
                    </div>
                    <div class="p-8">
                        <p class="text-[11px] text-[#545b64] font-bold uppercase tracking-tight italic mb-8">
                            You can use ACLs to grant basic read/write permissions to other AWS accounts.
                        </p>
                        <div class="border-2 border-[#eaeded] overflow-hidden">
                            <table class="w-full text-left italic">
                                <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                    <tr class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Grantee</th>
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Objects</th>
                                        <th class="px-6 py-4">Object ACL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="text-[12px] text-[#232f3e] font-black border-b-2 border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-colors italic">
                                        <td class="px-6 py-4 border-r-2 border-[#eaeded]">
                                            <p class="uppercase tracking-tight">Bucket owner (your account)</p>
                                            <p class="text-[9px] text-[#545b64] mt-1 break-all">
                                                a80eb1031764ce392d55d37678e6efc4eecab7506f540e81ffbf2390f7ebc7f7</p>
                                        </td>
                                        <td class="px-6 py-4 border-r-2 border-[#eaeded]">
                                            <span
                                                class="text-[#ff9900] font-black uppercase tracking-widest text-[10px]">Read,
                                                Write</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="text-[#ff9900] font-black uppercase tracking-widest text-[10px]">Read,
                                                Write</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Content (Versions) -->
            <div v-else-if="activeTab === 'versions'"
                class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
                    <div class="p-6 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
                        <h2 class="text-[12px] font-black text-[#232f3e] uppercase tracking-[0.2em] italic">Object
                            Versions</h2>
                        <div class="flex gap-3">
                            <button
                                class="px-5 py-2 text-[10px] font-black border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all italic bg-white uppercase tracking-widest">
                                Download
                            </button>
                            <button
                                class="px-5 py-2 text-[10px] font-black bg-[#232f3e] text-white hover:bg-rose-600 transition-all italic uppercase tracking-widest">
                                Delete
                            </button>
                        </div>
                    </div>

                    <div class="p-0">
                        <div class="border-t-0 overflow-hidden">
                            <table class="w-full text-left italic">
                                <thead class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                    <tr class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded] w-16 text-center italic">
                                            <div
                                                class="w-5 h-5 border-2 border-[#eaeded] bg-white flex items-center justify-center mx-auto">
                                            </div>
                                        </th>
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Version ID</th>
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Last modified</th>
                                        <th class="px-6 py-4 border-r-2 border-[#eaeded]">Size</th>
                                        <th class="px-6 py-4">Storage class</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="text-[13px] text-[#232f3e] font-black border-b-2 border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-colors italic">
                                        <td class="px-6 py-6 border-r-2 border-[#eaeded] text-center">
                                            <div
                                                class="w-5 h-5 border-2 border-[#ff9900] bg-[#ff9900]/10 flex items-center justify-center mx-auto">
                                                <div class="w-2 h-2 bg-[#ff9900]"></div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-6 border-r-2 border-[#eaeded]">
                                            <div class="flex items-center gap-3">
                                                <span class="uppercase tracking-tight">Current version</span>
                                                <span
                                                    class="px-3 py-1 bg-[#ff9900] text-[#232f3e] text-[9px] font-black uppercase tracking-widest shadow-sm">Latest</span>
                                            </div>
                                            <p class="text-[10px] text-[#545b64] mt-2 font-mono uppercase">null</p>
                                        </td>
                                        <td
                                            class="px-6 py-6 border-r-2 border-[#eaeded] uppercase text-[#545b64] text-[11px] font-bold">
                                            {{ formatDate(s3Store.currentFile?.last_modified) }}</td>
                                        <td class="px-6 py-6 border-r-2 border-[#eaeded] uppercase tracking-tight">{{
                                            formatSize(s3Store.currentFile?.size) }}</td>
                                        <td
                                            class="px-6 py-6 font-black text-[#ff9900] text-[10px] uppercase tracking-[0.2em]">
                                            {{ s3Store.currentFile?.storage_class || 'Standard' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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

<style scoped>
.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
