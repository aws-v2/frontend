<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

const activeTab = ref('volume')

const tabs = [
    { id: 'volume', label: 'Volume Snapshots' },
    { id: 'instance', label: 'Instance Snapshots' }
]

onMounted(async () => {
    // For now, if we don't have a specific volumeId, we might want a global ListVolumeSnapshots
    // But since the user specified the endpoint /volumes/:id/snapshots, 
    // we'll fetch general snapshots and let the store handle global ones if available.
    // If the backend doesn't support global volume snapshots, we might need a workaround.
    await computeStore.fetchSnapshots()
    // If we had a way to fetch ALL volume snapshots, we'd call it here.
})
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-7xl mx-auto space-y-12">
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                <span>AWS_GLOBAL</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span>EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">SNAPSHOTS_ARCHIVE</span>
            </nav>

            <div
                class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-4 border-[#232f3e] pb-10">
                <div>
                    <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">
                        Data_Snapshots</h1>
                    <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.3em] mt-4 italic">//
                        ARCHIVAL_STATE_MANAGEMENT_V1</p>
                </div>
                <button @click="router.push({ name: 'create-snapshot' })"
                    class="px-12 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all">Create_Snapshot</button>
            </div>

            <!-- Navigation Tabs -->
            <div class="flex border-b-2 border-[#eaeded]">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative"
                    :class="activeTab === tab.id ? 'text-blue-600 bg-[#fafafa]' : 'text-[#879196] hover:text-[#232f3e]'">
                    {{ tab.label }}
                    <div v-if="activeTab === tab.id" class="absolute bottom-[-2px] left-0 right-0 h-[4px] bg-blue-600">
                    </div>
                </button>
            </div>

            <div class="border-2 border-[#232f3e] overflow-hidden bg-white shadow-[20px_20px_0px_rgba(35,47,62,0.05)]">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-[#fafafa] border-b-2 border-[#232f3e]">
                            <th
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                                // IDENTIFIER_NAME</th>
                            <th v-if="activeTab === 'volume'"
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                                // SOURCE_VOLUME</th>
                            <th v-else
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                                // SOURCE_INSTANCE</th>
                            <!-- <th
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                                // CAPACITY_SIZE</th> -->
                            <th
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                                // STATUS_CODE</th>
                            <th
                                class="px-8 py-6 text-[10px] font-black text-[#879196] uppercase tracking-widest italic text-right">
                                // ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y-2 divide-[#eaeded]">
                        <tr v-for="snap in (activeTab === 'volume' ? computeStore.snapshots.filter(s => s.volume_id) : computeStore.snapshots.filter(s => s.instance_id))"
                            :key="snap.id" class="hover:bg-blue-500/5 transition-colors group cursor-pointer"
                            @click="router.push({ name: 'snapshot-details', params: { id: snap.id } })">
                            <td
                                class="px-8 py-6 text-sm font-black text-blue-600 uppercase border-r-2 border-[#eaeded]">
                                {{ snap.name || snap.id }}</td>
                            <td v-if="activeTab === 'volume'"
                                class="px-8 py-6 text-sm font-black text-[#232f3e] uppercase border-r-2 border-[#eaeded]">
                                {{ snap.volume_id }}</td>
                            <td v-else
                                class="px-8 py-6 text-sm font-black text-[#232f3e] uppercase border-r-2 border-[#eaeded]">
                                {{ snap.instance_id }}</td>
                            <!-- <td class="px-8 py-6 text-sm font-black text-[#545b64] border-r-2 border-[#eaeded]">{{
                                snap.size }} GIB</td> -->
                            <td class="px-8 py-6 border-r-2 border-[#eaeded]">
                                <span class="text-[9px] font-black px-4 py-1 border-2 uppercase tracking-widest"
                                    :class="snap.state?.toLowerCase() === 'ready' || snap.state?.toLowerCase() === 'available' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-blue-500/5 border-blue-500/20 text-blue-600'">
                                    {{ snap.state }}
                                </span>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <button
                                    class="text-[10px] font-black text-rose-600 hover:underline decoration-2 underline-offset-4 uppercase tracking-widest">
                                    Decommission
                                </button>
                            </td>
                        </tr>
                        <tr
                            v-if="(activeTab === 'volume' ? computeStore.snapshots.filter(s => s.volume_id) : computeStore.snapshots.filter(s => s.instance_id)).length === 0">
                            <td colspan="6" class="px-8 py-32 text-center">
                                <p
                                    class="text-[11px] font-black uppercase tracking-[0.4em] text-[#879196] opacity-30 italic">
                                    No_{{ activeTab }}_Snapshots_Registry_Empty</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
