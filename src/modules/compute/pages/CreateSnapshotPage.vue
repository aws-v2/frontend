<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const route = useRoute()
const computeStore = useComputeStore()

const form = ref({
    name: '',
    volume_id: (route.query.volumeId as string) || ''
})

const isSubmitting = ref(false)

onMounted(async () => {
    if (computeStore.volumes.length === 0) {
        await computeStore.fetchVolumes()
    }
})

const handleCreate = async () => {
    if (!form.value.name || !form.value.volume_id) return

    isSubmitting.value = true
    try {
        await computeStore.createSnapshot(form.value.volume_id, { name: form.value.name })
        router.push({ name: 'snapshots-list' })
    } catch (error) {
        console.error('Failed to create snapshot:', error)
    } finally {
        isSubmitting.value = false
    }
}

const goBack = () => router.push({ name: 'snapshots-list' })
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
                <button @click="goBack" class="hover:text-amber-600 transition-colors">SNAPSHOTS_ARCHIVE</button>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">FREEZE_STATE_PROTOCOL</span>
            </nav>

            <!-- Header -->
            <div class="border-l-8 border-amber-600 pl-10 py-4 mb-20">
                <h1 class="text-7xl font-black text-[#232f3e] tracking-tight uppercase leading-none mb-4">
                    Create <span class="text-amber-600 italic">Snapshot</span>
                </h1>
                <p class="text-[11px] font-black text-[#879196] uppercase tracking-[0.4em]">Atomic Point-In-Time Backup
                    Generation</p>
            </div>

            <!-- Form -->
            <div class="bg-[#fafafa] border-4 border-[#232f3e] p-12 space-y-12 relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 -rotate-45 translate-x-16 -translate-y-16">
                </div>

                <div class="space-y-10">
                    <!-- Source Volume -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">SOURCE_BLOCK_DEVICE</label>
                        <select v-model="form.volume_id"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-amber-600 transition-colors outline-none appearance-none cursor-pointer">
                            <option value="" disabled>SELECT_ACTIVE_DISK_RESOURCES</option>
                            <option v-for="vol in computeStore.volumes" :key="vol.id" :value="vol.id">
                                {{ vol.id }} // {{ vol.size }} GiB ({{ vol.state }})
                            </option>
                        </select>
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">The
                            volume from which the snapshot will be cloned.</p>
                    </div>

                    <!-- Snapshot Name -->
                    <div class="space-y-4">
                        <label
                            class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest block italic">SNAPSHOT_DESCRIPTOR</label>
                        <input v-model="form.name" type="text" placeholder="e.g. PRE_MAINTENANCE_BACKUP_04"
                            class="w-full bg-white border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-amber-600 transition-colors outline-none">
                        <p class="text-[9px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                            Descriptive tag for historical retrieval.</p>
                    </div>
                </div>

                <!-- Footer Action -->
                <div
                    class="pt-12 border-t-4 border-[#232f3e] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <p class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">
                            FILESYSTEM_SYNC_COMPLETED</p>
                    </div>
                    <div class="flex gap-6 w-full md:w-auto">
                        <button @click="goBack"
                            class="flex-1 md:flex-initial px-12 py-5 border-4 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                            ABORT
                        </button>
                        <button @click="handleCreate" :disabled="isSubmitting || !form.name || !form.volume_id"
                            class="flex-1 md:flex-initial px-16 py-5 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                            <span v-if="!isSubmitting">GENERATE_SNAPSHOT &rarr;</span>
                            <span v-else class="animate-pulse">FREEZING_BLOCKS...</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Performance Advisory -->
            <div class="bg-[#232f3e] p-8 text-white relative overflow-hidden group">
                <div class="absolute right-0 top-0 h-full w-24 bg-blue-600/20 skew-x-12 translate-x-12"></div>
                <div class="flex items-center gap-6 relative z-10">
                    <div
                        class="w-10 h-10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 font-black">
                        !</div>
                    <div>
                        <h6 class="text-[10px] font-black uppercase tracking-widest mb-1">Performance Protocol:
                            Asynchronous Processing</h6>
                        <p
                            class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl">
                            Snapshot generation occurs in the background. Performance may be slightly degraded during
                            initial data copy cycles.
                            Resource 'Lifecycle_State' will reflect 'PENDING' until sync is absolute.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
