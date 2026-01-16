<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useS3Store } from '../store/s3Store'

const router = useRouter()
const route = useRoute()
const s3Store = useS3Store()

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const bucketName = computed(() => route.params.bucketName as string)
const result = computed(() => s3Store.lastUploadResult)

const handleClose = () => {
    router.push(`/s3/buckets/${bucketName.value}?tab=objects`)
}

const activeTab = 'files'
</script>

<template>
    <div class="min-h-screen bg-gray-100 font-sans pb-24">
        <!-- Top Banner -->
        <div class="bg-[var(--aws-green)] text-white px-6 py-3 flex justify-between items-center shadow-sm">
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                    <p class="text-sm font-bold tracking-tight">Upload succeeded</p>
                    <p class="text-[11px] opacity-90">For more information, see the Files and folders table.</p>
                </div>
            </div>
            <button @click="handleClose" class="text-white opacity-80 hover:opacity-100 text-lg">×</button>
        </div>

        <div class="p-8 px-10 space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Upload: status</h1>
                </div>
                <button @click="handleClose"
                    class="px-6 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90 transition-opacity shadow-sm">
                    Close
                </button>
            </div>

            <!-- Info Alert -->
            <div class="border border-[var(--aws-blue)] bg-white p-4 rounded-sm flex items-start gap-3 shadow-sm">
                <svg class="w-5 h-5 text-[var(--aws-blue)] shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-gray-600">
                    After you navigate away from this page, the following information is no longer available.
                </p>
            </div>

            <!-- Summary Card -->
            <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div class="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-tight">Summary</h2>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Destination</p>
                        <p class="text-xs text-[var(--aws-blue)] hover:underline cursor-pointer font-mono">
                            {{ result?.destination || `s3://${bucketName}/` }}
                        </p>
                    </div>
                    <div>
                        <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Succeeded</p>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-[var(--aws-green)]" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            <span class="text-xs text-gray-900 font-bold">
                                {{ result?.succeededCount || 0 }} file, {{ formatSize(result?.totalSize || 0) }}
                                (100.00%)
                            </span>
                        </div>
                    </div>
                    <div>
                        <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Failed</p>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span class="text-xs text-gray-900">
                                {{ result?.failedCount || 0 }} files, 0 B (0%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 flex gap-8">
                <button
                    class="pb-2 text-sm font-bold border-b-2 transition-colors px-1 border-[var(--aws-blue)] text-[var(--aws-blue)]">
                    Files and folders
                </button>
                <button
                    class="pb-2 text-sm font-bold border-b-2 transition-colors px-1 border-transparent text-gray-600">
                    Configuration
                </button>
            </div>

            <!-- Table Section -->
            <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-bold text-gray-900">
                        Files and folders ({{ result?.succeededCount || 0 }} total, {{ formatSize(result?.totalSize ||
                            0) }})
                    </h3>
                </div>

                <!-- Table Toolbar -->
                <div class="p-3 bg-gray-50 flex items-center">
                    <div class="relative w-full max-w-sm">
                        <svg class="absolute left-3 top-2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Find by name"
                            class="w-full pl-9 pr-4 py-1 text-xs border border-gray-400 rounded-sm outline-none focus:ring-1 focus:ring-[var(--aws-blue)]">
                    </div>
                    <div class="ml-auto flex items-center gap-4 text-gray-400">
                        <span class="text-xs">&lt; 1 &gt;</span>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead
                            class="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th class="px-4 py-2 border-r border-gray-200">Name</th>
                                <th class="px-4 py-2 border-r border-gray-200">Folder</th>
                                <th class="px-4 py-2 border-r border-gray-200">Type</th>
                                <th class="px-4 py-2 border-r border-gray-200">Size</th>
                                <th class="px-4 py-2 border-r border-gray-200">Status</th>
                                <th class="px-4 py-2">Error</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="file in result?.files" :key="file.name" class="hover:bg-gray-50">
                                <td
                                    class="px-4 py-2 border-r border-gray-200 text-[var(--aws-blue)] hover:underline cursor-pointer flex items-center gap-1">
                                    {{ file.name }}
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </td>
                                <td class="px-4 py-2 border-r border-gray-200">-</td>
                                <td class="px-4 py-2 border-r border-gray-200 text-gray-500">{{ file.type }}</td>
                                <td class="px-4 py-2 border-r border-gray-200 text-gray-500">{{ formatSize(file.size) }}
                                </td>
                                <td class="px-4 py-2 border-r border-gray-200">
                                    <div class="flex items-center gap-1.5 text-[var(--aws-green)] font-bold">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                        {{ file.status }}
                                    </div>
                                </td>
                                <td class="px-4 py-2 text-gray-400">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
