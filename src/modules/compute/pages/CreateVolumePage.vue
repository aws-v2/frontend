<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

const mode = ref<'blank' | 'snapshot'>('blank')

const form = ref({
    name: '',
    size: 20,
    type: 'gp3',
    az: 'us-east-1a'
})

const snapshotForm = ref({
    name: '',
    snapshotId: null as number | null
})

const snapshots = ref<any[]>([])
const isSubmitting = ref(false)
const isLoadingSnapshots = ref(false)

onMounted(async () => {
    isLoadingSnapshots.value = true
    try {
        snapshots.value = await computeStore.fetchAllSnapshots()
    } catch (error) {
        console.error('Failed to load snapshots:', error)
    } finally {
        isLoadingSnapshots.value = false
    }
})

const selectedSnapshot = computed(() =>
    snapshots.value.find(s => s.id === snapshotForm.value.snapshotId)
)

const handleCreate = async () => {
    isSubmitting.value = true
    try {
        if (mode.value === 'blank') {
            await computeStore.createVolume(form.value)
        } else {
            if (!snapshotForm.value.snapshotId) return
            await computeStore.createVolumeFromSnapshot({
                snapshot_id: snapshotForm.value.snapshotId,
                volume_name: snapshotForm.value.name
            })
        }
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
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <button @click="goBack" class="hover:text-blue-600 transition-colors">VOLUMES_INVENTORY</button>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">PROVISION_BLOCK_RESOURCE</span>
            </nav>

            <div class="border-l-8 border-blue-600 pl-10 py-4 mb-12">
                <h1 class="text-7xl font-black text-[#232f3e] tracking-tight uppercase leading-none mb-4">
                    Create <span class="text-blue-600 italic">Volume</span>
                </h1>
                <p class="text-[11px] font-black text-[#879196] uppercase tracking-[0.4em]">Initialize New
                    High-Performance Storage Entity</p>
            </div>

            <!-- Mode toggle -->
            <div class="flex gap-4">
                <button @click="mode = 'blank'"
                    :class="[
                        'flex-1 px-8 py-5 border-4 text-[10px] font-black uppercase tracking-widest transition-all',
                        mode === 'blank' ? 'bg-blue-600 border-blue-600 text-white' : 'border-[#232f3e] text-[#232f3e] hover:bg-[#232f3e] hover:text-white'
                    ]">
                    Blank Volume
                </button>
                <button @click="mode = 'snapshot'"
                    :class="[
                        'flex-1 px-8 py-5 border-4 text-[10px] font-black uppercase tracking-widest transition-all',
                        mode === 'snapshot' ? 'bg-blue-600 border-blue-600 text-white' : 'border-[#232f3e] text-[#232f3e] hover:bg-[#232f3e] hover:text-white'
                    ]">
                    From Snapshot
                </button>
            </div>

            <!-- Blank volume form -->
            <div v-if="mode === 'blank'" class="bg-[#fafafa] border-4 border-[#232f3e] p-12 space-y-12 relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16"></div>

                <div class="grid md:grid-cols-2 gap-12">
                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">RESOURCE_IDENTIFIER</label>
                        <input v-model="form.name" type="text" placeholder="e.g. DATA_CORE_01"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none">
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Unique logical name for fleet tracking.</p>
                    </div>

                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">CAPACITY_GIB</label>
                        <div class="relative">
                            <input v-model.number="form.size" type="number" min="1" max="16384"
                                class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none">
                            <span class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest">GIB_UNIT</span>
                        </div>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Configurable from 1 GiB to 16 TiB.</p>
                    </div>

                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">STORAGE_TIER</label>
                        <select v-model="form.type"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none appearance-none cursor-pointer">
                            <option value="gp3">General Purpose SSD (gp3)</option>
                            <option value="gp2">General Purpose SSD (gp2)</option>
                            <option value="io2">Provisioned IOPS SSD (io2)</option>
                            <option value="st1">Throughput Optimized HDD (st1)</option>
                        </select>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Balanced performance protocol for most workloads.</p>
                    </div>

                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">GEOGRAPHIC_ZONE</label>
                        <select v-model="form.az"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none appearance-none cursor-pointer">
                            <option value="us-east-1a">us-east-1a (PRIMARY)</option>
                            <option value="us-east-1b">us-east-1b (SECONDARY)</option>
                            <option value="us-east-1c">us-east-1c (TERTIARY)</option>
                        </select>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Instance and volume must share the same zone.</p>
                    </div>
                </div>
            </div>

            <!-- From-snapshot form -->
            <div v-else class="bg-[#fafafa] border-4 border-[#232f3e] p-12 space-y-12 relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16"></div>

                <div class="grid md:grid-cols-2 gap-12">
                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">RESOURCE_IDENTIFIER</label>
                        <input v-model="snapshotForm.name" type="text" placeholder="e.g. RESTORED_DATA_01"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none">
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">Name for the new volume.</p>
                    </div>

                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">SOURCE_SNAPSHOT</label>
                        <select v-model.number="snapshotForm.snapshotId" :disabled="isLoadingSnapshots"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none appearance-none cursor-pointer disabled:opacity-50">
                            <option :value="null" disabled>{{ isLoadingSnapshots ? 'Loading...' : 'Select a snapshot' }}</option>
                            <option v-for="snap in snapshots" :key="snap.id" :value="snap.id">
                                {{ snap.name }} — {{ snap.size }} GiB — {{ new Date(snap.created_at).toLocaleString() }}
                            </option>
                        </select>
                        <p v-if="selectedSnapshot" class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                            {{ selectedSnapshot.description || 'No description provided.' }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-[#fafafa] border-4 border-[#232f3e] p-12 pt-8 border-t-0 flex flex-col md:flex-row justify-between items-center gap-8">
                <div class="flex items-center gap-4">
                    <div class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">READY_FOR_PROVISIONING_CYCLES</p>
                </div>
                <div class="flex gap-6 w-full md:w-auto">
                    <button @click="goBack"
                        class="flex-1 md:flex-initial px-12 py-5 border-4 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                        ABORT
                    </button>
                    <button @click="handleCreate"
                        :disabled="isSubmitting || (mode === 'snapshot' && !snapshotForm.snapshotId)"
                        class="flex-1 md:flex-initial px-16 py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                        <span v-if="!isSubmitting">EXEC_CREATE_PROTOCOL &rarr;</span>
                        <span v-else class="animate-pulse">INITIALIZING_STORAGE...</span>
                    </button>
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