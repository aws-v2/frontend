<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useS3Store, type S3Object } from '@/modules/s3/store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'
import BucketPropertiesWidget from '../widgets/BucketPropertiesWidget.vue'
import StorageMetricsWidget from '../widgets/StorageMetricsWidget.vue'
import CreateFolderModal from '../modals/CreateFolderModal.vue'
import DeleteObjectModal from '../modals/DeleteObjectModal.vue'

const props = defineProps<{
    bucketName: string
    region?: string
    prefix?: string
}>()

const route = useRoute()
const router = useRouter()
const s3Store = useS3Store()
const toastStore = useToastStore()
const searchQuery = ref('')
const showActionsDropdown = ref(false)
const showCreateFolderModal = ref(false)
const showDeleteObjectModal = ref(false)
const selectedFileIds = ref<string[]>([])

const selectedObjectsForDelete = computed(() => {
    return s3Store.files.filter(f => selectedFileIds.value.includes(f.key))
})

const toggleSelectAll = () => {
    if (selectedFileIds.value.length === s3Store.files.length) {
        selectedFileIds.value = []
    } else {
        selectedFileIds.value = s3Store.files.map(f => f.key)
    }
}

const toggleSelectOne = (id: string) => {
    const index = selectedFileIds.value.indexOf(id)
    if (index === -1) {
        selectedFileIds.value.push(id)
    } else {
        selectedFileIds.value.splice(index, 1)
    }
}

const isAllSelected = computed(() => {
    return s3Store.files.length > 0 && selectedFileIds.value.length === s3Store.files.length
})

const isAnySelected = computed(() => selectedFileIds.value.length > 0)
const isSingleSelected = computed(() => selectedFileIds.value.length === 1)

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
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

