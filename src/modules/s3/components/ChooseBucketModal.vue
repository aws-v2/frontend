<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const selectedBucket = ref('')
// Mock data matching the screenshot
const buckets = ref([
    { name: 'serwin-test', region: 'Europe (Stockholm) eu-north-1' }
])

const filteredBuckets = computed(() => {
    if (!searchQuery.value) return buckets.value
    return buckets.value.filter(b => b.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const handleClose = () => {
    emit('close')
}

const handleSelect = () => {
    if (selectedBucket.value) {
        emit('select', selectedBucket.value)
        emit('close') // Or keep open? Usually closes.
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-start justify-center pt-20" role="dialog"
        aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px]" @click="handleClose"></div>

        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-5xl shadow-xl flex flex-col max-h-[80vh] rounded-sm">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                    <h2 class="text-lg font-bold text-gray-900 leading-tight">Choose bucket</h2>
                    <p class="text-xs text-gray-500 mt-1">S3 Buckets</p>
                </div>
                <button @click="handleClose" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 flex-1 overflow-y-auto">
                <div class="border border-gray-300 rounded-sm overflow-hidden">
                    <!-- Toolbar -->
                    <div class="flex items-center justify-between p-2 border-b border-gray-200 bg-white">
                        <div class="flex items-center gap-2 w-full max-w-xl">
                            <span class="text-lg font-bold text-gray-900 px-2 whitespace-nowrap">Buckets ({{
                                filteredBuckets.length }}/{{ buckets.length }})</span>
                            <div class="relative w-full">
                                <svg class="w-4 h-4 absolute left-2 top-2.5 text-gray-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input v-model="searchQuery" type="text" placeholder="Find buckets by name"
                                    class="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-[var(--aws-blue)] focus:border-[var(--aws-blue)] outline-none">
                            </div>
                        </div>
                        <div class="flex items-center gap-4 px-2">
                            <button class="text-gray-600 hover:text-gray-900">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <button disabled class="opacity-50">&lt;</button>
                                <span class="font-bold">1</span>
                                <button disabled class="opacity-50">&gt;</button>
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="w-10 p-2 border-r border-gray-200"></th>
                                <th class="p-2 text-xs font-bold text-gray-600 border-r border-gray-200">Name</th>
                                <th class="p-2 text-xs font-bold text-gray-600">AWS Region</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="bucket in filteredBuckets" :key="bucket.name"
                                class="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer"
                                :class="selectedBucket === bucket.name ? 'bg-blue-50' : ''"
                                @click="selectedBucket = bucket.name">
                                <td class="p-3 text-center">
                                    <input type="radio" :checked="selectedBucket === bucket.name"
                                        class="w-4 h-4 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)] border-gray-300">
                                </td>
                                <td class="p-2 text-sm text-blue-600 font-medium hover:underline">{{ bucket.name }}</td>
                                <td class="p-2 text-sm text-gray-600">{{ bucket.region }}</td>
                            </tr>
                            <tr v-if="filteredBuckets.length === 0">
                                <td colspan="3" class="p-8 text-center text-gray-500 text-sm">
                                    No buckets found
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-sm">
                <button @click="handleClose"
                    class="px-5 py-1.5 text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded-sm">Cancel</button>
                <button @click="handleSelect" :disabled="!selectedBucket"
                    :class="selectedBucket ? 'bg-[var(--aws-orange)] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'"
                    class="px-5 py-1.5 text-xs font-bold text-white transition-opacity rounded-sm">
                    Choose bucket
                </button>
            </div>
        </div>
    </div>
</template>
