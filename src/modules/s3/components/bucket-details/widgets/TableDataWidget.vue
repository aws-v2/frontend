
<script setup lang="ts">

import { useToastStore } from '@/shared/store/toastStore'
import { computed,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
 

const router = useRouter()

const props = defineProps<{
    isLoading:boolean
    bucketName:boolean
    filteredFiles:any
    showCreateFolderModal:boolean
    selectedF:string[]
}>()


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

type DisplayItem = {
    key: string
    name: string
    isFolder: boolean
    mime_type: string
    size: number
    last_modified: string
    storage_class: string
    file_id?: string
}

const selectedFileIds = ref<string[]>()

const navigateToObject = (item: DisplayItem) => {
    if (item.isFolder) {
        router.push(encodeURI(`/s3/buckets/${props.bucketName}/folder/${item.key}`))
    } else {
        router.push(encodeURI(`/s3/buckets/${props.bucketName}/objects/${item.key}?fileId=${item.file_id}`))
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
</script>
<template>
    <!-- Table Content -->
    <div v-if="isLoading" class="p-32 text-center bg-white italic">
        <div class="inline-block relative">
            <div class="w-16 h-16 border-4 border-[#fafafa] border-t-[#ff9900] rounded-none animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-8 h-8 border-4 border-[#fafafa] border-b-[#232f3e] rounded-none animate-spin-reverse">
                </div>
            </div>
        </div>
        <p class="text-[11px] font-black text-[#545b64] mt-8 uppercase tracking-[0.2em] animate-pulse">Scanning
            objects...
        </p>
    </div>

    <div v-else-if="filteredFiles.length > 0">
        <div v-for="item in filteredFiles" :key="item.key"
            class="hover:bg-[#fafafa] group border-b-2 border-[#eaeded] last:border-0 flex text-[13px] text-[#232f3e] transition-all cursor-pointer italic"
            :class="{ 'bg-[#ff9900]/[0.02]': selectedFileIds.includes(item.key) }" @click="toggleSelectOne(item.key)">
            <div class="w-16 p-4 border-r-2 border-[#eaeded] flex justify-center items-center shrink-0">
                <div class="w-5 h-5 border-2 border-[#eaeded] bg-white flex items-center justify-center transition-all"
                    :class="selectedFileIds.includes(item.key) ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]'">
                    <div v-if="selectedFileIds.includes(item.key)" class="w-2 h-2 bg-[#ff9900]"></div>
                </div>
            </div>
            <div class="flex-1 p-6 border-r-2 border-[#eaeded] flex items-center gap-6 overflow-hidden">
                <!-- Folder Icon -->
                <div v-if="item.isFolder" class="w-6 h-6 text-[#ff9900] shrink-0">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                </div>
                <!-- File Icon -->
                <div v-else class="w-6 h-6 text-[#545b64] shrink-0 group-hover:text-[#ff9900] transition-colors">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                        </path>
                    </svg>
                </div>
                <span
                    class="font-black text-[#232f3e] hover:text-[#ff9900] transition-colors truncate uppercase tracking-tight"
                    @click.stop="navigateToObject(item)">
                    {{ item.name }}
                </span>
            </div>
            <div
                class="w-40 p-6 border-r-2 border-[#eaeded] flex items-center text-[#545b64] font-bold uppercase tracking-widest text-[10px] shrink-0">
                {{ item.isFolder ? 'Folder' : (item.mime_type || 'Object') }}
            </div>
            <div
                class="w-64 p-6 border-r-2 border-[#eaeded] flex items-center text-[#545b64] font-bold uppercase tracking-widest text-[10px] shrink-0">
                {{ item.isFolder ? '-' : formatDate(item.last_modified) }}
            </div>
            <div
                class="w-40 p-6 border-r-2 border-[#eaeded] flex items-center text-[#232f3e] font-black uppercase tracking-tight shrink-0">
                {{ item.isFolder ? '-' : formatSize(item.size || 0) }}
            </div>
            <div class="w-48 p-6 flex items-center shrink-0">
                <span class="text-[#ff9900] font-black text-[10px] uppercase tracking-[0.2em] italic">
                    {{ item.isFolder ? '-' : (item.storage_class || 'Standard') }}
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
                <div class="absolute inset-0 bg-[#ff9900]/5 opacity-0 group-hover:opacity-100 transition-opacity">
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

</template>