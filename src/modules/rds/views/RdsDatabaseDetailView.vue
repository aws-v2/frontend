<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const route = useRoute()
const rdsStore = useRdsStore()

const dbId = computed(() => route.params.id as string)
const db = computed(() => rdsStore.currentDatabase)

const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text)
    }).catch(err => {
        console.error('Failed to copy: ', err)
    })
}

onMounted(async () => {
    await rdsStore.fetchDatabaseById(dbId.value)
    await rdsStore.fetchSnapshots(dbId.value)
})

const statusClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'available': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        case 'creating': return 'text-amber-600 bg-amber-50 border-amber-200'
        case 'modifying': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'deleting': return 'text-red-600 bg-red-50 border-red-200'
        case 'stopped': return 'text-[#879196] bg-[#fafafa] border-[#eaeded]'
        default: return 'text-[#545b64] bg-[#fafafa] border-[#eaeded]'
    }
}

const handleDelete = async () => {
    if (!db.value || !confirm(`Delete database "${db.value.name}"? This cannot be undone.`)) return
    await rdsStore.deleteDatabase(db.value.id)
    router.push('/rds/databases')
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900">
        <PublicNavbar activeLink="compute" />

        <div class="relative pt-24 pb-40">
            <!-- Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
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
                    <span class="text-amber-600 italic">{{ db?.name || dbId }}</span>
                </nav>

                <!-- Loading State -->
                <div v-if="rdsStore.isLoading"
                    class="py-32 text-center text-[10px] font-black tracking-widest uppercase text-[#879196] animate-pulse">
                    FETCHING_DATABASE_METADATA...
                </div>

                <!-- Not Found -->
                <div v-else-if="!db" class="py-32 text-center">
                    <p class="text-[10px] font-black tracking-widest uppercase text-[#879196]">Database not found.</p>
                    <button @click="router.push('/rds/databases')"
                        class="mt-6 px-8 py-4 border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                        ← Back to Databases
                    </button>
                </div>

                <!-- Main Detail -->
                <div v-else>

                    <!-- Header Card -->
                    <div
                        class="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 px-8 py-10 border-4 border-[#232f3e] bg-white relative overflow-hidden">
                        <div
                            class="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 -rotate-45 translate-x-32 -translate-y-32 pointer-events-none">
                        </div>
                        <div class="flex items-start gap-8 flex-1">
                            <div
                                class="w-20 h-20 border-4 border-[#232f3e] flex items-center justify-center text-[#232f3e] flex-shrink-0">
                                <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h1
                                    class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none mb-3 truncate">
                                    {{ db.name }}</h1>

                                <!-- ARN Display -->
                                <div v-if="db.arn" @click="copyToClipboard(db.arn)"
                                    class="group flex items-center gap-2 mb-4 cursor-pointer max-w-fit">
                                    <span
                                        class="text-[9px] font-black text-[#879196] uppercase tracking-widest bg-gray-50 px-2 py-0.5 border border-gray-200 group-hover:border-amber-500 group-hover:text-amber-600 transition-all truncate">ARN:
                                        {{ db.arn }}</span>
                                    <svg class="w-3 h-3 text-[#879196] group-hover:text-amber-600 flex-shrink-0"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m-5-5l5 5-5 5" />
                                    </svg>
                                </div>

                                <div class="flex items-center gap-4">
                                    <span
                                        class="inline-flex items-center gap-2 px-3 py-1 border text-[10px] font-black uppercase tracking-widest"
                                        :class="statusClass(db.status || 'available')">
                                        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        {{ db.status || 'available' }}
                                    </span>
                                    <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest">{{
                                        db.engine || 'PostgreSQL' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-4 flex-wrap">
                            <button @click="router.push(`/rds/modify/${db.id}`)"
                                class="px-8 py-4 border-2 border-[#232f3e] text-[#232f3e] font-black uppercase tracking-widest text-xs hover:bg-[#232f3e] hover:text-white transition-all">
                                Modify
                            </button>
                            <button @click="handleDelete"
                                class="px-8 py-4 border-2 border-red-500 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all">
                                Delete
                            </button>
                        </div>
                    </div>

                    <!-- Detail Grid -->
                    <div class="grid md:grid-cols-2 gap-0 border-4 border-[#232f3e] mb-12">

                        <!-- Connection Info -->
                        <div class="p-10 border-r-4 border-[#232f3e]">
                            <h2 class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em] mb-8">
                                Connection_Info</h2>
                            <div class="space-y-6">
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Database
                                        ID</span>
                                    <span class="text-sm font-mono text-[#232f3e] break-all">{{ db.id }}</span>
                                </div>
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Endpoint
                                        / Host</span>
                                    <span class="text-sm font-mono text-[#232f3e]">{{ db.endpoint || '—' }}</span>
                                </div>
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Port</span>
                                    <span class="text-sm font-black text-[#232f3e]">{{ db.port || '5432' }}</span>
                                </div>
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Master
                                        User (Role)</span>
                                    <span class="text-sm font-mono text-[#232f3e]">{{ db.roleName || db.user || '—'
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Configuration -->
                        <div class="p-10">
                            <h2 class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em] mb-8">
                                Configuration</h2>
                            <div class="space-y-6">
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Engine</span>
                                    <span class="text-sm font-black text-[#232f3e] uppercase">{{ db.engine ||
                                        'PostgreSQL' }}</span>
                                </div>
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Physical
                                        DB Name</span>
                                    <span class="text-sm font-black text-[#232f3e] uppercase">{{ db.physicalDbName ||
                                        db.name }}</span>
                                </div>
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Region</span>
                                    <span class="text-sm font-black text-[#232f3e] uppercase">{{ db.region ||
                                        'eu-north-1' }}</span>
                                </div>
                                <div>
                                    <span
                                        class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">Created</span>
                                    <span class="text-sm font-mono text-[#232f3e]">{{ db.createdAt ? new
                                        Date(db.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month:
                                                'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        }) : '—' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Connection String Card -->
                    <div class="border-4 border-[#232f3e] mb-12">
                        <div class="px-10 py-6 border-b-4 border-[#232f3e] bg-[#232f3e]">
                            <h2 class="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
                                Connection_String</h2>
                        </div>
                        <div class="p-10 bg-[#fafafa]">
                            <code
                                class="block font-mono text-sm text-[#232f3e] bg-white border-2 border-[#eaeded] p-6 break-all leading-relaxed relative group cursor-pointer"
                                @click="copyToClipboard(db.connectionString || `postgresql://${db.roleName || db.user || 'postgres'}:<password>@${db.endpoint || 'localhost'}:${db.port || 5432}/${db.physicalDbName || db.name}`)">
                                <div class="absolute right-4 top-4 text-[8px] font-black text-[#879196] uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">Click to copy</div>
                                {{ db.connectionString || `postgresql://${db.roleName || db.user || 'postgres'}:<password>@${db.endpoint || 'localhost'}:${db.port || 5432}/${db.physicalDbName || db.name}` }}
                            </code>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mt-4 italic">
                                Replace &lt;password&gt; with your master password.</p>
                        </div>
                    </div>

                    <!-- Preview Dashboard -->
                    <div class="grid lg:grid-cols-2 gap-12 mb-12">
                        <!-- Monitoring Preview -->
                        <div class="border-4 border-[#232f3e] bg-white">
                            <div
                                class="px-8 py-4 border-b-4 border-[#232f3e] bg-[#232f3e] flex justify-between items-center">
                                <h2 class="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
                                    Monitoring_Preview</h2>
                                <span
                                    class="text-[8px] font-black text-amber-500/50 uppercase tracking-widest">Real-time
                                    telemetry</span>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <span
                                            class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">CPU
                                            Utilization</span>
                                        <div class="flex items-end gap-2">
                                            <span class="text-3xl font-black text-[#232f3e]">12.4%</span>
                                            <span class="text-[10px] text-emerald-600 font-bold mb-1">Normal</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span
                                            class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">DB
                                            Connections</span>
                                        <div class="flex items-end gap-2">
                                            <span class="text-3xl font-black text-[#232f3e]">8</span>
                                            <span class="text-[10px] text-[#879196] font-bold mb-1">/ 100</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Mock Chart -->
                                <div
                                    class="h-32 w-full bg-[#fafafa] border-2 border-[#eaeded] relative overflow-hidden group">
                                    <div class="absolute inset-x-0 bottom-0 h-full flex items-end px-2 gap-1">
                                        <div v-for="i in 20" :key="i"
                                            class="flex-1 bg-amber-500/20 group-hover:bg-amber-500/40 transition-all"
                                            :style="{ height: Math.random() * 80 + 20 + '%' }"></div>
                                    </div>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span
                                            class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] bg-white px-3 py-1 border border-[#eaeded] shadow-sm">load_delta_last_6h</span>
                                    </div>
                                </div>
                                <button
                                    class="w-full mt-6 py-3 border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">View
                                    CloudWatch Metrics →</button>
                            </div>
                        </div>

                        <!-- Snapshots Preview -->
                        <div class="border-4 border-[#232f3e] bg-white">
                            <div
                                class="px-8 py-4 border-b-4 border-[#232f3e] bg-[#232f3e] flex justify-between items-center">
                                <h2 class="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
                                    Snapshot_Summary</h2>
                                <button @click="router.push(`/rds/databases/${dbId}/snapshots`)"
                                    class="text-[9px] font-black text-amber-500 hover:underline uppercase tracking-widest">View
                                    all</button>
                            </div>
                            <div class="p-8">
                                <div v-if="rdsStore.snapshots.length === 0" class="py-12 text-center">
                                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-4">No
                                        snapshots registered.</p>
                                    <button @click="router.push(`/rds/databases/${dbId}/snapshots/create`)"
                                        class="px-6 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">Take
                                        First Snapshot</button>
                                </div>
                                <div v-else class="space-y-4">
                                    <div v-for="snap in rdsStore.snapshots.slice(0, 3)" :key="snap.id"
                                        class="p-4 border-2 border-[#eaeded] hover:border-amber-500 transition-colors cursor-pointer group">
                                        <div class="flex justify-between items-start mb-1">
                                            <span
                                                class="text-xs font-black text-[#232f3e] uppercase font-mono truncate mr-4">{{
                                                    snap.name }}</span>
                                            <span
                                                class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{{
                                                    snap.status }}</span>
                                        </div>
                                        <div
                                            class="text-[9px] text-[#879196] font-medium uppercase tracking-widest italic group-hover:text-amber-600">
                                            Created: {{ new Date(snap.createdAt).toLocaleDateString() }}</div>
                                    </div>
                                    <p
                                        class="text-[9px] font-black text-[#879196] uppercase tracking-widest text-center italic mt-6">
                                        Showing latest manual snapshots</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <footer class="py-20 bg-white border-t-2 border-[#232f3e]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinForge</span>
                </div>
                <div class="text-[10px] text-[#879196] font-black uppercase tracking-widest italic">© 2026 SERWIN
                    SYSTEMS INC.</div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>
