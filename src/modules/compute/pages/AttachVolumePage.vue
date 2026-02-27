<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import { useToastStore } from '@/shared/store/toastStore'

const router = useRouter()
const route = useRoute()
const computeStore = useComputeStore()
const toastStore = useToastStore()

const instanceId = route.query.instanceId as string
const selectedVolumeId = ref('')
const isAttaching = ref(false)

// Form state for display (populated from selected volume)
const form = ref({
    size: 0,
    type: '',
    az: ''
})

onMounted(async () => {
    if (computeStore.volumes.length === 0) {
        await computeStore.fetchVolumes()
    }
})

const availableVolumes = computed(() => {
    return computeStore.volumes.filter(v => v.state === 'available')
})

const handleVolumeSelect = (event: Event) => {
    const id = (event.target as HTMLSelectElement).value
    selectedVolumeId.value = id
    const volume = computeStore.volumes.find(v => v.id === id)
    if (volume) {
        form.value.size = volume.size
        form.value.type = volume.type
        form.value.az = volume.az
    }
}

const handleAttach = async () => {
    if (!selectedVolumeId.value || !instanceId) return

    isAttaching.value = true
    try {
        await computeStore.attachVolume(selectedVolumeId.value, instanceId)
        toastStore.addToast('Volume attached successfully', 'success')
        router.push(`/compute/instances/${instanceId}`)
    } catch (error: any) {
        console.error('Failed to attach volume:', error)
        const message = error.response?.data?.message || error.message || 'Failed to attach volume'
        toastStore.addToast(message, 'error')
    } finally {
        isAttaching.value = false
    }
}

const goBack = () => {
    if (instanceId) {
        router.push(`/compute/instances/${instanceId}`)
    } else {
        router.push('/compute/instances')
    }
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist p-8 md:p-16 pt-24 relative overflow-hidden">
        <!-- Structural Grid Background -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-4xl mx-auto space-y-12">
            <!-- Header -->
            <div class="space-y-4">
                <nav
                    class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#879196]">
                    <span>AWS_GLOBAL</span>
                    <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                    <span>EC2_ENGINE</span>
                    <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                    <span class="text-[#232f3e]">ATTACH_STORAGE_PROTOCOL</span>
                </nav>
                <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">
                    Attach_Existing_Volume
                </h1>
                <p class="text-[11px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                    // TARGET_NODE: {{ instanceId || 'NULL_IDENTIFIER' }} // TYPE: BLOCK_STORAGE_V1
                </p>
            </div>

            <!-- Selection Form -->
            <div class="bg-white border-2 border-[#232f3e] p-12 space-y-10 relative shadow-[10px_10px_0px_#eaeded]">
                <div
                    class="absolute right-0 top-0 w-24 h-24 bg-[#fafafa] -rotate-45 translate-x-12 -translate-y-12 border-l-2 border-[#232f3e]">
                </div>

                <div class="space-y-10">
                    <!-- Volume Selection Dropdown -->
                    <div class="space-y-4">
                        <label class="text-[10px] font-black uppercase tracking-widest text-[#232f3e] italic block">
                            SELECT_AVAILABLE_VOLUME
                        </label>
                        <select :value="selectedVolumeId" @change="handleVolumeSelect"
                            class="w-full bg-[#fafafa] border-2 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none appearance-none cursor-pointer">
                            <option value="" disabled>SELECT_ACTIVE_DISK_RESOURCES</option>
                            <option v-for="vol in availableVolumes" :key="vol.id" :value="vol.id">
                                {{ vol.id }} ({{ vol.name || 'Unnamed' }}) - {{ vol.size }} GiB
                            </option>
                        </select>
                        <p v-if="availableVolumes.length === 0"
                            class="text-[9px] text-red-500 font-bold uppercase tracking-widest leading-relaxed">
                            No available volumes found in current region.
                        </p>
                    </div>

                    <!-- Auto-populated Details -->
                    <div v-if="selectedVolumeId"
                        class="grid md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div class="space-y-4">
                            <label
                                class="text-[10px] font-black uppercase tracking-widest text-[#879196] italic block">//
                                VOLUME_CAPACITY_GIB</label>
                            <div
                                class="h-14 bg-[#fafafa] border-2 border-[#eaeded] w-full flex items-center px-5 font-black text-[#232f3e]">
                                {{ form.size }} GiB
                            </div>
                        </div>
                        <div class="space-y-4">
                            <label
                                class="text-[10px] font-black uppercase tracking-widest text-[#879196] italic block">//
                                MEDIA_CLASS_SPEC</label>
                            <div
                                class="h-14 bg-[#fafafa] border-2 border-[#eaeded] w-full flex items-center px-5 font-black text-[#232f3e] uppercase">
                                {{ form.type }}
                            </div>
                        </div>
                        <div class="space-y-4 md:col-span-2">
                            <label
                                class="text-[10px] font-black uppercase tracking-widest text-[#879196] italic block">//
                                GEOGRAPHIC_ZONE</label>
                            <div
                                class="h-14 bg-[#fafafa] border-2 border-[#eaeded] w-full flex items-center px-5 font-black text-[#232f3e] uppercase">
                                {{ form.az }}
                            </div>
                        </div>
                    </div>

                    <!-- Empty State Placeholder if no selection -->
                    <div v-else
                        class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#eaeded]">
                        <svg class="w-12 h-12 text-[#eaeded] mb-6" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#879196]">
                            Waiting_For_Resource_Selection</p>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex justify-end gap-6 pt-10 border-t-2 border-[#eaeded]">
                    <button @click="goBack"
                        class="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-[#879196] hover:text-[#232f3e] transition-colors">Abort_Action</button>
                    <button @click="handleAttach" :disabled="!selectedVolumeId || isAttaching"
                        class="px-12 py-5 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[5px_5px_0px_#eaeded] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed group transition-shadow">
                        <span v-if="!isAttaching">Initialize_Attachment &rarr;</span>
                        <span v-else class="animate-pulse">Attaching_Resource...</span>
                    </button>
                </div>
            </div>

            <!-- Technical Constraints -->
            <div class="p-8 border-2 border-amber-500/20 bg-amber-500/5">
                <div class="flex gap-6">
                    <div class="shrink-0 text-amber-600 font-black text-2xl uppercase">!</div>
                    <div class="space-y-2">
                        <h5 class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Protocol Warning:
                            Connectivity Mesh</h5>
                        <p class="text-[11px] font-black text-[#879196] uppercase tracking-widest leading-relaxed">
                            Volume and Instance must reside in the same physical availability zone for successful block
                            protocol handshake.
                            Hot-attachment is supported but may require OS-level mount cycles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
