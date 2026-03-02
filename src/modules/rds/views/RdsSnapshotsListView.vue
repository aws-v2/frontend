<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'

const router = useRouter()
const route = useRoute()
const rdsStore = useRdsStore()

const dbId = computed(() => route.params.id as string)
const db = computed(() => rdsStore.currentDatabase)

const searchQuery = ref('')

onMounted(async () => {
    if (!db.value || db.value.id !== dbId.value) {
        await rdsStore.fetchDatabaseById(dbId.value)
    }
    await rdsStore.fetchSnapshots(dbId.value)
})

const filteredSnapshots = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return rdsStore.snapshots.filter(s =>
        s.name.toLowerCase().includes(q) || s.status.toLowerCase().includes(q)
    )
})

const statusClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'available': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        case 'creating': return 'text-amber-600 bg-amber-50 border-amber-200'
        case 'deleting': return 'text-red-600 bg-red-50 border-red-200'
        default: return 'text-[#545b64] bg-[#fafafa] border-[#eaeded]'
    }
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const goBack = () => router.push(`/rds/databases/${dbId.value}`)

const handleDelete = async (snapshot: any) => {
    if (!confirm(`Delete snapshot "${snapshot.name}"? This cannot be undone.`)) return
    try {
        await rdsStore.deleteSnapshot(snapshot.id)
    } catch (e) {
        alert('Failed to delete snapshot.')
    }
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900">
        <div class="relative pt-24 pb-40">
            <!-- Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.06)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-6">
                <!-- Breadcrumbs -->
                <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                    <button @click="router.push('/dashboard')"
                        class="text-[#879196] hover:text-amber-600 transition-colors">Dashboard</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <button @click="router.push('/rds/databases')"
                        class="text-[#879196] hover:text-amber-600 transition-colors">Managed_Database</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <button @click="goBack" class="text-[#879196] hover:text-amber-600 transition-colors">{{ db?.name ||
                        dbId }}</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <span class="text-amber-600 italic">Snapshots</span>
                </nav>

                <!-- Header -->
                <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
                    <div>
                        <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none mb-3">
                            Snapshots</h1>
                        <p class="text-lg text-[#545b64] font-medium">Manual snapshots for {{ db?.name || dbId }}</p>
                    </div>
                    <div class="flex gap-4">
                        <button @click="router.push(`/rds/databases/${dbId}/snapshots/create`)"
                            class="px-8 py-4 bg-[#232f3e] text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-[4px_4px_0px_#ff9900]">
                            Take Snapshot
                        </button>
                    </div>
                </div>

                <!-- Table Container -->
                <div
                    class="border-4 border-[#232f3e] bg-white overflow-hidden shadow-[12px_12px_0px_rgba(35,47,62,0.05)]">
                    <div class="flex justify-between items-center px-8 py-6 border-b-4 border-[#232f3e] bg-[#fafafa]">
                        <h2 class="text-xs font-black text-[#232f3e] uppercase tracking-[0.2em]">Manual Snapshots ({{
                            filteredSnapshots.length }})</h2>
                        <input v-model="searchQuery" type="text" placeholder="Filter snapshots..."
                            class="px-4 py-2 border-2 border-[#eaeded] bg-white focus:ring-0 focus:border-[#232f3e] text-xs font-mono transition-all outline-none w-64" />
                    </div>

                    <!-- Loading -->
                    <div v-if="rdsStore.isLoading"
                        class="py-20 text-center text-[10px] font-black tracking-widest uppercase text-[#879196] animate-pulse">
                        SYNCING_SNAPSHOT_REGISTRY...
                    </div>

                    <!-- Empty -->
                    <div v-else-if="filteredSnapshots.length === 0" class="py-24 text-center">
                        <div
                            class="w-16 h-16 border-4 border-dashed border-[#eaeded] flex items-center justify-center mx-auto mb-6 text-2xl text-[#879196]">
                            📸
                        </div>
                        <p class="text-[10px] font-black tracking-widest uppercase text-[#879196]">No snapshots found.
                        </p>
                    </div>

                    <!-- Table -->
                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b-2 border-[#232f3e] bg-[#fafafa]">
                                    <th
                                        class="py-4 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Name</th>
                                    <th
                                        class="py-4 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Status</th>
                                    <th
                                        class="py-4 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Created</th>
                                    <th
                                        class="py-4 px-8 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase text-right">
                                        Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="snapshot in filteredSnapshots" :key="snapshot.id"
                                    class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors group">
                                    <td class="py-5 px-8">
                                        <span class="font-black text-sm text-[#232f3e] uppercase font-mono">{{
                                            snapshot.name }}</span>
                                    </td>
                                    <td class="py-5 px-8">
                                        <span
                                            class="inline-flex items-center gap-2 px-3 py-1 border text-[9px] font-black uppercase tracking-widest"
                                            :class="statusClass(snapshot.status)">
                                            <span class="w-1 h-1 rounded-full bg-current"></span>
                                            {{ snapshot.status }}
                                        </span>
                                    </td>
                                    <td class="py-5 px-8 text-xs font-mono text-[#545b64]">{{
                                        formatDate(snapshot.createdAt) }}</td>
                                    <td class="py-5 px-8 text-right">
                                        <button
                                            @click="router.push({ name: 'rds-restore-database', params: { snapshotId: snapshot.id } })"
                                            class="text-[9px] font-black text-[#879196] hover:text-amber-600 uppercase tracking-widest transition-colors">Restore</button>
                                        <span class="mx-3 text-[#eaeded]">|</span>
                                        <button @click="handleDelete(snapshot)"
                                            class="text-[9px] font-black text-[#879196] hover:text-red-600 uppercase tracking-widest transition-colors">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
