<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const s3Store = useS3Store()
const toastStore = useToastStore()

const createBucket = () => {
    router.push('/s3/create-bucket')
}

const copyArn = (name: string) => {
    toastStore.addToast(`ARN for ${name} copied to clipboard`, 'success')
}

const viewBucket = (bucket: any) => {
    // Extract region code if possible, or use the full string/default
    // The store seems to save "Europe (Stockholm) eu-north-1"
    // We try to extract "eu-north-1" or just pass it all.
    // Simple extraction:
    const regionCode = bucket.region.split(' ').pop() || 'eu-north-1'

    router.push({
        path: `/s3/buckets/${bucket.name}`,
        query: {
            region: regionCode,
            tab: 'objects'
        }
    })
}
</script>

<template>
    <div class="min-h-screen bg-white font-sans p-8 px-16">
        <!-- Success Banner -->
        <div v-if="s3Store.buckets.length > 0"
            class="mb-8 p-4 bg-green-700 text-white rounded-sm flex justify-between items-center shadow-md">
            <div class="flex items-center gap-3">
                <div class="w-5 h-5 bg-white text-green-700 rounded-full flex items-center justify-center font-bold">✓
                </div>
                <div>
                    <p class="text-xs font-bold">Successfully created bucket "{{ s3Store.buckets[s3Store.buckets.length
                        - 1].name }}"</p>
                    <p class="text-[10px] opacity-80">To upload files and folders, or to configure additional bucket
                        settings, choose View details.</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button
                    class="px-4 py-1.5 text-[10px] font-bold border border-white/50 hover:bg-white/10 rounded-sm">View
                    details</button>
                <button class="p-1 hover:bg-white/10 rounded-sm">✕</button>
            </div>
        </div>

        <div class="flex justify-between items-end mb-8 border-b border-gray-200 pb-2">
            <div class="flex gap-8 text-[11px] font-bold text-gray-500">
                <span class="text-gray-900 border-b-2 border-[var(--aws-blue)] pb-2 cursor-pointer">General purpose
                    buckets</span>
                <span class="hover:text-gray-900 cursor-pointer pb-2">Directory buckets</span>
            </div>
        </div>

        <!-- Table Controls -->
        <div class="border border-gray-200 rounded-sm">
            <div class="p-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-200">
                <div class="flex items-center gap-2">
                    <h2 class="text-lg font-bold text-gray-900">General purpose buckets ({{ s3Store.buckets.length }})
                    </h2>
                    <span
                        class="text-[10px] text-[var(--aws-blue)] hover:underline cursor-pointer uppercase font-bold tracking-tight">Info</span>
                </div>
                <div class="flex gap-2">
                    <button class="p-2 border border-gray-300 rounded-sm hover:bg-gray-100"><svg class="w-3.5 h-3.5"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg></button>
                    <button
                        class="px-4 py-1.5 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-100">Copy
                        ARN</button>
                    <button
                        class="px-4 py-1.5 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-100">Empty</button>
                    <button
                        class="px-4 py-1.5 text-xs font-bold border border-gray-300 rounded-sm hover:bg-gray-100">Delete</button>
                    <button @click="createBucket"
                        class="px-4 py-1.5 text-xs font-bold bg-[var(--aws-orange)] text-white rounded-sm hover:opacity-90">Create
                        bucket</button>
                </div>
            </div>

            <!-- Search and Pagination -->
            <div class="p-4 flex justify-between items-center border-b border-gray-200">
                <div class="relative w-96">
                    <svg class="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 font-bold" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Find buckets by name"
                        class="w-full pl-9 pr-4 py-2 border border-gray-400 text-xs focus:ring-1 focus:ring-[var(--aws-blue)] outline-none placeholder-gray-400">
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                    <div class="flex items-center gap-1">
                        <span class="hover:text-gray-900 cursor-pointer">⟨</span>
                        <span class="text-gray-900 font-bold">1</span>
                        <span class="hover:text-gray-900 cursor-pointer">⟩</span>
                    </div>
                    <svg class="w-4 h-4 hover:text-gray-900 cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.43 7.5l-4.73.61c-1.61.21-2.26 2.21-1.09 3.32l3.43 3.25-1.12 4.7c-.38 1.58 1.28 2.78 2.68 2.04L10 19.16l4.4 2.26c1.4.72 3.06-.48 2.68-2.04l-1.12-4.7 3.43-3.25c1.17-1.11.52-3.11-1.09-3.32l-4.73-.61-1.08-4.33z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
            </div>

            <!-- Table -->
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr class="text-[11px] font-bold text-gray-600">
                        <th class="w-10 p-4"><input type="checkbox" class="w-4 h-4 rounded border-gray-300"></th>
                        <th class="p-4 border-r border-gray-200">Name</th>
                        <th class="p-4 border-r border-gray-200">AWS Region</th>
                        <th class="p-4">Creation date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="bucket in s3Store.buckets" :key="bucket.name"
                        class="border-b border-gray-100 hover:bg-gray-50 text-[12px] group">
                        <td class="p-4"><input type="checkbox" class="w-4 h-4 rounded border-gray-300"></td>
                        <td class="p-4"><span @click="viewBucket(bucket)"
                                class="text-[var(--aws-blue)] font-bold hover:underline cursor-pointer">{{
                                    bucket.name }}</span></td>
                        <td class="p-4 text-gray-600">{{ bucket.region }}</td>
                        <td class="p-4 text-gray-600">{{ bucket.creationDate }}</td>
                    </tr>
                    <tr v-if="s3Store.buckets.length === 0">
                        <td colspan="4" class="p-12 text-center text-gray-400 text-sm italic">No buckets found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Side Panels (Account Snapshot) -->
        <div class="mt-8 grid grid-cols-3 gap-6">
            <div class="col-span-2"></div> <!-- Spacer -->
            <div class="space-y-6">
                <div class="border border-gray-200 rounded-sm p-6 bg-white shadow-sm">
                    <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                        Account snapshot <span
                            class="text-[var(--aws-blue)] hover:underline cursor-pointer font-bold text-[10px] uppercase">Info</span>
                    </h3>
                    <div
                        class="bg-gray-800 text-white p-2 text-[8px] font-bold uppercase tracking-widest inline-block mb-4 rounded-sm">
                        Updated daily</div>
                    <p class="text-[11px] text-gray-600 mb-6 leading-relaxed">Storage Lens provides visibility into
                        storage usage and activity trends.</p>
                    <button
                        class="w-full py-2 border-2 border-[var(--aws-blue)] text-[var(--aws-blue)] font-bold text-xs hover:bg-blue-50 transition-colors uppercase">View
                        dashboard</button>
                </div>
            </div>
        </div>
    </div>
</template>
