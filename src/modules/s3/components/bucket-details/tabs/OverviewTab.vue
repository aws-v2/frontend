<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useS3Store, type S3Object } from '@/modules/s3/store/s3Store'
import KenyanCostHeader from '../widgets/KenyanCostHeader.vue'
import BucketPropertiesWidget from '../widgets/BucketPropertiesWidget.vue'
import StorageMetricsWidget from '../widgets/StorageMetricsWidget.vue'

const props = defineProps<{
    bucketName: string
    region?: string
}>()

const router = useRouter()
const s3Store = useS3Store()
const searchQuery = ref('')
const showActionsDropdown = ref(false)
const selectedFileIds = ref<string[]>([])

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

onMounted(() => {
    s3Store.fetchFiles(props.bucketName)
})
</script>

<template>
    <div class="space-y-6">
        <!-- Kenyan Cost Header -->
        <KenyanCostHeader :cost="145.50" :changePercent="-12" :dataSaverOn="true" @topUp="() => { }" />

        <!-- Widgets Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BucketPropertiesWidget :bucketName="bucketName" :region="region" />
            <StorageMetricsWidget storageUsed="2.4 GB" :changePercent="2" :usagePercent="25" />
        </div>

        <!-- Objects Section -->
        <div class="border border-gray-200 rounded-sm bg-white">
            <!-- Toolbar -->
            <div class="p-4 border-b border-gray-200 space-y-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Objects ({{ s3Store.files.length }})
                        <button class="text-gray-400 hover:text-gray-900">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </h2>
                    <div class="flex gap-2">
                        <button :disabled="!isSingleSelected"
                            :class="isSingleSelected ? 'text-gray-900 border-gray-300 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed border-gray-300'"
                            class="px-3 py-1 text-xs font-bold border rounded-sm transition-colors">
                            Copy S3 URI
                        </button>
                        <button :disabled="!isSingleSelected"
                            :class="isSingleSelected ? 'text-gray-900 border-gray-300 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed border-gray-300'"
                            class="px-3 py-1 text-xs font-bold border rounded-sm transition-colors">
                            Copy URL
                        </button>
                        <button :disabled="!isAnySelected"
                            :class="isAnySelected ? 'text-gray-900 border-gray-300 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed border-gray-300'"
                            class="px-3 py-1 text-xs font-bold border rounded-sm transition-colors">
                            Download
                        </button>
                        <button :disabled="!isSingleSelected"
                            :class="isSingleSelected ? 'text-gray-900 border-gray-300 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed border-gray-300'"
                            class="px-3 py-1 text-xs font-bold border rounded-sm transition-colors">
                            Open ↗
                        </button>
                        <button :disabled="!isAnySelected"
                            :class="isAnySelected ? 'text-gray-900 border-gray-300 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed border-gray-300'"
                            class="px-3 py-1 text-xs font-bold border rounded-sm transition-colors">
                            Delete
                        </button>

                        <!-- Actions Dropdown -->
                        <div class="relative">
                            <button @click="showActionsDropdown = !showActionsDropdown" :class="showActionsDropdown
                                ? 'border-[var(--aws-blue)] bg-[var(--aws-blue)] text-white'
                                : 'border-[var(--aws-blue)] text-[var(--aws-blue)] bg-blue-50/10'
                                "
                                class="px-3 py-1 text-xs font-bold border rounded-sm flex items-center gap-1 transition-colors">
                                Actions
                                <svg class="w-3 h-3 transition-transform duration-200"
                                    :class="showActionsDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <div v-show="showActionsDropdown"
                                class="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-sm shadow-lg z-50 py-1">
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Download
                                    as</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Share
                                    with a presigned URL</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Calculate
                                    total size</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Copy</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Move</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Initiate
                                    restore</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Query
                                    with S3 Select</a>

                                <div class="border-t border-gray-200 my-1 mx-4"></div>
                                <h3 class="px-4 py-1 text-xs font-bold text-gray-900">Edit actions</h3>

                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Rename
                                    object</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Edit
                                    storage class</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Edit
                                    server-side encryption</a>
                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100">Edit
                                    tags</a>

                                <div class="border-t border-gray-200 my-1 mx-4"></div>

                                <a href="#"
                                    class="block px-4 py-1.5 text-xs text-gray-400 cursor-not-allowed hover:bg-gray-100 border border-transparent focus:border-black">Make
                                    public using ACL</a>
                            </div>
                        </div>

                        <button @click="router.push(`/s3/buckets/${bucketName}/create-folder`)"
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-blue-50/10 rounded-sm">
                            Create folder
                        </button>
                        <button @click="router.push(`/s3/buckets/${bucketName}/upload`)"
                            class="px-3 py-1 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload
                        </button>
                    </div>
                </div>

                <p class="text-xs text-gray-600">
                    Objects are the fundamental entities stored in Amazon S3. You can use
                    <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Amazon S3 Inventory ↗</span>
                    to get a list of all objects in your bucket. For others to access your objects, you'll need to
                    explicitly grant them permissions.
                    <span class="text-[var(--aws-blue)] hover:underline cursor-pointer">Learn more ↗</span>
                </p>

                <!-- Search -->
                <div class="relative w-full max-w-lg">
                    <svg class="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input v-model="searchQuery" type="text" placeholder="Find objects by prefix"
                        class="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-400 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] outline-none">
                </div>
            </div>

            <!-- Table Header -->
            <div
                class="bg-gray-50 border-b border-gray-200 flex text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <div class="w-10 p-2 border-r border-gray-200 flex justify-center">
                    <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                        class="w-3.5 h-3.5 rounded border-gray-300">
                </div>
                <div
                    class="flex-1 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                    Name
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-32 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                    Type
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-48 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                    Last modified
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div
                    class="w-32 p-2 border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                    Size
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="w-40 p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                    Storage class
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
            </div>

            <!-- Table Content -->
            <div v-if="s3Store.isLoading" class="p-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--aws-orange)]">
                </div>
                <p class="text-xs text-gray-500 mt-4">Loading objects...</p>
            </div>

            <div v-else-if="filteredFiles.length > 0">
                <div v-for="file in filteredFiles" :key="file.key"
                    :class="selectedFileIds.includes(file.key) ? 'bg-blue-50' : 'hover:bg-gray-50'"
                    class="border-b border-gray-200 flex text-[11px] text-gray-900 transition-colors">
                    <div class="w-10 p-2 border-r border-gray-200 flex justify-center items-center">
                        <input type="checkbox" :checked="selectedFileIds.includes(file.key)"
                            @change="toggleSelectOne(file.key)" class="w-3.5 h-3.5 rounded border-gray-300">
                    </div>
                    <div class="flex-1 p-2 border-r border-gray-200 flex items-center gap-2 overflow-hidden">
                        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span class="font-medium text-[var(--aws-blue)] hover:underline cursor-pointer truncate">{{
                            file.key }}</span>
                    </div>
                    <div class="w-32 p-2 border-r border-gray-200 flex items-center">{{ file.type || 'Binary' }}
                    </div>
                    <div class="w-48 p-2 border-r border-gray-200 flex items-center">{{
                        formatDate(file.last_modified) }}</div>
                    <div class="w-32 p-2 border-r border-gray-200 flex items-center">{{ formatSize(file.size) }}
                    </div>
                    <div class="w-40 p-2 flex items-center">{{ file.storage_class || 'Standard' }}</div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-12 text-center">
                <h3 class="text-sm font-bold text-gray-900 mb-1">No objects</h3>
                <p class="text-xs text-gray-500 mb-6">You don't have any objects in this bucket.</p>
                <button @click="router.push(`/s3/buckets/${bucketName}/upload`)"
                    class="px-4 py-1.5 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] hover:bg-blue-50/10 transition-colors rounded-sm bg-white flex items-center gap-1 mx-auto">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                </button>
            </div>
        </div>
    </div>
</template>
