<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import { useToastStore } from '@/shared/store/toastStore'

const route = useRoute()
const router = useRouter()
const computeStore = useComputeStore()
const toastStore = useToastStore()

const volumeId = computed(() => route.params.id as string)
const activeTab = ref('details')

const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'snapshots', label: 'Snapshots' },
    { id: 'tags', label: 'Tags' }
]

onMounted(async () => {
    await computeStore.fetchVolume(volumeId.value)
    await computeStore.fetchVolumeSnapshots(volumeId.value)
    await computeStore.fetchVolumeTags(volumeId.value)
})

const volume = computed(() => computeStore.currentVolume)

const attachedInstance = computed(() => {
    if (!volume.value?.instance_id) return null
    return computeStore.instances.find(i => i.id === volume.value?.instance_id)
})

const goBack = () => router.push('/compute/volumes')

// Tagging State
const isAddingTag = ref(false)
const newTag = ref({
    key: '',
    value: ''
})

const handleAddTag = async () => {
    if (!newTag.value.key.trim()) return
    isAddingTag.value = true
    try {
        await computeStore.addVolumeTag(volumeId.value, {
            key: newTag.value.key.trim(),
            value: newTag.value.value.trim()
        })
        newTag.value = { key: '', value: '' }
        toastStore.addToast('Volume metadata successfully assigned', 'success')
    } catch (error: any) {
        toastStore.addToast(error.message || 'Failed to assign metadata', 'error')
    } finally {
        isAddingTag.value = false
    }
}

const handleRemoveTag = async (key: string) => {
    if (!confirm(`Are you sure you want to remove tag "${key}"?`)) return
    try {
        await computeStore.deleteVolumeTag(volumeId.value, key)
        toastStore.addToast('Volume metadata removed', 'info')
    } catch (error: any) {
        toastStore.addToast(error.message || 'Failed to remove metadata', 'error')
    }
}

const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this volume?')) return
    try {
        await computeStore.deleteVolume(volumeId.value)
        toastStore.addToast('Volume decommissioning protocol started', 'success')
        router.push('/compute/volumes')
    } catch (error: any) {
        toastStore.addToast(error.message || 'Failed to decommission volume', 'error')
    }
}

const handleReserve = async () => {
    try {
        await computeStore.reserveVolume(volumeId.value)
        toastStore.addToast('Volume reservation successfully committed', 'success')
    } catch (error: any) {
        toastStore.addToast(error.message || 'Failed to reserve volume', 'error')
    }
}

// Snapshot Creation State
const isSnapshotModalOpen = ref(false)
const snapshotForm = ref({
    name: '',
    description: ''
})

const openSnapshotModal = () => {
    snapshotForm.value = {
        name: `snap-${volumeId.value.slice(0, 8)}`,
        description: `Snapshot of volume ${volumeId.value} created on ${new Date().toLocaleDateString()}`
    }
    isSnapshotModalOpen.value = true
}

