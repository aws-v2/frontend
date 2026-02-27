<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

const form = ref({
    name: '',
    size: 20,
    type: 'gp3',
    az: 'us-east-1a'
})

const isSubmitting = ref(false)

const handleCreate = async () => {
    isSubmitting.value = true
    try {
        await computeStore.createVolume(form.value)
        router.push({ name: 'volumes-list' })
    } catch (error) {
        console.error('Failed to create volume:', error)
    } finally {
        isSubmitting.value = false
    }
}

const goBack = () => router.push({ name: 'volumes-list' })
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-4xl mx-auto space-y-12">
            <!-- Navigation -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <button @click="goBack" class="hover:text-blue-600 transition-colors">VOLUMES_INVENTORY</button>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">PROVISION_BLOCK_RESOURCE</span>
            </nav>

            <!-- Header -->
            <div class="border-l-8 border-blue-600 pl-10 py-4 mb-20">
                <h1 class="text-7xl font-black text-[#232f3e] tracking-tight uppercase leading-none mb-4">
                    Create <span class="text-blue-600 italic">Volume</span>
                </h1>
                <p class="text-[11px] font-black text-[#879196] uppercase tracking-[0.4em]">Initialize New
                    High-Performance Storage Entity</p>
            </div>

            <!-- Form -->
            <div class="bg-[#fafafa] border-4 border-[#232f3e] p-12 space-y-12 relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16">
                </div>

                <div class="grid md:grid-cols-2 gap-12">
                    <!-- Name -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">RESOURCE_IDENTIFIER</label>
                        <input v-model="form.name" type="text" placeholder="e.g. DATA_CORE_01"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none">
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Unique
                            logical name for fleet tracking.</p>
                    </div>

                    <!-- Size -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">CAPACITY_GIB</label>
                        <div class="relative">
                            <input v-model.number="form.size" type="number" min="1" max="16384"
                                class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none">
                            <span
                                class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest">GIB_UNIT</span>
                        </div>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                            Configurable from 1 GiB to 16 TiB.</p>
                    </div>

                    <!-- Type -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">STORAGE_TIER</label>
                        <select v-model="form.type"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none appearance-none cursor-pointer">
                            <option value="gp3">General Purpose SSD (gp3)</option>
                            <option value="gp2">General Purpose SSD (gp2)</option>
                            <option value="io2">Provisioned IOPS SSD (io2)</option>
                            <option value="st1">Throughput Optimized HDD (st1)</option>
                        </select>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                            Balanced performance protocol for most workloads.</p>
                    </div>

                    <!-- AZ -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">GEOGRAPHIC_ZONE</label>
                        <select v-model="form.az"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none appearance-none cursor-pointer">
                            <option value="us-east-1a">us-east-1a (PRIMARY)</option>
                            <option value="us-east-1b">us-east-1b (SECONDARY)</option>
                            <option value="us-east-1c">us-east-1c (TERTIARY)</option>
                        </select>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                            Instance and volume must share the same zone.</p>
                    </div>
                </div>

                <!-- Footer Summary/Action -->
                <div
                    class="pt-12 border-t-4 border-[#232f3e] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                        <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                            READY_FOR_PROVISIONING_CYCLES</p>
                    </div>
                    <div class="flex gap-6 w-full md:w-auto">
                        <button @click="goBack"
                            class="flex-1 md:flex-initial px-12 py-5 border-4 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                            ABORT
                        </button>
                        <button @click="handleCreate" :disabled="isSubmitting"
                            class="flex-1 md:flex-initial px-16 py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                            <span v-if="!isSubmitting">EXEC_CREATE_PROTOCOL &rarr;</span>
                            <span v-else class="animate-pulse">INITIALIZING_STORAGE...</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Pro-Tips / Constraints -->
            <div class="grid md:grid-cols-3 gap-8">
                <div v-for="tip in [
                    { h: 'ENCRYPTION', b: 'AES-256 layer will be applied automatically to all new block volumes.' },
                    { h: 'MAX_IOPS', b: 'gp3 tier provides 3,000 baseline IOPS with 125 MB/s throughput inclusive.' },
                    { h: 'SNAPSHOTS', b: 'Automated snapshot cycles can be configured after resource deployment.' }
                ]" :key="tip.h"
                    class="p-6 border-2 border-[#eaeded] bg-white group hover:border-[#232f3e] transition-all">
                    <h5 class="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{{ tip.h }}</h5>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest leading-relaxed">{{ tip.b
                        }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