const filteredFiles = computed(() => {
    if (!searchQuery.value) return s3Store.files
    return s3Store.files.filter((f: S3Object) =>
        f.key.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const navigateToObject = (file: S3Object) => {
    if (file.mime_type === 'folder' || file.key.endsWith('/')) {
        router.push({
            name: 's3-folder-contents',
            params: {
                bucketName: props.bucketName,
                prefix: file.key
            }
        })
    } else {
        router.push({
            name: 's3-object-details',
            params: {
                bucketName: props.bucketName,
                objectKey: file.key
            }
        })
    }
}

const handleOpenObject = () => {
    if (selectedFileIds.value.length === 1) {
        const file = s3Store.files.find(f => f.key === selectedFileIds.value[0])
        if (file) {
            navigateToObject(file)
        }
    }
}

const handleObjectClick = (file: S3Object) => {
    navigateToObject(file)
}

const handleCopyS3URI = async () => {
    if (selectedFileIds.value.length === 1) {
        const s3Uri = `s3://${props.bucketName}/${selectedFileIds.value[0]}`
        try {
            await navigator.clipboard.writeText(s3Uri)
            toastStore.addToast('S3 URI copied to clipboard!', 'success')
        } catch (err) {
            console.error('Failed to copy:', err)
            toastStore.addToast('Failed to copy S3 URI', 'error')
        }
    }
}

const handleCopyURL = async () => {
    if (selectedFileIds.value.length === 1) {
        const url = `https://${props.bucketName}.s3.amazonaws.com/${selectedFileIds.value[0]}`
        try {
            await navigator.clipboard.writeText(url)
            toastStore.addToast('URL copied to clipboard!', 'success')
        } catch (err) {
            console.error('Failed to copy:', err)
            toastStore.addToast('Failed to copy URL', 'error')
        }
    }
}

const handleDownload = async () => {
    if (selectedFileIds.value.length > 0) {
        try {
            for (const id of selectedFileIds.value) {
                const file = s3Store.files.find(f => f.key === id)
                if (file && file.mime_type !== 'folder' && !id.endsWith('/')) {
                    await s3Store.downloadFile(props.bucketName, file.file_id, id.split('/').pop() || id)
                }
            }
            toastStore.addToast(`Started downloading ${selectedFileIds.value.length} item(s)`, 'info')
        } catch (err) {
            toastStore.addToast('Failed to start download', 'error')
        }
    }
}

const handleDelete = async () => {
    if (selectedFileIds.value.length > 0) {
        showDeleteObjectModal.value = true
    }
}

const handleDeleteSuccess = () => {
    selectedFileIds.value = []
    s3Store.fetchFiles(props.bucketName, props.prefix)
}

const navigateToBreadcrumb = (p: string) => {
    if (p === '') {
        router.push(`/s3/buckets/${props.bucketName}?tab=overview`)
    } else {
        router.push({
            name: 's3-folder-contents',
            params: {
                bucketName: props.bucketName,
                prefix: p
            }
        })
    }
}

const breadcrumbs = computed(() => {
    if (!props.prefix) return []
    const parts = props.prefix.split('/').filter(p => p)
    let currentPath = ''
    return parts.map(part => {
        currentPath += part + '/'
        return { name: part, path: currentPath }
    })
})

const contextualMetrics = computed(() => {
    const rawFiles = s3Store.files
    const prefix = props.prefix || ''

    // If we are at root and have bucket stats, use them as base
    if (!prefix && s3Store.currentBucketStats) {
        // We still need to count folders if not provided by backend
        const folders = new Set<string>()
        rawFiles.forEach(f => {
            const parts = f.key.split('/')
            if (parts.length > 1) {
                let curr = ''
                for (let i = 0; i < parts.length - 1; i++) {
                    curr += parts[i] + '/'
                    folders.add(curr)
                }
            }
        })
        return {
            totalSize: s3Store.currentBucketStats.total_size,
            totalFiles: s3Store.currentBucketStats.total_files,
            totalFolders: folders.size
        }
    }

    // If in a folder, calculate from the objects starting with prefix
    const folderFiles = rawFiles.filter(f => f.key.startsWith(prefix) && f.key !== prefix)
    const totalSize = folderFiles.reduce((acc, f) => acc + (f.size || 0), 0)
    const totalFiles = folderFiles.length

    const subfolders = new Set<string>()
    folderFiles.forEach(f => {
        const relative = f.key.slice(prefix.length)
        const parts = relative.split('/')
        if (parts.length > 1) {
            let curr = ''
            for (let i = 0; i < parts.length - 1; i++) {
                curr += parts[i] + '/'
                subfolders.add(prefix + curr)
            }
        }
    })

    return {
        totalSize,
        totalFiles,
        totalFolders: subfolders.size
    }
})

watch(() => props.prefix, () => {
    selectedFileIds.value = []
})

onMounted(() => {
    s3Store.fetchFiles(props.bucketName, props.prefix)
})
</script>

<template>
    <div class="space-y-8 pb-32">
        <!-- Widgets Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <BucketPropertiesWidget class="w-full" :bucketName="bucketName"
                :region="s3Store.currentBucket?.region || region" :createdAt="s3Store.currentBucket?.created_at"
                :arn="s3Store.currentBucket?.arn" />

            <StorageMetricsWidget class="w-full" :totalSize="contextualMetrics.totalSize"
                :totalFiles="contextualMetrics.totalFiles" :totalFolders="contextualMetrics.totalFolders"
                :changePercent="0" :usagePercent="0" />
        </div>


        <!-- Objects Section -->
        <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden">
            <!-- Toolbar -->
            <div class="p-8 border-b-2 border-[#eaeded] bg-[#fafafa] space-y-8 relative">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <h2
                        class="text-3xl font-black text-[#232f3e] tracking-tighter flex items-center gap-4 uppercase italic">
                        Objects
                        <span
                            class="text-xs bg-[#fafafa] text-[#ff9900] px-4 py-1.5 border-2 border-[#eaeded] font-black tracking-[0.2em] italic">
                            {{ s3Store.files.length }}
                        </span>
                        <button @click="s3Store.fetchFiles(bucketName, prefix)"
                            class="text-[#545b64] hover:text-[#ff9900] transition-colors p-1 group">
                            <svg class="w-6 h-6 transition-transform group-active:rotate-180 duration-500" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </h2>
                    <div class="flex flex-wrap gap-3">
                        <button :disabled="!isSingleSelected" @click="handleCopyS3URI"
                            :class="isSingleSelected ? 'bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                            class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                            Copy S3 URI
                        </button>
                        <button :disabled="!isSingleSelected" @click="handleCopyURL"
                            :class="isSingleSelected ? 'bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                            class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                            Copy URL
                        </button>
                        <button :disabled="!isAnySelected" @click="handleDownload"
                            :class="isAnySelected ? 'bg-white border-2 border-[#eaeded] text-[#ff9900] hover:border-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                            class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                            Download
                        </button>
                        <button :disabled="!isSingleSelected" @click="handleOpenObject"
                            :class="isSingleSelected ? 'bg-white border-2 border-[#ff9900] text-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                            class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                            Open ↗
                        </button>
                        <button :disabled="!isAnySelected" @click="handleDelete"
                            :class="isAnySelected ? 'bg-[#232f3e] text-white border-2 border-[#232f3e] hover:bg-rose-600 hover:border-rose-600' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                            class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                            Delete
                        </button>

                        <div class="w-1 h-8 bg-[#eaeded] mx-2 hidden lg:block italic"></div>

                        <!-- Actions Dropdown -->
                        <div class="relative">
                            <button @click="showActionsDropdown = !showActionsDropdown" :class="showActionsDropdown
                                ? 'bg-[#ff9900] text-[#232f3e] border-2 border-[#ff9900] shadow-lg shadow-[#ff9900]/20'
                                : 'bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900]'
                                "
                                class="px-6 py-2.5 text-xs font-black border-2 flex items-center gap-3 transition-all uppercase tracking-widest italic active:scale-95">
                                Actions
                                <svg class="w-4 h-4 transition-transform duration-300"
                                    :class="showActionsDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <div v-show="showActionsDropdown"
                                class="absolute top-full right-0 lg:left-0 mt-4 w-72 bg-white border-2 border-[#eaeded] shadow-2xl z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                <template v-for="(item, i) in [
                                    { label: 'Share with a presigned URL', disabled: true },
                                    { label: 'Copy', disabled: true },
                                    { label: 'Move', disabled: true },
                                ]" :key="i">
                                    <a href="#"
                                        class="block px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all italic"
                                        :class="item.disabled ? 'text-[#eaeded] cursor-not-allowed' : 'text-[#232f3e] hover:bg-[#fafafa] hover:text-[#ff9900]'">
                                        {{ item.label }}
                                    </a>
                                </template>

                                <div class="px-8 py-3 border-t-2 border-[#eaeded] my-2">
                                    <h3 class="text-[10px] font-black text-[#ff9900] uppercase tracking-[0.2em] italic">
                                        Edit actions</h3>
                                </div>

                                <template v-for="(item, i) in [
                                    { label: 'Rename object', disabled: true },
                                    { label: 'Edit storage class', disabled: true },
                                    { label: 'Edit server-side encryption', disabled: true },
                                    { label: 'Edit tags', disabled: true }
                                ]" :key="'edit-' + i">
                                    <a href="#"
                                        class="block px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all italic"
                                        :class="item.disabled ? 'text-[#eaeded] cursor-not-allowed' : 'text-[#232f3e] hover:bg-[#fafafa] hover:text-[#ff9900]'">
                                        {{ item.label }}
                                    </a>
                                </template>

                                <div class="px-8 py-3 border-t-2 border-[#eaeded] my-2"></div>

                                <a href="#"
                                    class="block px-8 py-4 text-[11px] font-black uppercase tracking-widest text-[#eaeded] cursor-not-allowed hover:bg-[#fafafa] transition-all italic">
                                    Make public using ACL
                                </a>
                            </div>
                        </div>

                        <button @click="showCreateFolderModal = true"
                            class="px-8 py-2.5 bg-white border-2 border-[#eaeded] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:border-[#ff9900] transition-all active:scale-95 italic text-center">
                            Create folder
                        </button>
                        <button
                            @click="router.push({ path: `/s3/buckets/${bucketName}/upload`, query: { prefix: props.prefix } })"
                            class="px-8 py-2.5 bg-[#ff9900] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:bg-[#ff9900]/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#ff9900]/20 active:scale-95">
                            <svg class="w-4 h-4 text-[#232f3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload
                        </button>
                    </div>
                </div>

                <div class="bg-[#fafafa] border-2 border-[#eaeded] p-8 flex gap-6 italic">
                    <div class="mt-1 shrink-0">
                        <svg class="w-6 h-6 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p class="text-[13px] text-[#545b64] leading-relaxed font-bold uppercase tracking-tight">
                        Objects are the fundamental entities stored in Amazon S3. You can use
                        <a href="#"
                            class="text-[#ff9900] hover:underline inline-flex items-center gap-2 font-black">Amazon S3
                            Inventory
                            ↗</a>
                        to get a list of all objects in your bucket. For others to access your objects, you'll need to
                        explicitly grant them permissions.
                        <a href="#" class="text-[#ff9900] hover:underline font-black ml-1">Learn more ↗</a>
                    </p>
                </div>

                <!-- Search and Breadcrumbs -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                    <div
                        class="flex items-center gap-4 text-[11px] font-black text-[#545b64] uppercase tracking-widest italic bg-white border-2 border-[#eaeded] px-8 py-4">
                        <span class="hover:text-[#ff9900] cursor-pointer transition-colors"
                            @click="navigateToBreadcrumb('')">
                            {{ bucketName }}
                        </span>
                        <template v-for="(part, index) in breadcrumbs" :key="index">
                            <span class="text-[#eaeded] font-normal not-italic mx-1">/</span>
                            <span class="hover:text-[#ff9900] cursor-pointer transition-colors"
                                @click="navigateToBreadcrumb(part.path)">
                                {{ part.name }}
                            </span>
                        </template>
                    </div>

                    <div class="relative w-full max-w-md group">
                        <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <svg class="w-6 h-6 text-[#545b64] group-focus-within:text-[#ff9900] transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input v-model="searchQuery" type="text" placeholder="Find objects by prefix..."
                            class="w-full pl-14 pr-6 py-4 text-sm bg-white border-2 border-[#eaeded] text-[#232f3e] focus:outline-none focus:border-[#ff9900] transition-all placeholder:text-[#545b64] font-black uppercase tracking-tight">
                    </div>
                </div>
            </div>

            <!-- Table Header -->
            <div
                class="bg-[#fafafa] border-b-2 border-[#eaeded] flex text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                <div class="w-16 p-6 border-r-2 border-[#eaeded] flex justify-center items-center">
                    <div class="w-5 h-5 border-2 border-[#eaeded] bg-white flex items-center justify-center cursor-pointer transition-all hover:border-[#ff9900]"
                        @click="toggleSelectAll">
                        <div v-if="isAllSelected" class="w-2 h-2 bg-[#ff9900]"></div>
                    </div>
                </div>
                <div
                    class="flex-1 p-6 border-r-2 border-[#eaeded] flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors group">
                    <span class="group-hover:text-[#ff9900] transition-colors">Name</span>
                    <svg class="w-4 h-4 text-[#eaeded] group-hover:text-[#ff9900]" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-40 p-6 border-r-2 border-[#eaeded] flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors group">
                    <span class="group-hover:text-[#ff9900] transition-colors">Type</span>
                    <svg class="w-4 h-4 text-[#eaeded] group-hover:text-[#ff9900]" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-64 p-6 border-r-2 border-[#eaeded] flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors group">
                    <span class="group-hover:text-[#ff9900] transition-colors">Last modified</span>
                    <svg class="w-4 h-4 text-[#eaeded] group-hover:text-[#ff9900]" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-40 p-6 border-r-2 border-[#eaeded] flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors group">
                    <span class="group-hover:text-[#ff9900] transition-colors">Size</span>
                    <svg class="w-4 h-4 text-[#eaeded] group-hover:text-[#ff9900]" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-48 p-6 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors group">
                    <span class="group-hover:text-[#ff9900] transition-colors">Storage class</span>
                    <svg class="w-4 h-4 text-[#eaeded] group-hover:text-[#ff9900]" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
            </div>

            <!-- Table Content -->
            <div v-if="s3Store.isLoading" class="p-32 text-center bg-white italic">
                <div class="inline-block relative">
                    <div class="w-16 h-16 border-4 border-[#fafafa] border-t-[#ff9900] rounded-none animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div
                            class="w-8 h-8 border-4 border-[#fafafa] border-b-[#232f3e] rounded-none animate-spin-reverse">
                        </div>
                    </div>
                </div>
                <p class="text-[11px] font-black text-[#545b64] mt-8 uppercase tracking-[0.2em] animate-pulse">Scanning
                    objects...
                </p>
            </div>

            <div v-else-if="s3Store.getDirectoryItems(prefix || '').length > 0">
                <div v-for="file in s3Store.getDirectoryItems(prefix || '')" :key="(file as S3Object).key"
                    class="hover:bg-[#fafafa] group border-b-2 border-[#eaeded] last:border-0 flex text-[13px] text-[#232f3e] transition-all cursor-pointer italic"
                    :class="{ 'bg-[#ff9900]/[0.02]': selectedFileIds.includes((file as S3Object).key) }"
                    @click="toggleSelectOne((file as S3Object).key)">
                    <div class="w-16 p-4 border-r-2 border-[#eaeded] flex justify-center items-center shrink-0">
                        <div class="w-5 h-5 border-2 border-[#eaeded] bg-white flex items-center justify-center transition-all"
                            :class="selectedFileIds.includes((file as S3Object).key) ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]'">
                            <div v-if="selectedFileIds.includes((file as S3Object).key)" class="w-2 h-2 bg-[#ff9900]">
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 p-6 border-r-2 border-[#eaeded] flex items-center gap-6 overflow-hidden">
                        <!-- Folder Icon -->
                        <div v-if="(file as any).mime_type === 'folder' || (file as any).key?.endsWith('/')"
                            class="w-6 h-6 text-[#ff9900] shrink-0">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                            </svg>
                        </div>
                        <!-- File Icon -->
                        <div v-else
                            class="w-6 h-6 text-[#545b64] shrink-0 group-hover:text-[#ff9900] transition-colors">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                                </path>
                            </svg>
                        </div>
                        <span
                            class="font-black text-[#232f3e] hover:text-[#ff9900] transition-colors truncate uppercase tracking-tight"
                            @click.stop="navigateToObject(file as S3Object)">
                            {{ (prefix && (file as any).key?.startsWith(prefix)) ? (file as
                                any).key.slice(prefix.length) : (file as
                                    any).key }}
                        </span>
                    </div>
                    <div
                        class="w-40 p-6 border-r-2 border-[#eaeded] flex items-center text-[#545b64] font-bold uppercase tracking-widest text-[10px] shrink-0">
                        {{ (file as any).mime_type === 'folder' ? 'Folder' : (file as any).mime_type || 'Object' }}
                    </div>
                    <div
                        class="w-64 p-6 border-r-2 border-[#eaeded] flex items-center text-[#545b64] font-bold uppercase tracking-widest text-[10px] shrink-0">
                        {{ formatDate((file as any).last_modified) }}
                    </div>
                    <div
                        class="w-40 p-6 border-r-2 border-[#eaeded] flex items-center text-[#232f3e] font-black uppercase tracking-tight shrink-0">
                        {{ (file as any).mime_type === 'folder' ? '-' : formatSize((file as any).size || 0) }}
                    </div>
                    <div class="w-48 p-6 flex items-center shrink-0">
                        <span class="text-[#ff9900] font-black text-[10px] uppercase tracking-[0.2em] italic">
                            {{ (file as any).storage_class || 'Standard' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="py-48 text-center bg-white italic relative overflow-hidden">
                <div class="absolute inset-0 bg-[#fafafa]/50 pointer-events-none"></div>
                <div class="relative z-10 space-y-12">
                    <div
                        class="w-32 h-32 bg-white border-2 border-[#eaeded] flex items-center justify-center mx-auto shadow-sm relative group">
                        <div
                            class="absolute inset-0 bg-[#ff9900]/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        </div>
                        <svg class="w-12 h-12 text-[#eaeded] group-hover:text-[#ff9900] transition-colors" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div class="max-w-md mx-auto px-8">
                        <h3 class="text-3xl font-black text-[#232f3e] mb-4 uppercase tracking-tighter italic">Bucket is
                            empty</h3>
                        <p class="text-[#545b64] text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-4">
                            Start adding objects by uploading files or creating folders to organize your data assets.
                        </p>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-center gap-6 px-8">
                        <button @click="showCreateFolderModal = true"
                            class="px-10 py-3 text-xs font-black border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900] transition-all uppercase tracking-widest italic">
                            Create folder
                        </button>
                        <button @click="router.push(`/s3/buckets/${bucketName}/upload`)"
                            class="px-10 py-3 text-xs font-black bg-[#ff9900] text-[#232f3e] hover:bg-[#ff9900]/90 transition-all shadow-xl shadow-[#ff9900]/20 uppercase tracking-widest flex items-center justify-center gap-3">
                            <svg class="w-4 h-4 text-[#232f3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload asset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create Folder Modal -->
    <CreateFolderModal v-if="showCreateFolderModal" :isOpen="showCreateFolderModal" :bucketName="bucketName"
        :prefix="prefix" @close="showCreateFolderModal = false" />

    <!-- Delete Object Modal -->
    <DeleteObjectModal v-if="showDeleteObjectModal" :isOpen="showDeleteObjectModal" :bucketName="bucketName"
        :objects="selectedObjectsForDelete" @close="showDeleteObjectModal = false" @success="handleDeleteSuccess" />
</template>

<style scoped>
@keyframes spin-reverse {
    from {
        transform: rotate(360deg);
    }

    to {
        transform: rotate(0deg);
    }
}

.animate-spin-reverse {
    animation: spin-reverse 1.5s linear infinite;
}
</style>
