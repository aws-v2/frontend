<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/shared/store/toastStore'
import { useS3Store } from '@/modules/s3/store/s3Store'
import apiClient from '@/shared/api/apiClient'

const s3Store = useS3Store()

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const bucketName = computed(() => route.params.bucketName as string)

const expandedSections = ref({
    destination: true,
    permissions: true,
    properties: true // Open by default for now to show content
})

const isVersioningEnabled = ref(false)
const storageClass = ref('Standard')
const encryptionKeyType = ref('None') // 'None' or 'Specify'
const checksumFunction = ref('CRC64NVME (recommended)')
const folderPath = ref((route.query.prefix as string) || '')

const storageClasses = [
    { id: 'Standard', name: 'Standard', designedFor: 'Frequently accessed data (more than once a month) with milliseconds access', zones: '≥ 3', minDuration: '-', minSize: '-', fees: '-' },
    { id: 'Intelligent-Tiering', name: 'Intelligent-Tiering', designedFor: 'Data with changing or unknown access patterns', zones: '≥ 3', minDuration: '-', minSize: '128 KB', fees: 'Per-object fees apply for objects >= 128 KB' },
    { id: 'Standard-IA', name: 'Standard-IA', designedFor: 'Infrequently accessed data (once a month) with milliseconds access', zones: '≥ 3', minDuration: '30 days', minSize: '128 KB', fees: 'Per-GB fees apply' },
    { id: 'One Zone-IA', name: 'One Zone-IA', designedFor: 'Recreatable, infrequently accessed data (once a month) with milliseconds access', zones: '1', minDuration: '30 days', minSize: '128 KB', fees: 'Per-GB fees apply' },
    { id: 'Glacier Instant Retrieval', name: 'Glacier Instant Retrieval', designedFor: 'Long-lived archive data accessed once a quarter with instant retrieval in milliseconds', zones: '≥ 3', minDuration: '90 days', minSize: '128 KB', fees: 'Per-GB fees apply' },
    { id: 'Glacier Flexible Retrieval', name: 'Glacier Flexible Retrieval', designedFor: 'Long-lived archive data accessed once a year with retrieval of minutes to hours', zones: '≥ 3', minDuration: '90 days', minSize: '-', fees: 'Per-GB fees apply' },
    { id: 'Glacier Deep Archive', name: 'Glacier Deep Archive', designedFor: 'Long-lived archive data accessed less than once a year with retrieval of hours', zones: '≥ 3', minDuration: '180 days', minSize: '-', fees: 'Per-GB fees apply' },
    { id: 'Glacier Deep Archive', name: 'Glacier Deep Archive', designedFor: 'Long-lived archive data accessed less than once a year with retrieval of hours', zones: '≥ 3', minDuration: '180 days', minSize: '-', fees: 'Per-GB fees apply' },
    { id: 'Reduced redundancy', name: 'Reduced redundancy', designedFor: 'Noncritical, frequently accessed data with milliseconds access (not recommended as S3 Standard is more cost effective)', zones: '≥ 3', minDuration: '-', minSize: '-', fees: 'Per-GB fees apply' },
]

// Tags
interface Tag {
    key: string
    value: string
}
const tags = ref<Tag[]>([])

const addTag = () => {
    tags.value.push({ key: '', value: '' })
}

const removeTag = (index: number) => {
    tags.value.splice(index, 1)
}

// Metadata
interface Metadata {
    type: string
    key: string
    value: string
}
const metadataList = ref<Metadata[]>([])

const addMetadata = () => {
    metadataList.value.push({ type: 'System defined', key: '', value: '' })
}

const removeMetadata = (index: number) => {
    metadataList.value.splice(index, 1)
}

const toggleSection = (section: 'destination' | 'permissions' | 'properties') => {
    expandedSections.value[section] = !expandedSections.value[section]
}

// File interface matching the table structure
interface UploadFile {
    name: string
    folder: string
    type: string
    size: string
    file: File // Actual file object for upload
}

const files = ref<UploadFile[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)

// Format size helper
const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1000 // AWS uses decimal prefixes (KB, MB) not binary (KiB) usually for UI
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const addFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
        // Simple duplicate check by name (can be improved)
        if (!files.value.some(f => f.name === file.name)) {
            files.value.push({
                name: file.name,
                folder: '-', // Not implementing folder structure parsing yet for dragdrop of files
                type: file.type || 'application/octet-stream',
                size: formatSize(file.size),
                file: file
            })
        }
    })
}

const onDrop = (e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer?.files) {
        addFiles(e.dataTransfer.files)
    }
}

const onDragOver = (e: DragEvent) => {
    e.preventDefault()
}

const triggerFileInput = () => {
    fileInput.value?.click()
}

const triggerFolderInput = () => {
    folderInput.value?.click()
}

const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files) {
        addFiles(target.files)
    }
}

