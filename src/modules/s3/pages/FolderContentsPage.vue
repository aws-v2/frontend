<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'
import StorageMetricsWidget from '../components/bucket-details/widgets/StorageMetricsWidget.vue'
import BucketPropertiesWidget from '../components/bucket-details/widgets/BucketPropertiesWidget.vue'
import DeleteObjectModal from '../components/bucket-details/modals/DeleteObjectModal.vue'

const router = useRouter()
const route = useRoute()
const s3Store = useS3Store()
const toastStore = useToastStore()
const selectedFileIds = ref<string[]>([])
const searchQuery = ref('')
const showActionsDropdown = ref(false)
const showDeleteObjectModal = ref(false)

const selectedObjectsForDelete = computed(() => {
    return s3Store.files.filter(f => selectedFileIds.value.includes(f.key))
})

const bucketName = computed(() => route.params.bucketName as string)
const prefix = computed(() => {
    const p = route.params.prefix
    if (Array.isArray(p)) return p.join('/') + '/'
    return (p as string) || ''
})

const folderName = computed(() => {
    const parts = prefix.value.split('/').filter(Boolean)
    return parts[parts.length - 1] || 'root'
})

const displayItems = computed(() => {
    const items = s3Store.getDirectoryItems(prefix.value)
    if (!searchQuery.value) return items
    return items.filter((f: any) =>
        f.key.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const isAllSelected = computed(() => {
    return displayItems.value.length > 0 && selectedFileIds.value.length === displayItems.value.length
})

const isAnySelected = computed(() => selectedFileIds.value.length > 0)
const isSingleSelected = computed(() => selectedFileIds.value.length === 1)

const toggleSelectAll = () => {
    if (selectedFileIds.value.length === displayItems.value.length) {
        selectedFileIds.value = []
    } else {
        selectedFileIds.value = displayItems.value.map(f => f.key)
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

const handleClose = () => {
    router.push(`/s3/buckets/${bucketName.value}?tab=overview`)
}

const handleObjectClick = (item: any) => {
    if (item.isFolder || item.mime_type === 'folder' || item.key.endsWith('/')) {
        router.push(`/s3/buckets/${bucketName.value}/folder/${item.key}`)
    } else {
        router.push(`/s3/buckets/${bucketName.value}/objects/${encodeURIComponent(item.key)}`)
    }
}

const handleCopyS3URI = async () => {
    if (selectedFileIds.value.length === 1) {
        const s3Uri = `s3://${bucketName.value}/${selectedFileIds.value[0]}`
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
        const url = `https://${bucketName.value}.s3.amazonaws.com/${selectedFileIds.value[0]}`
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
                    await s3Store.downloadFile(bucketName.value, file.file_id, id.split('/').pop() || id)
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
    s3Store.fetchFiles(bucketName.value, prefix.value)
}

const contextualMetrics = computed(() => {
    const rawFiles = s3Store.files
    const p = prefix.value

    const folderFiles = rawFiles.filter(f => f.key.startsWith(p) && f.key !== p)
    const totalSize = folderFiles.reduce((acc, f) => acc + (f.size || 0), 0)
    const totalFiles = folderFiles.length

    const subfolders = new Set<string>()
    folderFiles.forEach(f => {
        const relative = f.key.slice(p.length)
        const parts = relative.split('/')
        if (parts.length > 1) {
            let curr = ''
            for (let i = 0; i < parts.length - 1; i++) {
                curr += parts[i] + '/'
                subfolders.add(p + curr)
            }
        }
    })

    return {
        totalSize,
        totalFiles,
        totalFolders: subfolders.size
    }
})

const breadcrumbs = computed(() => {
    if (!prefix.value) return []
    const parts = prefix.value.split('/').filter(p => p)
    let currentPath = ''
    return parts.map(part => {
        currentPath += part + '/'
        return { name: part, path: currentPath }
    })
})

onMounted(async () => {
    await s3Store.fetchFiles(bucketName.value, prefix.value)
})

watch(() => prefix.value, () => {
    selectedFileIds.value = []
})
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
            <span @click="handleClose" class="hover:text-[#ff9900] cursor-pointer transition-colors">
                {{ bucketName }}
            </span>
            <template v-for="(part, index) in breadcrumbs" :key="index">
                <span class="text-[#eaeded] font-normal not-italic mx-1">/</span>
                <span @click="router.push(`/s3/buckets/${bucketName}/folder/${part.path}`)"
                    class="hover:text-[#ff9900] cursor-pointer transition-colors">
                    {{ part.name }}
                </span>
            </template>
        </div>

        <div class="relative z-10 p-8 px-8 md:px-24 pt-16 max-w-[1800px] mx-auto space-y-8">
            <!-- Header -->
            <div
                class="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#eaeded] pb-8 gap-8">
                <div>
                    <h1
                        class="text-6xl font-black text-[#232f3e] flex items-baseline gap-6 tracking-tighter uppercase italic">
                        {{ folderName }}
                        <span
                            class="text-[12px] text-[#ff9900] bg-[#fafafa] px-4 py-1.5 border-2 border-[#eaeded] hover:border-[#ff9900] cursor-pointer uppercase font-black tracking-[0.2em] transition-all not-italic">
                            Folder Details
                        </span>
                    </h1>
                </div>
                <div class="flex gap-4">
                    <button @click="router.push(`/s3/buckets/${bucketName}/upload?prefix=${prefix}`)"
                        class="px-8 py-3 bg-white border-2 border-[#eaeded] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:border-[#ff9900] transition-all active:scale-95 italic">
                        Upload Objects
                    </button>
                    <button @click="handleClose"
                        class="px-10 py-3 bg-[#ff9900] text-[#232f3e] text-xs font-black uppercase tracking-widest hover:bg-[#ff9900]/90 transition-all shadow-xl shadow-[#ff9900]/20 active:scale-95">
                        Close View
                    </button>
                </div>
            </div>

            <!-- Widgets Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <div
                    class="bg-white border-2 border-[#eaeded] p-8 flex flex-col justify-center relative overflow-hidden group italic">
                    <div
                        class="absolute -top-10 -right-10 w-24 h-24 bg-[#ff9900]/5 rounded-full blur-2xl transition-all duration-700">
                    </div>
                    <div class="relative">
                        <h2 class="text-[10px] font-black text-[#ff9900] uppercase tracking-[0.2em] mb-4 italic">Current
                            Path
                        </h2>
                        <code
                            class="text-sm font-black text-[#232f3e] bg-[#fafafa] px-4 py-2 border-2 border-[#eaeded] break-all block">
                    {{ prefix }}
                </code>
                    </div>
                </div>
                <div class="lg:col-span-2">
                    <StorageMetricsWidget :totalSize="contextualMetrics.totalSize"
                        :totalFiles="contextualMetrics.totalFiles" :totalFolders="contextualMetrics.totalFolders"
                        :changePercent="0" :usagePercent="0" />
                </div>
            </div>

            <!-- Objects Section -->
            <div
                class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <!-- Toolbar -->
                <div class="p-8 border-b-2 border-[#eaeded] bg-[#fafafa] space-y-8 relative">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <h2
                            class="text-3xl font-black text-[#232f3e] tracking-tighter flex items-center gap-4 uppercase italic">
                            Objects
                            <span
                                class="text-xs bg-white text-[#ff9900] px-4 py-1.5 border-2 border-[#eaeded] font-black tracking-[0.2em] italic">
                                {{ displayItems.length }}
                            </span>
                        </h2>
                        <div class="flex flex-wrap gap-3">
                            <button @click="handleCopyS3URI" :disabled="!isSingleSelected"
                                :class="isSingleSelected ? 'bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                                class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                                Copy S3 URI
                            </button>
                            <button @click="handleCopyURL" :disabled="!isSingleSelected"
                                :class="isSingleSelected ? 'bg-white border-2 border-[#eaeded] text-[#232f3e] hover:border-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                                class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                                Copy URL
                            </button>
                            <button @click="handleDownload" :disabled="!isAnySelected"
                                :class="isAnySelected ? 'bg-white border-2 border-[#eaeded] text-[#ff9900] hover:border-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                                class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                                Download
                            </button>
                            <button @click="handleObjectClick(s3Store.files.find(f => f.key === selectedFileIds[0]))"
                                :disabled="!isSingleSelected"
                                :class="isSingleSelected ? 'bg-white border-2 border-[#ff9900] text-[#ff9900]' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                                class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                                Open ↗
                            </button>
                            <button @click="handleDelete" :disabled="!isAnySelected"
                                :class="isAnySelected ? 'bg-[#232f3e] text-white border-2 border-[#232f3e] hover:bg-rose-600 hover:border-rose-600' : 'bg-[#fafafa] border-2 border-[#eaeded] text-[#545b64] cursor-not-allowed opacity-50'"
                                class="px-6 py-2.5 text-xs font-black transition-all uppercase tracking-widest italic active:scale-95">
                                Delete
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                        <div class="relative w-full max-w-md group">
                            <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <svg class="w-6 h-6 text-[#545b64] group-focus-within:text-[#ff9900] transition-colors"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input v-model="searchQuery" type="text" placeholder="Find objects by prefix..."
                                class="w-full pl-14 pr-6 py-4 text-sm bg-white border-2 border-[#eaeded] text-[#232f3e] focus:outline-none focus:border-[#ff9900] transition-all placeholder:text-[#eaeded] font-black uppercase tracking-tight">
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead
                            class="bg-[#fafafa] border-b-2 border-[#eaeded] text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                            <tr>
                                <th class="w-16 p-6 border-r-2 border-[#eaeded] text-center">
                                    <div @click="toggleSelectAll"
                                        class="w-5 h-5 border-2 border-[#eaeded] bg-white flex items-center justify-center cursor-pointer hover:border-[#ff9900] transition-all mx-auto">
                                        <div v-if="isAllSelected" class="w-2 h-2 bg-[#ff9900]"></div>
                                    </div>
                                </th>
                                <th class="p-6 border-r-2 border-[#eaeded]">Name</th>
                                <th class="p-6 border-r-2 border-[#eaeded]">Type</th>
                                <th class="p-6 border-r-2 border-[#eaeded]">Last modified</th>
                                <th class="p-6 border-r-2 border-[#eaeded]">Size</th>
                                <th class="p-6">Storage Class</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y-2 divide-[#eaeded]">
                            <tr v-for="item in displayItems" :key="(item as any).key"
                                :class="{ 'bg-emerald-500/[0.05]': selectedFileIds.includes((item as any).key) }"
                                class="group hover:bg-white/[0.02] transition-colors">
                                <td class="p-6 text-center" @click.stop="toggleSelectOne((item as any).key)">
                                    <div class="flex justify-center">
                                        <div class="w-4 h-4 rounded-md border border-white/20 group-hover:border-emerald-500/50 transition-colors cursor-pointer flex items-center justify-center"
                                            :class="selectedFileIds.includes((item as any).key) ? 'border-emerald-500 bg-emerald-500/20' : ''">
                                            <div v-if="selectedFileIds.includes((item as any).key)"
                                                class="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-6 border-r border-white/5" @click="handleObjectClick(item)">
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center transition-all group-hover:bg-emerald-500/10 group-hover:text-emerald-400">
                                            <svg v-if="(item as any).isFolder || (item as any).mime_type === 'folder' || (item as any).key.endsWith('/')"
                                                class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                            </svg>
                                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span
                                            class="text-sm font-bold text-slate-300 group-hover:text-emerald-400 transition-colors truncate max-w-xs">
                                            {{ (item as any).key.slice(prefix.length) }}
                                        </span>
                                    </div>
                                </td>
                                <td class="p-6 border-r border-white/5">
                                    <span
                                        class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
                                        {{ (item as any).isFolder ? 'Folder' : ((item as any).mime_type || '-') }}
                                    </span>
                                </td>
                                <td
                                    class="p-6 border-r border-white/5 text-[11px] text-slate-500 font-medium tabular-nums group-hover:text-slate-400">
                                    {{ formatDate((item as any).last_modified) || '-' }}
                                </td>
                                <td
                                    class="p-6 border-r border-white/5 text-[11px] text-slate-500 font-bold tabular-nums group-hover:text-slate-400">
                                    {{ (item as any).isFolder ? '-' : formatSize((item as any).size || 0) }}
                                </td>
                                <td
                                    class="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/70 group-hover:text-indigo-400 transition-colors">
                                    {{ (item as any).storage_class || 'Standard' }}
                                </td>
                            </tr>
                            <tr v-if="displayItems.length === 0">
                                <td colspan="6" class="p-32 text-center bg-[#fafafa]/50 italic group">
                                    <div
                                        class="flex flex-col items-center gap-6 opacity-30 group-hover:opacity-50 transition-all">
                                        <svg class="w-16 h-16 text-[#545b64]" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <p class="text-xs font-black uppercase tracking-[0.3em] text-[#232f3e]">This
                                            folder is
                                            empty</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Object Modal -->
    <DeleteObjectModal v-if="showDeleteObjectModal" :isOpen="showDeleteObjectModal" :bucketName="bucketName"
        :objects="selectedObjectsForDelete" @close="showDeleteObjectModal = false" @success="handleDeleteSuccess" />
</template>

<style scoped>
.animate-in {
    animation-name: fadeIn;
    animation-duration: 0.5s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    animation-fill-mode: forwards;
}

.fade-in {
    animation-name: fadeIn;
}

.slide-in-from-bottom-4 {
    animation-name: slideInFromBottom;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideInFromBottom {
    from {
        transform: translateY(16px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
