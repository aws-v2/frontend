<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useS3Store } from '../store/s3Store'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close', 'select'])
const s3Store = useS3Store()

const searchQuery = ref('')
const selectedBucket = ref('')

const refreshBuckets = async () => {
    await s3Store.fetchBuckets()
}

onMounted(() => {
    if (s3Store.buckets.length === 0) {
        s3Store.fetchBuckets()
    }
})

const filteredBuckets = computed(() => {
    if (!searchQuery.value) return s3Store.buckets
    return s3Store.buckets.filter(b => b.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const handleClose = () => {
    emit('close')
}

const handleSelect = () => {
    if (selectedBucket.value) {
        emit('select', selectedBucket.value)
        emit('close')
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-start justify-center pt-20 italic">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#232f3e]/60 backdrop-blur-sm" @click="handleClose"></div>

        <!-- Modal Content -->
        <div
            class="relative bg-white w-full max-w-5xl shadow-2xl flex flex-col max-h-[80vh] border-4 border-[#232f3e] overflow-hidden italic">
            <!-- Header -->
            <div class="flex items-center justify-between px-10 py-8 border-b-2 border-[#eaeded] bg-[#fafafa]">
                <div>
                    <h2 class="text-4xl font-black text-[#232f3e] tracking-tighter uppercase italic leading-tight">
                        Choose Bucket</h2>
                    <p class="text-[11px] text-[#ff9900] font-black uppercase tracking-[0.2em] mt-2 italic">S3 Asset
                        Selection Layer</p>
                </div>
                <button @click="handleClose"
                    class="text-[#545b64] hover:text-[#ff9900] transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] active:scale-95">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-10 flex-1 overflow-y-auto bg-white custom-scrollbar">
                <div class="border-2 border-[#eaeded] overflow-hidden bg-[#fafafa]">
                    <!-- Toolbar -->
                    <div
                        class="flex flex-col md:flex-row items-center justify-between p-6 border-b-2 border-[#eaeded] bg-white gap-6">
                        <div class="flex items-center gap-6 w-full max-w-2xl">
                            <span
                                class="text-[11px] font-black text-[#545b64] px-4 py-2 border-2 border-[#eaeded] whitespace-nowrap uppercase tracking-widest italic">
                                Buckets <span class="text-[#ff9900]">({{ filteredBuckets.length }}/{{
                                    s3Store.buckets.length }})</span>
                            </span>
                            <div class="relative w-full group">
                                <svg class="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-[#545b64] group-focus-within:text-[#ff9900] transition-colors"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input v-model="searchQuery" type="text" placeholder="FILTER BY NAME..."
                                    class="w-full pl-14 pr-6 py-4 bg-white border-2 border-[#eaeded] text-sm font-black text-[#232f3e] placeholder-[#eaeded] focus:outline-none focus:border-[#ff9900] transition-all uppercase italic tracking-tight shadow-inner">
                            </div>
                        </div>
                        <div class="flex items-center gap-8">
                            <button @click="refreshBuckets"
                                class="text-[#545b64] hover:text-[#ff9900] transition-all p-2 bg-white border-2 border-[#eaeded] hover:border-[#ff9900] active:rotate-180 duration-500"
                                :disabled="s3Store.isLoading">
                                <svg class="w-6 h-6" :class="{ 'animate-spin': s3Store.isLoading }" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <div
                                class="flex items-center gap-4 text-[10px] font-black text-[#545b64] uppercase tracking-widest italic">
                                <button disabled class="opacity-20 cursor-not-allowed text-xl">&lt;</button>
                                <span class="text-[#ff9900] px-3 py-1 bg-white border-2 border-[#eaeded]">1</span>
                                <button disabled class="opacity-20 cursor-not-allowed text-xl">&gt;</button>
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-white border-b-2 border-[#eaeded] italic">
                                <tr>
                                    <th class="w-20 p-6 border-r-2 border-[#eaeded]"></th>
                                    <th
                                        class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] border-r-2 border-[#eaeded]">
                                        Namespace</th>
                                    <th class="p-6 text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em]">
                                        Regional Zone</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y-2 divide-[#eaeded]">
                                <tr v-for="bucket in filteredBuckets" :key="bucket.name"
                                    class="group hover:bg-[#ff9900]/[0.02] cursor-pointer transition-colors italic"
                                    :class="selectedBucket === bucket.name ? 'bg-[#ff9900]/[0.05]' : 'bg-white'"
                                    @click="selectedBucket = bucket.name">
                                    <td class="p-6 text-center border-r-2 border-[#eaeded]">
                                        <div class="flex justify-center">
                                            <div class="w-6 h-6 border-2 border-[#eaeded] flex items-center justify-center transition-all bg-white"
                                                :class="selectedBucket === bucket.name ? 'border-[#ff9900] bg-[#ff9900]/10' : 'group-hover:border-[#ff9900]'">
                                                <div v-if="selectedBucket === bucket.name"
                                                    class="w-3 h-3 bg-[#ff9900] rotate-45 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-6 text-base font-black border-r-2 border-[#eaeded] uppercase tracking-tight"
                                        :class="selectedBucket === bucket.name ? 'text-[#ff9900]' : 'text-[#232f3e]'">
                                        {{ bucket.name }}
                                    </td>
                                    <td class="p-6 text-[11px] font-bold text-[#545b64] uppercase tracking-widest">
                                        {{ bucket.region }}
                                    </td>
                                </tr>
                                <tr v-if="filteredBuckets.length === 0">
                                    <td colspan="3"
                                        class="p-24 text-center text-[#eaeded] italic bg-white relative overflow-hidden">
                                        <div class="relative z-10 flex flex-col items-center gap-6">
                                            <svg class="w-16 h-16 text-[#eaeded]" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <span class="text-3xl font-black uppercase tracking-tighter">No Active Nodes
                                                Found</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="bg-[#fafafa] px-10 py-8 border-t-2 border-[#eaeded] flex justify-end gap-6 shadow-inner relative">
                <button @click="handleClose"
                    class="px-10 py-3 text-[11px] font-black text-[#545b64] hover:text-[#ff9900] uppercase tracking-widest transition-all italic active:scale-95">Cancel</button>
                <button @click="handleSelect" :disabled="!selectedBucket" :class="selectedBucket
                    ? 'bg-[#232f3e] text-white hover:bg-black shadow-2xl'
                    : 'bg-[#fafafa] text-[#eaeded] border-2 border-[#eaeded] cursor-not-allowed'"
                    class="px-12 py-3 text-[11px] font-black transition-all duration-300 uppercase tracking-widest italic active:scale-95">
                    Select Target
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #fafafa;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eaeded;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ff9900;
}
</style>
