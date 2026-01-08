```
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import KenyanCostHeader from '../components/bucket-details/widgets/KenyanCostHeader.vue'
import StorageMetricsWidget from '../components/bucket-details/widgets/StorageMetricsWidget.vue'

const router = useRouter()
const route = useRoute()
const s3Store = useS3Store()

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

const displayItems = computed(() => s3Store.getDirectoryItems(prefix.value))

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const handleClose = () => {
    // Navigate back to the parent folder or root bucket
    const parts = prefix.value.split('/').filter(Boolean)
    if (parts.length <= 1) {
        router.push(`/s3/buckets/${bucketName.value}?tab=objects`)
    } else {
        const parentPrefix = parts.slice(0, -1).join('/') + '/'
        router.push(`/s3/buckets/${bucketName.value}/folder/${parentPrefix}`)
    }
}

const handleObjectClick = (item: any) => {
    if ((item as any).isFolder || item.mime_type === 'folder' || item.key.endsWith('/')) {
        router.push(`/s3/buckets/${bucketName.value}/folder/${item.key}`)
    } else {
        router.push(`/s3/buckets/${bucketName.value}/objects/${encodeURIComponent(item.key)}`)
    }
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

onMounted(async () => {
    await s3Store.fetchFiles(bucketName.value, prefix.value)
})
</script>

<template>
    <div class="min-h-screen bg-gray-100 font-sans pb-24">
        <div class="p-8 px-10 space-y-6">
            <!-- Kenyan Cost Header -->
            <KenyanCostHeader :cost="145.50" :changePercent="-12" :dataSaverOn="true" @topUp="() => { }" />

            <!-- Storage Metrics (Simplified for folder view) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    class="border border-gray-200 rounded-sm bg-white p-4 flex flex-col justify-center h-full shadow-sm">
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Current Folder</p>
                    <p class="text-lg font-bold text-gray-900 truncate">{{ folderName }}</p>
                    <p class="text-[10px] text-[var(--aws-blue)] font-mono truncate">{{ prefix }}</p>
                </div>
                <StorageMetricsWidget :totalSize="contextualMetrics.totalSize"
                    :totalFiles="contextualMetrics.totalFiles" :totalFolders="contextualMetrics.totalFolders"
                    :changePercent="0" :usagePercent="0" />
            </div>

            <!-- Header -->
            <div class="flex justify-between items-start">
                <div>
                    <nav class="flex text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                        <router-link :to="`/s3/buckets/${bucketName}?tab=objects`"
                            class="hover:underline">Objects</router-link>
                        <span class="mx-2">/</span>
                        <span>{{ prefix }}</span>
                    </nav>
                    <h1 class="text-2xl font-bold text-gray-900">Folder: {{ folderName }}</h1>
                </div>
                <div class="flex gap-3">
                    <button @click="router.push(`/s3/buckets/${bucketName}/upload?prefix=${prefix}`)"
                        class="px-6 py-1.5 text-xs font-bold bg-white border border-gray-400 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors shadow-sm">
                        Upload
                    </button>
                    <button @click="handleClose"
                        class="px-6 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 transition-opacity shadow-sm">
                        Close
                    </button>
                </div>
            </div>

            <!-- Table Section (Mimicking the Status UI) -->
            <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-bold text-gray-900">
                        Objects ({{ displayItems.length }})
                    </h3>
                </div>

                <!-- Table Toolbar -->
                <div class="p-3 bg-gray-50 flex items-center gap-3">
                    <div class="relative w-full max-w-sm">
                        <svg class="absolute left-3 top-2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Find objects by prefix"
                            class="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-400 rounded-sm outline-none focus:ring-1 focus:ring-[var(--aws-blue)]">
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead
                            class="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th class="px-4 py-3 border-r border-gray-200 w-12 text-center">
                                    <input type="checkbox" class="rounded-sm border-gray-400">
                                </th>
                                <th class="px-4 py-2 border-r border-gray-200">Name</th>
                                <th class="px-4 py-2 border-r border-gray-200">Type</th>
                                <th class="px-4 py-2 border-r border-gray-200">Last modified</th>
                                <th class="px-4 py-2 border-r border-gray-200">Size</th>
                                <th class="px-4 py-2">Storage class</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="item in displayItems" :key="item.key" class="hover:bg-gray-50">
                                <td class="px-4 py-3 border-r border-gray-200 text-center">
                                    <input type="checkbox" class="rounded-sm border-gray-400">
                                </td>
                                <td class="px-4 py-2 border-r border-gray-200 font-medium whitespace-nowrap">
                                    <div class="flex items-center gap-2 cursor-pointer"
                                        @click="handleObjectClick(item)">
                                        <svg v-if="(item as any).isFolder || item.mime_type === 'folder' || item.key.endsWith('/')"
                                            class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                        <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-[var(--aws-blue)] hover:underline">
                                            {{ item.key.slice(prefix.length) }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-4 py-2 border-r border-gray-200 text-gray-500">
                                    {{ (item as any).isFolder ? 'Folder' : (item.mime_type || '-') }}
                                </td>
                                <td class="px-4 py-2 border-r border-gray-200 text-gray-500 whitespace-nowrap">
                                    {{ (item as any).last_modified || '-' }}
                                </td>
                                <td class="px-4 py-2 border-r border-gray-200 text-gray-500">
                                    {{ (item as any).isFolder ? '-' : formatSize((item as any).size || 0) }}
                                </td>
                                <td class="px-4 py-2 text-gray-500 whitespace-nowrap">
                                    {{ (item as any).storage_class || 'Standard' }}
                                </td>
                            </tr>
                            <tr v-if="displayItems.length === 0">
                                <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                                    This folder is empty.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