const removeFile = (index: number) => {
    files.value.splice(index, 1)
}

const handleUpload = async () => {
    if (files.value.length === 0) return

    const formData = new FormData()

    // Append files
    files.value.forEach(f => {
        formData.append('files', f.file)
    })

    // Append metadata and settings matching the required structure
    formData.append('bucketId', bucketName.value)
    if (folderPath.value) {
        formData.append('prefix', folderPath.value)
    }

    formData.append('destinationSettings', JSON.stringify({
        versioningEnabled: isVersioningEnabled.value,
    }))

    formData.append('properties', JSON.stringify({
        storageClass: storageClass.value,
        encryptionType: encryptionKeyType.value,
        checksumFunction: checksumFunction.value
    }))

    formData.append('tags', JSON.stringify(tags.value))
    formData.append('metadata', JSON.stringify(metadataList.value))

    try {
        toastStore.addToast('Uploading ' + files.value.length + ' files...', 'info')
        await s3Store.uploadFiles(bucketName.value, formData)
        toastStore.addToast('Upload successful', 'success')
        // Redirect back to bucket details with a query param to trigger the success modal
        router.push({
            name: 's3-bucket-details',
            params: { bucketName: bucketName.value },
            query: { showUploadSuccess: 'true' }
        })
    } catch (error) {
        console.error('Upload failed:', error)
        toastStore.addToast('Upload failed', 'error')
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
            class="h-14 border-b border-[#eaeded] bg-[#fafafa] flex items-center px-12 text-[11px] gap-4 text-[#545b64] relative z-10 font-black uppercase tracking-[0.2em] italic">
            <span @click="router.push('/s3')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Amazon S3
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span @click="router.push('/s3/buckets')" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                Buckets
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span @click="router.push(`/s3/buckets/${bucketName}`)"
                class="hover:text-[#ff9900] cursor-pointer transition-colors underline decoration-[#ff9900]/20 underline-offset-4">
                {{ bucketName }}
            </span>
            <span class="text-[#eaeded] not-italic text-lg mx-2">/</span>
            <span class="text-[#232f3e] italic font-black">Upload</span>
        </div>

        <div class="max-w-6xl mx-auto p-12 px-8 md:px-16 relative z-10 pt-20">
            <div class="mb-20 border-b border-[#eaeded] pb-12 text-center">
                <h1 class="text-6xl font-black text-[#232f3e] mb-6 tracking-tighter uppercase italic">
                    Upload: <span class="text-[#ff9900]">Deployment</span>
                </h1>
                <p
                    class="text-[15px] text-[#545b64] font-black leading-relaxed max-w-2xl mx-auto uppercase tracking-tight italic opacity-60">
                    Stage your assets for cloud synchronization. Minimal latency, high availability.
                </p>
            </div>

            <!-- Hidden Inputs -->
            <input type="file" ref="fileInput" multiple class="hidden" @change="handleFileSelect">
            <input type="file" ref="folderInput" webkitdirectory class="hidden" @change="handleFileSelect">

            <!-- Drag and Drop Zone -->
            <div @drop="onDrop" @dragover="onDragOver"
                class="bg-white border text-[#232f3e] border-dashed border-[#eaeded] p-32 flex flex-col items-center justify-center mb-16 transition-all hover:border-[#ff9900] cursor-pointer group relative overflow-hidden italic">
                <div
                    class="w-16 h-16 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center mb-6 text-[#545b64] group-hover:text-[#ff9900] group-hover:border-[#ff9900] transition-all">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <p
                    class="text-lg font-black text-[#232f3e] mb-2 group-hover:text-[#ff9900] transition-colors uppercase tracking-widest">
                    Drop Manifest Here
                </p>
                <p class="text-[10px] text-[#545b64] font-black uppercase tracking-[0.4em] opacity-40">
                    Secure channel deployment
                </p>
            </div>

            <!-- Files and Folders Section -->
            <section class="bg-white border-2 border-[#232f3e] mb-16 overflow-hidden relative">
                <div
                    class="px-10 py-8 border-b border-[#eaeded] flex justify-between items-center bg-[#fafafa] italic relative z-10">
                    <div>
                        <h2
                            class="text-xl font-black text-[#232f3e] flex items-center gap-6 uppercase tracking-tighter">
                            Manifest list
                            <span
                                class="text-[11px] bg-white border border-[#eaeded] text-[#ff9900] px-3 py-1 font-black not-italic">
                                {{ files.length }} ITEMS
                            </span>
                        </h2>
                    </div>
                    <div class="flex gap-4">
                        <button @click="triggerFileInput"
                            class="px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-[#ff9900] text-white hover:bg-[#232f3e] transition-all">
                            Add files
                        </button>
                        <button @click="triggerFolderInput"
                            class="px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-white border border-[#232f3e] text-[#232f3e] hover:bg-[#fafafa] transition-all">
                            Add folder
                        </button>
                    </div>
                </div>
                <div class="p-10 relative z-10 bg-white">
                    <div class="flex justify-between items-center bg-[#fafafa] border border-[#eaeded] p-6 mb-8 italic">
                        <div class="relative w-full max-w-sm">
                            <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#545b64]" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="Filter list..."
                                class="w-full bg-white pl-12 pr-6 py-3 text-[11px] border border-[#eaeded] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded] font-black text-[#232f3e] uppercase tracking-widest italic">
                        </div>
                    </div>
                    <!-- Table Header -->
                    <div
                        class="grid grid-cols-12 gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#545b64] border-b border-[#eaeded] pb-4 px-6 italic opacity-50">
                        <div class="col-span-1"></div>
                        <div class="col-span-5">Identity</div>
                        <div class="col-span-2">Origin</div>
                        <div class="col-span-2">Key type</div>
                        <div class="col-span-2 text-right">Magnitude</div>
                    </div>
                    <!-- Table Body -->
                    <div v-if="files.length > 0" class="divide-y-2 divide-[#eaeded]">
                        <div v-for="(file, index) in files" :key="index"
                            class="grid grid-cols-12 gap-6 text-[13px] text-[#232f3e] hover:bg-[#fafafa] py-6 px-6 group items-center transition-colors italic font-bold">
                            <div class="col-span-1"><input type="checkbox"
                                    class="w-5 h-5 border-2 border-[#eaeded] text-[#ff9900] focus:ring-[#ff9900]/20 checked:bg-[#ff9900]">
                            </div>
                            <div class="col-span-11 grid grid-cols-11 gap-4 items-center">
                                <div class="col-span-5 font-bold text-white truncate flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-[#fafafa] border-2 border-[#eaeded] flex items-center justify-center text-[#545b64] group-hover:text-[#ff9900] group-hover:border-[#ff9900] shrink-0 transition-all shadow-sm">
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span class="truncate uppercase">{{ file.name }}</span>
                                </div>
                                <div class="col-span-2 text-[#545b64] font-black uppercase tracking-tighter">{{
                                    file.folder }}</div>
                                <div class="col-span-2 text-[#545b64] font-black uppercase tracking-tighter truncate">{{
                                    file.type }}</div>
                                <div class="col-span-2 text-right flex justify-end gap-6 items-center">
                                    <span
                                        class="font-black text-[#232f3e] bg-[#fafafa] px-3 py-1.5 border-2 border-[#eaeded] text-[11px] uppercase tracking-tighter shadow-sm">{{
                                            file.size }}</span>
                                    <button @click="removeFile(index)"
                                        class="w-10 h-10 border-2 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Empty State -->
                    <div v-else
                        class="py-32 text-center relative overflow-hidden bg-[#fafafa] border-2 border-dashed border-[#eaeded] italic shadow-inner">
                        <div class="relative z-10 opacity-30 group">
                            <svg class="w-20 h-20 mx-auto mb-6 text-[#545b64] transform group-hover:rotate-12 transition-transform duration-500"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <p class="text-xl text-[#232f3e] font-black mb-1 uppercase tracking-tighter">No files or
                                folders staged</p>
                            <p class="text-[11px] text-[#545b64] font-black uppercase tracking-[0.3em]">Items you select
                                for upload will appear here</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Destination -->
            <section class="bg-white border-2 border-[#232f3e] mb-16 overflow-hidden relative">
                <div
                    class="bg-[#fafafa] px-10 py-8 border-b border-[#eaeded] flex items-center justify-between italic z-10 relative">
                    <h2 class="text-xl font-black text-[#232f3e] flex items-center gap-6 uppercase tracking-tighter">
                        Target endpoint
                    </h2>
                </div>
                <div class="p-10 relative z-10 bg-white italic font-bold">
                    <div
                        class="flex items-center gap-6 mb-12 bg-[#fafafa] border border-[#eaeded] p-10 shadow-sm italic text-[#232f3e]">
                        <div
                            class="w-16 h-16 bg-white border border-[#232f3e] flex items-center justify-center text-[#ff9900] rotate-3 transition-transform">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <p
                            class="text-2xl text-[#ff9900] font-black tracking-tighter uppercase underline decoration-2 decoration-[#ff9900]/20 underline-offset-8">
                            s3://{{ bucketName }}/{{ folderPath }}
                        </p>
                    </div>

                    <div class="mb-12 max-w-2xl">
                        <label
                            class="block text-[10px] font-black uppercase tracking-[0.4em] text-[#545b64] mb-4 opacity-40">Folder
                            Path Override</label>
                        <input v-model="folderPath" type="text" placeholder="e.g. cloud/assets/"
                            class="w-full bg-[#fafafa] border border-[#eaeded] px-8 py-4 text-xl font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded]">
                    </div>

                    <button @click="toggleSection('destination')"
                        class="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[#232f3e] hover:text-[#ff9900] transition-colors focus:outline-none bg-[#fafafa] border border-[#eaeded] px-8 py-3 italic">
                        <svg class="w-4 h-4 text-[#ff9900] transform transition-transform duration-300"
                            :class="expandedSections.destination ? 'rotate-90' : ''" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                        Advanced attributes
                    </button>

                    <div v-show="expandedSections.destination"
                        class="mt-12 border-t-2 border-[#eaeded] pt-12 animate-in fade-in slide-in-from-top-4 duration-500 italic">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <!-- Bucket Versioning -->
                            <div
                                class="bg-[#fafafa] border-2 border-[#eaeded] p-8 shadow-inner group/card hover:border-[#ff9900]/30 transition-colors">
                                <h3 class="text-[12px] font-black uppercase tracking-[0.2em] text-[#545b64] mb-6">Bucket
                                    Versioning</h3>
                                <p
                                    class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">
                                    Enabling versioning allows you to preserve, retrieve, and restore every version of
                                    every object stored in your bucket.
                                    <span
                                        class="text-[#ff9900] hover:underline cursor-pointer block mt-3 font-black">Learn
                                        more
                                        ↗</span>
                                </p>
                                <div v-if="!isVersioningEnabled"
                                    class="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-amber-500 bg-white border-2 border-amber-500/20 px-6 py-3 shadow-md w-fit">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Disabled
                                </div>
                                <div v-else
                                    class="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#ff9900] bg-white border-2 border-[#ff9900]/20 px-6 py-3 shadow-md w-fit">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    Enabled
                                </div>
                            </div>

                            <!-- Default encryption type -->
                            <div
                                class="bg-[#fafafa] border-2 border-[#eaeded] p-8 shadow-inner group/card hover:border-[#ff9900]/30 transition-colors">
                                <h3 class="text-[12px] font-black uppercase tracking-[0.2em] text-[#545b64] mb-6">
                                    Default
                                    encryption</h3>
                                <p
                                    class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">
                                    Server-side encryption is automatically applied to new objects.
                                    <span
                                        class="text-[#ff9900] hover:underline cursor-pointer block mt-3 font-black">Learn
                                        more
                                        ↗</span>
                                </p>
                                <p
                                    class="text-[12px] text-[#232f3e] font-black bg-white px-6 py-4 border-2 border-[#eaeded] shadow-md uppercase tracking-tighter italic">
                                    Amazon S3 managed keys (SSE-S3)
                                </p>
                            </div>

                            <!-- Object Lock -->
                            <div
                                class="bg-[#fafafa] border-2 border-[#eaeded] p-8 shadow-inner group/card hover:border-[#ff9900]/30 transition-colors">
                                <h3 class="text-[12px] font-black uppercase tracking-[0.2em] text-[#545b64] mb-6">Object
                                    Lock</h3>
                                <p
                                    class="text-[13px] text-[#545b64] mb-8 leading-relaxed font-bold uppercase tracking-tight">
                                    Prevent objects from being deleted or overwritten for a fixed amount of time.
                                    <span
                                        class="text-[#ff9900] hover:underline cursor-pointer block mt-3 font-black">Learn
                                        more
                                        ↗</span>
                                </p>
                                <div
                                    class="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#545b64]/40 bg-white border-2 border-[#eaeded] px-6 py-3 shadow-sm w-fit grayscale">
                                    Disabled
                                </div>
                            </div>
                        </div>

                        <!-- Warning Alert -->
                        <div v-if="!isVersioningEnabled"
                            class="mt-12 border-4 border-[#ff9900] bg-[#fafafa] p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-xl relative overflow-hidden italic">
                            <div
                                class="absolute top-0 right-0 w-32 h-32 bg-[#ff9900]/5 rounded-full blur-3xl -mr-16 -mt-16">
                            </div>
                            <div class="flex items-start gap-8 relative z-10">
                                <div
                                    class="w-16 h-16 bg-white border-2 border-[#ff9900] text-[#ff9900] flex items-center justify-center shrink-0 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p
                                        class="text-2xl text-[#232f3e] font-black mb-2 uppercase tracking-tighter italic">
                                        Protect your data with Versioning</p>
                                    <p
                                        class="text-[13px] text-[#545b64] font-bold leading-relaxed uppercase tracking-tight opacity-70">
                                        Bucket Versioning helps protect against overwrite or deletion. It's an AWS best
                                        practice for production data.
                                        <span
                                            class="text-[#ff9900] hover:underline cursor-pointer ml-2 font-black">Learn
                                            more
                                            ↗</span>
                                    </p>
                                </div>
                            </div>
                            <button @click="isVersioningEnabled = true"
                                class="px-10 py-4 text-[11px] font-black uppercase tracking-widest bg-[#232f3e] text-white hover:bg-[#ff9900] transition-all whitespace-nowrap shadow-2xl active:scale-95 z-10">
                                Enable Versioning
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Permissions -->
            <section class="bg-white border-4 border-[#232f3e] mb-12 overflow-hidden shadow-2xl relative">
                <button @click="toggleSection('permissions')"
                    class="w-full bg-[#fafafa] px-10 py-8 flex items-center gap-6 hover:bg-white transition-all focus:outline-none border-b-2 border-[#eaeded] group italic">
                    <svg class="w-5 h-5 text-[#ff9900] transform transition-transform duration-300 group-hover:scale-125"
                        :class="expandedSections.permissions ? 'rotate-90' : ''" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter">Permissions</h2>
                </button>
                <div v-show="expandedSections.permissions"
                    class="p-10 animate-in fade-in slide-in-from-top-4 duration-500 italic font-bold">
                    <p class="text-[14px] text-[#545b64] mb-10 uppercase tracking-tight opacity-70">Grant public access
                        and access to other Cloud identities.</p>

                    <div
                        class="border-4 border-[#eaeded] bg-[#fafafa] p-10 flex items-start gap-8 shadow-inner relative overflow-hidden group/notice">
                        <div
                            class="absolute top-0 right-0 w-32 h-32 bg-[#232f3e]/[0.02] rounded-full blur-3xl -mr-16 -mt-16 group-hover/notice:bg-[#ff9900]/[0.05] transition-colors">
                        </div>
                        <div
                            class="w-14 h-14 bg-white border-2 border-[#232f3e] text-[#ff9900] flex items-center justify-center shrink-0 shadow-lg rotate-3 group-hover/notice:rotate-0 transition-transform">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p
                            class="text-[15px] text-[#232f3e] leading-relaxed uppercase tracking-tight relative z-10 pt-2">
                            This bucket has the <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black italic underline-offset-4 decoration-2 decoration-[#ff9900]/30">bucket
                                owner
                                enforced</span> setting applied for object ownership.
                            Use <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black italic underline-offset-4 decoration-2 decoration-[#ff9900]/30">storage
                                policies</span> to control access.
                            <span
                                class="text-[#ff9900] hover:underline cursor-pointer block mt-4 font-black">Documentation
                                ↗</span>
                        </p>
                    </div>
                </div>
            </section>

            <!-- Properties -->
            <section class="bg-white border-4 border-[#232f3e] mb-12 overflow-hidden shadow-2xl relative">
                <button @click="toggleSection('properties')"
                    class="w-full bg-[#fafafa] px-10 py-8 flex items-center gap-6 hover:bg-white transition-all focus:outline-none border-b-2 border-[#eaeded] group italic">
                    <svg class="w-5 h-5 text-[#ff9900] transform transition-transform duration-300 group-hover:scale-125"
                        :class="expandedSections.properties ? 'rotate-90' : ''" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter">Properties</h2>
                </button>
                <div v-show="expandedSections.properties"
                    class="p-10 space-y-16 animate-in fade-in slide-in-from-top-4 duration-500 italic font-bold">
                    <p class="text-[14px] text-[#545b64] -mt-6 uppercase tracking-tight opacity-70">Specify storage
                        class, encryption settings,
                        tags, and deployment metadata.</p>

                    <!-- Storage Class -->
                    <div
                        class="bg-[#fafafa] border-4 border-[#eaeded] p-10 relative overflow-hidden group shadow-inner">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-[#ff9900]/[0.02] to-[#232f3e]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity">
                        </div>
                        <h3
                            class="text-2xl font-black text-[#232f3e] mb-4 flex items-center gap-6 uppercase tracking-tighter">
                            Storage class
                            <span
                                class="text-[12px] text-[#ff9900] bg-white border-2 border-[#eaeded] px-4 py-1 uppercase font-black tracking-widest not-italic">
                                Tiering
                            </span>
                        </h3>
                        <p
                            class="text-[13px] text-[#545b64] mb-10 font-bold max-w-2xl uppercase tracking-tight opacity-80">
                            Amazon S3 offers a range of storage classes designed for different use cases.
                            <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black ml-2 uppercase">Pricing
                                ↗</span>
                        </p>

                        <div class="overflow-x-auto -mx-10 px-10">
                            <table class="w-full text-left border-collapse min-w-[1200px]">
                                <thead>
                                    <tr
                                        class="text-[11px] uppercase font-black tracking-[0.2em] text-[#545b64] border-b-2 border-[#eaeded]">
                                        <th class="p-6 w-16"></th>
                                        <th class="p-6 border-r-2 border-[#eaeded]">Storage class</th>
                                        <th class="p-6 border-r-2 border-[#eaeded] w-1/4">Designed for</th>
                                        <th class="p-6 border-r-2 border-[#eaeded]">Bucket type</th>
                                        <th class="p-6 border-r-2 border-[#eaeded]">Zones</th>
                                        <th class="p-6 border-r-2 border-[#eaeded]">Min duration</th>
                                        <th class="p-6 border-r-2 border-[#eaeded]">Min size</th>
                                        <th class="p-6 border-r-2 border-[#eaeded]">Fees</th>
                                        <th class="p-6">Retrieval</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y-2 divide-[#eaeded]">
                                    <tr v-for="cls in storageClasses" :key="cls.id"
                                        class="hover:bg-white text-[13px] cursor-pointer group/row transition-colors"
                                        :class="storageClass === cls.id ? 'bg-white' : ''"
                                        @click="storageClass = cls.id">
                                        <td class="p-6 text-center">
                                            <div class="relative flex items-center justify-center">
                                                <input type="radio" :checked="storageClass === cls.id"
                                                    class="w-6 h-6 appearance-none border-2 border-[#eaeded] checked:border-[#ff9900] checked:bg-[#ff9900]/10 transition-all cursor-pointer">
                                                <div v-if="storageClass === cls.id"
                                                    class="absolute w-2.5 h-2.5 bg-[#ff9900]"></div>
                                            </div>
                                        </td>
                                        <td
                                            class="p-6 font-black text-[#232f3e] group-hover/row:text-[#ff9900] transition-colors uppercase tracking-tighter">
                                            {{ cls.name }}</td>
                                        <td
                                            class="p-6 text-[#545b64] font-bold leading-relaxed uppercase tracking-tight">
                                            {{ cls.designedFor }}
                                        </td>
                                        <td
                                            class="p-6 text-[#545b64] font-bold whitespace-nowrap uppercase tracking-widest opacity-60">
                                            General
                                        </td>
                                        <td class="p-6 text-[#545b64] font-bold uppercase tracking-widest opacity-60">{{
                                            cls.zones }}</td>
                                        <td class="p-6 text-[#545b64] font-bold uppercase tracking-widest opacity-60">{{
                                            cls.minDuration }}</td>
                                        <td class="p-6 text-[#545b64] font-bold uppercase tracking-widest opacity-60">{{
                                            cls.minSize }}</td>
                                        <td class="p-6 text-[#545b64] font-bold uppercase tracking-widest opacity-60">{{
                                            cls.fees }}</td>
                                        <td class="p-6 text-[#545b64] font-bold uppercase tracking-widest opacity-40">-
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Server-side encryption -->
                    <div
                        class="bg-white border-4 border-[#eaeded] p-10 relative overflow-hidden group shadow-md italic">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-[#232f3e]/[0.02] to-[#ff9900]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity">
                        </div>
                        <h3
                            class="text-2xl font-black text-[#232f3e] mb-2 flex items-center gap-6 uppercase tracking-tighter">
                            Server-side encryption
                            <span
                                class="text-[12px] text-[#ff9900] bg-white border-2 border-[#eaeded] px-4 py-1 uppercase font-black tracking-widest not-italic">
                                Security
                            </span>
                        </h3>
                        <p class="text-[14px] text-[#545b64] mb-10 font-bold uppercase tracking-tight opacity-70">
                            Server-side encryption protects data at
                            rest by encrypting it before it's saved to disk.</p>

                        <div class="space-y-8">
                            <label class="flex items-start gap-6 cursor-pointer group/opt">
                                <div class="relative flex items-center justify-center mt-1">
                                    <input type="radio" value="None" v-model="encryptionKeyType"
                                        class="w-6 h-6 appearance-none border-2 border-[#eaeded] checked:border-[#ff9900] checked:bg-[#ff9900]/10 transition-all cursor-pointer">
                                    <div v-if="encryptionKeyType === 'None'" class="absolute w-2.5 h-2.5 bg-[#ff9900]">
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <span
                                        class="text-lg font-black text-[#232f3e] group-hover/opt:text-[#ff9900] transition-colors uppercase tracking-tighter">Don't
                                        specify an encryption key</span>
                                    <p
                                        class="text-[12px] text-[#545b64] font-black uppercase tracking-widest opacity-60">
                                        Use the bucket's default
                                        encryption settings.</p>
                                </div>
                            </label>

                            <label class="flex items-start gap-6 cursor-pointer group/opt">
                                <div class="relative flex items-center justify-center mt-1">
                                    <input type="radio" value="Specify" v-model="encryptionKeyType"
                                        class="w-6 h-6 appearance-none border-2 border-[#eaeded] checked:border-[#ff9900] checked:bg-[#ff9900]/10 transition-all cursor-pointer">
                                    <div v-if="encryptionKeyType === 'Specify'"
                                        class="absolute w-2.5 h-2.5 bg-[#ff9900]"></div>
                                </div>
                                <div class="flex-1">
                                    <span
                                        class="text-lg font-black text-[#232f3e] group-hover/opt:text-[#ff9900] transition-colors uppercase tracking-tighter">Specify
                                        an encryption key</span>
                                    <p
                                        class="text-[12px] text-[#545b64] font-black uppercase tracking-widest opacity-60">
                                        Explicitly choose the key used to
                                        encrypt these objects.</p>
                                </div>
                            </label>

                            <div v-if="encryptionKeyType === 'Specify'"
                                class="mt-10 border-4 border-amber-500/20 bg-[#fafafa] p-8 flex gap-8 animate-in fade-in zoom-in-95 duration-300 italic shadow-inner">
                                <div
                                    class="w-12 h-12 bg-white border-2 border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 rotate-6 transition-transform hover:rotate-0 shadow-sm">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p
                                    class="text-[13px] text-[#545b64] font-bold leading-relaxed uppercase tracking-tight pt-1">
                                    If your bucket policy requires a specific key, you must provide it here. Otherwise,
                                    the upload will be rejected by the server.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Checksums -->
                    <div
                        class="bg-white border-4 border-[#eaeded] p-10 relative overflow-hidden group shadow-md italic">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-[#232f3e]/[0.02] to-[#ff9900]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity">
                        </div>
                        <h3
                            class="text-2xl font-black text-[#232f3e] mb-4 flex items-center gap-6 uppercase tracking-tighter">
                            Checksums
                        </h3>
                        <p class="text-[14px] text-[#545b64] mb-10 font-bold uppercase tracking-tight opacity-70">Verify
                            data integrity during the upload
                            process. <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black ml-2">Documentation
                                ↗</span></p>

                        <div class="max-w-3xl">
                            <label
                                class="block text-[11px] font-black uppercase tracking-[0.3em] text-[#545b64] mb-4 px-1">Checksum
                                function</label>
                            <div class="relative">
                                <select v-model="checksumFunction"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] pl-8 pr-16 py-5 text-xl font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none transition-all appearance-none cursor-pointer shadow-inner">
                                    <option class="bg-white">CRC64NVME (recommended)</option>
                                    <option class="bg-white">CRC32</option>
                                    <option class="bg-white">CRC32C</option>
                                    <option class="bg-white">SHA-1</option>
                                    <option class="bg-white">SHA-256</option>
                                </select>
                                <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#ff9900] pointer-events-none"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div
                            class="mt-10 border-4 border-[#eaeded] bg-[#fafafa] p-8 flex gap-8 shadow-inner animate-in fade-in slide-in-from-left-4 duration-500">
                            <div
                                class="w-14 h-14 bg-white border-2 border-[#eaeded] flex items-center justify-center text-[#ff9900] shrink-0 shadow-md rotate-3 group-hover:rotate-0 transition-transform">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p
                                class="text-[14px] text-[#545b64] font-bold leading-relaxed uppercase tracking-tight pt-2">
                                You can provide precalculated values for single objects. For batch operations, use the
                                <span
                                    class="text-[#232f3e] font-black italic underline-offset-4 decoration-2 decoration-[#232f3e]/20 underline">Cloud
                                    CLI</span> or <span
                                    class="text-[#ff9900] font-black italic underline-offset-4 decoration-2 decoration-[#ff9900]/20 underline">System
                                    SDKs</span>.
                            </p>
                        </div>
                    </div>

                    <!-- Tags -->
                    <div
                        class="bg-white border-4 border-[#eaeded] p-10 relative overflow-hidden group shadow-md italic">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-[#ff9900]/[0.02] to-[#232f3e]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity">
                        </div>
                        <h3
                            class="text-2xl font-black text-[#232f3e] mb-4 flex items-center gap-6 uppercase tracking-tighter">
                            Tags
                            <span
                                class="text-[12px] text-[#ff9900] bg-white border-2 border-[#eaeded] px-4 py-1 uppercase font-black tracking-widest not-italic">Meta</span>
                        </h3>
                        <p class="text-[14px] text-[#545b64] mb-10 font-bold uppercase tracking-tight opacity-70">Use
                            object tags to analyze, manage, and
                            specify permissions for objects. <span
                                class="text-[#ff9900] hover:underline cursor-pointer font-black ml-2">Documentation
                                ↗</span>
                        </p>

                        <div v-if="tags.length > 0" class="space-y-6 mb-10">
                            <div v-for="(tag, index) in tags" :key="index"
                                class="flex flex-col md:flex-row items-end gap-10 bg-[#fafafa] border border-[#eaeded] p-10 italic">
                                <div class="flex-1 w-full">
                                    <label
                                        class="block text-[10px] font-black uppercase tracking-[0.3em] text-[#545b64] mb-4 opacity-40">Key</label>
                                    <input v-model="tag.key" type="text" placeholder="e.g. Project"
                                        class="w-full bg-white border border-[#eaeded] px-6 py-4 text-lg font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded]">
                                </div>
                                <div class="flex-1 w-full">
                                    <label
                                        class="block text-[10px] font-black uppercase tracking-[0.3em] text-[#545b64] mb-4 opacity-40">Value
                                        (Optional)</label>
                                    <input v-model="tag.value" type="text" placeholder="e.g. S3-Research"
                                        class="w-full bg-white border border-[#eaeded] px-6 py-4 text-lg font-black italic uppercase tracking-tighter text-[#232f3e] focus:border-[#ff9900] outline-none transition-all placeholder:text-[#eaeded]">
                                </div>
                                <button @click="removeTag(index)"
                                    class="w-16 h-16 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all bg-white mb-1">
                                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div v-else
                            class="mb-10 p-12 border border-dashed border-[#eaeded] text-center bg-[#fafafa] italic">
                            <p class="text-[14px] text-[#232f3e] font-black uppercase tracking-widest opacity-30">No
                                tags
                                defined</p>
                        </div>

                        <button @click="addTag"
                            class="px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#232f3e] hover:text-[#ff9900] transition-colors focus:outline-none bg-[#fafafa] border border-[#eaeded] italic flex items-center gap-4">
                            + Add Tag Attributes
                        </button>

                        <!-- Metadata -->
                        <div
                            class="bg-white border text-[#232f3e] border-[#eaeded] p-10 relative overflow-hidden group italic">
                            <h3
                                class="text-xl font-black text-[#232f3e] mb-2 flex items-center gap-6 uppercase tracking-tighter">
                                Metadata Engine
                            </h3>
                            <p class="text-[11px] text-[#545b64] mb-10 font-black uppercase tracking-widest opacity-40">
                                System and user defined fields</p>

                            <div v-if="metadataList.length > 0" class="mb-10 space-y-8">
                                <div v-for="(meta, index) in metadataList" :key="index"
                                    class="grid grid-cols-12 gap-8 items-end bg-[#fafafa] border border-[#eaeded] p-10 italic">
                                    <div class="col-span-3">
                                        <select v-model="meta.type"
                                            class="w-full bg-white border border-[#eaeded] px-6 py-4 text-[11px] font-black italic uppercase tracking-widest text-[#232f3e] focus:border-[#ff9900] outline-none">
                                            <option>System defined</option>
                                            <option>User defined</option>
                                        </select>
                                    </div>
                                    <div class="col-span-4">
                                        <input v-if="meta.type === 'User defined'" v-model="meta.key" type="text"
                                            placeholder="x-amz-meta-key"
                                            class="w-full bg-white border border-[#eaeded] px-6 py-4 text-[11px] font-black italic uppercase tracking-widest text-[#232f3e] focus:border-[#ff9900] outline-none">
                                        <select v-else v-model="meta.key"
                                            class="w-full bg-white border border-[#eaeded] px-6 py-4 text-[11px] font-black italic uppercase tracking-widest text-[#232f3e] focus:border-[#ff9900] outline-none">
                                            <option value="" disabled selected>Choose key</option>
                                            <option>Content-Type</option>
                                            <option>Cache-Control</option>
                                            <option>Content-Disposition</option>
                                            <option>Content-Encoding</option>
                                            <option>Content-Language</option>
                                        </select>
                                    </div>
                                    <div class="col-span-4">
                                        <input v-model="meta.value" type="text" placeholder="Value"
                                            class="w-full bg-white border border-[#eaeded] px-6 py-4 text-[11px] font-black italic uppercase tracking-widest text-[#232f3e] focus:border-[#ff9900] outline-none">
                                    </div>
                                    <div class="col-span-1 flex justify-end">
                                        <button @click="removeMetadata(index)"
                                            class="w-12 h-12 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all bg-white mb-1">
                                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                    d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div v-else
                                class="mb-10 p-12 border border-dashed border-[#eaeded] text-center bg-[#fafafa] italic">
                                <p class="text-[14px] text-[#232f3e] font-black uppercase tracking-widest opacity-30">No
                                    metadata defined</p>
                            </div>

                            <button @click="addMetadata"
                                class="px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#232f3e] hover:text-[#ff9900] transition-colors focus:outline-none bg-[#fafafa] border border-[#eaeded] italic flex items-center gap-4">
                                + Add Metadata Field
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <div
                class="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-3xl border-t border-[#eaeded] p-8 flex justify-end gap-12 z-[100] px-16 italic">
                <button @click="router.back()"
                    class="px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#545b64] hover:text-[#232f3e] transition-colors">
                    Discard Changes
                </button>
                <button @click="handleUpload" :disabled="files.length === 0"
                    class="relative group px-16 py-4 bg-[#232f3e] text-white font-black text-[12px] uppercase tracking-[0.4em] transition-all disabled:opacity-30 disabled:grayscale">
                    <span class="relative flex items-center gap-6">
                        Deploy manifest
                        <svg class="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-in {
    animation-duration: 500ms;
}

@keyframes bounce-subtle {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

.animate-bounce-subtle {
    animation: bounce-subtle 3s infinite ease-in-out;
}

@keyframes slide-down {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