const createSnapshot = async () => {
    if (!snapshotForm.value.name.trim()) {
        toastStore.addToast('Snapshot name is required', 'error')
        return
    }
    try {
        await computeStore.createVolumeSnapshot(volumeId.value, {
            name: snapshotForm.value.name,
            description: snapshotForm.value.description
        })
        toastStore.addToast('Volume snapshot creation initiated', 'info')
        isSnapshotModalOpen.value = false
        activeTab.value = 'snapshots'
    } catch (error: any) {
        toastStore.addToast(error.message || 'Failed to initiate snapshot', 'error')
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden pb-40">
        <!-- Structural Grid Background -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
        </div>

        <!-- Loading Overlay -->
        <div v-if="computeStore.isLoading && !volume"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div class="flex flex-col items-center gap-6">
                <div class="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-none animate-spin"></div>
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#232f3e]">Storage_Sync_Active...</p>
            </div>
        </div>

        <div v-if="volume" class="relative z-10 p-8 px-8 md:px-16 pt-24 space-y-12">
            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <a href="#" @click.prevent="router.push('/dashboard')"
                    class="text-[#879196] hover:text-blue-600 transition-colors">AWS_GLOBAL</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <a href="#" @click.prevent="router.push('/compute')"
                    class="text-[#879196] hover:text-blue-600 transition-colors">EC2_ENGINE</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <a href="#" @click.prevent="goBack"
                    class="text-[#879196] hover:text-blue-600 transition-colors">VOLUMES_INVENTORY</a>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e] font-black">VOL_{{ volumeId.slice(0, 8) }}</span>
            </nav>

            <!-- Header Section -->
            <div
                class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b-2 border-[#eaeded]">
                <div class="flex items-start gap-8">
                    <div
                        class="w-20 h-20 bg-[#232f3e] flex items-center justify-center text-white relative overflow-hidden group">
                        <div
                            class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        </div>
                        <svg class="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div>
                        <div class="flex items-center gap-6 mb-4">
                            <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">{{
                                volume.name || '// UNNAMED_VOLUME' }}</h1>
                            <span :class="['flex items-center gap-2 text-[10px] font-black px-4 py-1.5 bg-white border-2 uppercase tracking-widest',
                                volume.state?.toLowerCase() === 'available' ? 'text-blue-600 border-blue-600/20 bg-blue-500/5' :
                                    volume.state?.toLowerCase() === 'in-use' || volume.state?.toLowerCase() === 'attached' ? 'text-emerald-600 border-emerald-600/20 bg-emerald-500/5' :
                                        'text-[#879196] border-[#eaeded] bg-[#fafafa]']">
                                <span
                                    :class="['w-1.5 h-1.5', volume.state?.toLowerCase() === 'in-use' || volume.state?.toLowerCase() === 'attached' ? 'bg-emerald-600' : 'bg-blue-600']"></span>
                                {{ volume.state }}
                            </span>
                        </div>
                        <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
                            // STORAGE_CLASS: {{ volume.type }} // CAPACITY: {{ volume.size }} GIB // ID: {{ volume.id
                            }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-4">
                    <button @click="handleReserve"
                        class="px-8 py-5 border-2 border-blue-600 text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all">Reserve_Volume</button>
                    <button @click="openSnapshotModal"
                        class="px-8 py-5 border-2 border-[#232f3e] text-[#232f3e] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] hover:text-white transition-all">Create_Snapshot</button>
                    <button @click="handleDelete"
                        class="px-12 py-5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all">Decommission</button>
                </div>
            </div>

            <!-- Quick Stats Card -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="stat in [
                    { label: 'VOLUME_TYPE', value: volume.type, sub: 'Block_Storage_Protocol' },
                    { label: 'PROVISIONED_SIZE', value: volume.size + ' GIB', sub: 'Calculated_Capacity' },
                    { label: 'AVAILABILITY_ZONE', value: volume.az || 'US-EAST-1A', sub: 'Regional_Endpoint' },
                    { label: 'ENCRYPTION_LAYER', value: 'AES-256', sub: 'Security_Policy_Active' }
                ]" :key="stat.label"
                    class="bg-white border-2 border-[#eaeded] p-8 hover:border-[#232f3e] transition-colors group">
                    <h4 class="text-[9px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-4 italic">// {{
                        stat.label }}</h4>
                    <p class="text-xl font-black text-[#232f3e] tracking-tight uppercase">{{ stat.value }}</p>
                    <p class="text-[9px] font-black text-[#545b64] mt-2 uppercase tracking-widest">{{ stat.sub }}</p>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <div class="border-b-2 border-[#eaeded] flex overflow-x-auto scrollbar-hide">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative border-r-2 border-[#eaeded] whitespace-nowrap"
                    :class="activeTab === tab.id ? 'text-blue-600 bg-[#fafafa]' : 'text-[#879196] hover:text-[#232f3e] hover:bg-[#fafafa]'">
                    {{ tab.label }}
                    <div v-if="activeTab === tab.id" class="absolute bottom-[-2px] left-0 right-0 h-[4px] bg-blue-600">
                    </div>
                </button>
            </div>

            <!-- Tab Content Area -->
            <div class="bg-white border-2 border-[#232f3e] p-12 min-h-[400px] relative overflow-hidden">
                <div
                    class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
                </div>

                <!-- Details Tab -->
                <div v-if="activeTab === 'details'" class="space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div class="space-y-8">
                            <h3
                                class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                                <span class="w-1.5 h-6 bg-blue-600"></span>
                                Volume_Specification
                            </h3>
                            <div class="space-y-4">
                                <div v-for="item in [
                                    { label: 'VOLUME_ID', value: volume.id },
                                    { label: 'CREATION_DATE', value: new Date(volume.created_at).toLocaleDateString() },
                                    { label: 'IOPS_PERFORMANCE', value: '3000 / 125 MiB/s' }
                                ]" :key="item.label" class="py-4 border-b-2 border-[#eaeded] flex flex-col">
                                    <span
                                        class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2 italic">//
                                        {{ item.label }}</span>
                                    <span class="text-sm font-black text-[#232f3e] uppercase font-mono">{{ item.value
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-8">
                            <h3
                                class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                                <span class="w-1.5 h-6 bg-blue-600"></span>
                                Attachment_Status
                            </h3>
                            <div v-if="volume.instance_id"
                                class="p-8 bg-blue-500/5 border-2 border-blue-600/20 space-y-6">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p
                                            class="text-[10px] font-black text-[#879196] uppercase tracking-widest italic mb-2">
                                            // ATTACHED_NODE</p>
                                        <p class="text-lg font-black text-blue-600 uppercase cursor-pointer hover:underline"
                                            @click="router.push(`/compute/instances/${volume.instance_id}`)">
                                            {{ attachedInstance?.name || volume.instance_id }}
                                        </p>
                                    </div>
                                    <span
                                        class="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest">ACTIVE_MAP</span>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-blue-600/10">
                                    <div>
                                        <p class="text-[9px] font-black text-[#879196] uppercase mb-1">Device_Path</p>
                                        <p class="text-xs font-black text-[#232f3e] font-mono">{{ volume.device ||
                                            '/dev/xvda' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-black text-[#879196] uppercase mb-1">Delete_On_Term
                                        </p>
                                        <p class="text-xs font-black text-[#232f3e]">Yes</p>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="p-12 border-2 border-[#eaeded] border-dashed text-center opacity-40">
                                <p class="text-[10px] font-black uppercase tracking-[0.3em]">No_Active_Attachments</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Snapshots Tab -->
                <div v-else-if="activeTab === 'snapshots'" class="space-y-10">
                    <div class="flex items-end justify-between border-b-2 border-[#eaeded] pb-6">
                        <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight">Logical_Snapshots</h3>
                    </div>
                    <div class="overflow-x-auto border-2 border-[#eaeded]">
                        <table class="w-full text-left border-collapse">
                            <thead
                                class="bg-[#fafafa] text-[10px] font-black uppercase tracking-[0.2em] text-[#545b64] border-b-2 border-[#eaeded]">
                                <tr>
                                    <th class="p-8 border-r-2 border-[#eaeded]">Identifier</th>
                                    <th class="p-8 border-r-2 border-[#eaeded]">Size</th>
                                    <th class="p-8 border-r-2 border-[#eaeded]">State</th>
                                    <th class="p-8">Created</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y-2 divide-[#eaeded] font-black uppercase">
                                <tr v-for="snap in computeStore.snapshots.filter(s => String(s.volume_id) === String(volumeId))"
                                    :key="snap.id" class="hover:bg-[#fafafa] transition-colors">
                                    <td class="p-8 border-r-2 border-[#eaeded] text-blue-600 font-mono">{{ snap.name }}
                                    </td>
                                    <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e]">{{ snap.size }} GiB</td>
                                    <td class="p-8 border-r-2 border-[#eaeded]">
                                        <span
                                            class="text-[9px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-600 border-2 border-emerald-600/20">{{
                                                snap.state }}</span>
                                    </td>
                                    <td class="p-8 text-[#545b64] italic text-xs">{{ new
                                        Date(snap.created_at).toLocaleString() }}</td>
                                </tr>
                                <tr v-if="computeStore.snapshots.filter(s => s.volume_id === volumeId).length === 0">
                                    <td colspan="4"
                                        class="p-12 text-center text-[#879196] italic opacity-50 uppercase tracking-widest text-[10px]">
                                        No snapshots found for this volume</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tags Tab -->
                <div v-else-if="activeTab === 'tags'" class="space-y-12">
                    <!-- Add Tag Form -->
                    <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 space-y-8">
                        <h3
                            class="text-xl font-black text-[#232f3e] uppercase tracking-tighter italic flex items-center gap-4">
                            <span class="w-1.5 h-6 bg-blue-600"></span>
                            Assign_New_Metadata
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-4">
                                <label
                                    class="text-[10px] font-black text-[#879196] uppercase tracking-widest block italic">//
                                    TAG_KEY</label>
                                <input v-model="newTag.key" type="text" placeholder="e.g., Environment"
                                    class="w-full bg-white border-4 border-[#eaeded] p-4 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-colors">
                            </div>
                            <div class="space-y-4">
                                <label
                                    class="text-[10px] font-black text-[#879196] uppercase tracking-widest block italic">//
                                    TAG_VALUE</label>
                                <input v-model="newTag.value" type="text" placeholder="e.g., Production"
                                    class="w-full bg-white border-4 border-[#eaeded] p-4 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-colors">
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button @click="handleAddTag" :disabled="isAddingTag || !newTag.key.trim()"
                                class="px-12 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50">
                                <span v-if="!isAddingTag">COMMIT_METADATA</span>
                                <span v-else class="animate-pulse">COMMITTING...</span>
                            </button>
                        </div>
                    </div>

                    <!-- Existing Tags Table -->
                    <div class="border-2 border-[#eaeded] overflow-hidden">
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                                    <th
                                        class="p-8 text-left text-[10px] font-black text-[#879196] uppercase tracking-widest italic w-1/3 border-r-2 border-[#eaeded]">
                                        // IDENTIFIER_KEY
                                    </th>
                                    <th
                                        class="p-8 text-left text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                                        // ASSIGNED_VALUE
                                    </th>
                                    <th
                                        class="p-8 text-right text-[10px] font-black text-[#879196] uppercase tracking-widest italic w-32">
                                        // ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="tag in computeStore.volumeTags" :key="tag.key"
                                    class="border-b border-[#eaeded] hover:bg-blue-500/5 transition-colors group">
                                    <td
                                        class="p-8 border-r-2 border-[#eaeded] text-blue-600 font-black text-xs uppercase tracking-tight">
                                        {{ tag.key }}
                                    </td>
                                    <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e] font-bold text-xs">
                                        {{ tag.value || '(empty)' }}
                                    </td>
                                    <td class="p-8 text-right">
                                        <button @click="handleRemoveTag(tag.key)"
                                            class="text-rose-600 hover:text-rose-800 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                            REMOVE
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="computeStore.volumeTags.length === 0">
                                    <td colspan="3"
                                        class="p-16 text-center text-[#879196] italic uppercase tracking-[0.3em] font-black opacity-30 text-[11px]">
                                        No metadata assigned to this volume
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Snapshot Creation Modal -->
        <div v-if="isSnapshotModalOpen"
            class="fixed inset-0 z-[200] flex items-center justify-center bg-[#232f3e]/90 backdrop-blur-md p-8">
            <div
                class="bg-white border-4 border-[#232f3e] w-full max-w-2xl overflow-hidden shadow-[20px_20px_0px_rgba(35,47,62,0.2)]">
                <div class="bg-[#232f3e] p-8 flex justify-between items-center text-white">
                    <div>
                        <h2 class="text-2xl font-black uppercase tracking-tighter italic">Create_Volume_Snapshot</h2>
                        <p class="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">//
                            DATA_PERSISTENCE_LAYER_V1</p>
                    </div>
                    <button @click="isSnapshotModalOpen = false" class="hover:text-blue-400 transition-colors">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="p-12 space-y-10">
                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic block">//
                            SNAPSHOT_IDENTIFIER</label>
                        <input v-model="snapshotForm.name" type="text"
                            class="w-full bg-[#fafafa] border-4 border-[#eaeded] p-6 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-all"
                            placeholder="e.g., prod-backup-vol-1">
                    </div>

                    <div class="space-y-4">
                        <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic block">//
                            RESOURCE_ANNOTATION</label>
                        <textarea v-model="snapshotForm.description" rows="4"
                            class="w-full bg-[#fafafa] border-4 border-[#eaeded] p-6 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-all resize-none"
                            placeholder="Describe this logical state..."></textarea>
                    </div>

                    <div class="flex gap-6 pt-4">
                        <button @click="isSnapshotModalOpen = false"
                            class="flex-1 px-8 py-5 border-4 border-[#eaeded] text-[#879196] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#fafafa] hover:text-[#232f3e] transition-all">Cancel_Abort</button>
                        <button @click="createSnapshot"
                            class="flex-1 px-8 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all shadow-[8px_8px_0px_rgba(37,99,235,0.2)]">Comit_Snapshot</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
