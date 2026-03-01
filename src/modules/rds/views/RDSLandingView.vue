<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const rdsStore = useRdsStore()

onMounted(() => {
    rdsStore.fetchDatabases()
})

const searchQuery = ref('')

const filtered = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return rdsStore.databases.filter(db =>
        db.name.toLowerCase().includes(q) || (db.engine || '').toLowerCase().includes(q)
    )
})

const latestFive = computed(() => filtered.value.slice(0, 5))

const stats = computed(() => ({
    total: rdsStore.databases.length,
    available: rdsStore.databases.filter(i => i.status?.toLowerCase() === 'available').length,
    creating: rdsStore.databases.filter(i => ['creating', 'modifying'].includes(i.status?.toLowerCase() || '')).length,
    multiAZ: 0,
}))

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

const goBack = () => router.push('/dashboard')
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
                    <button @click="goBack"
                        class="text-[#879196] hover:text-amber-600 transition-colors">Dashboard</button>
                    <span class="text-[#eaeded] font-light">/</span>
                    <span class="text-amber-600 italic">Managed_Database</span>
                </nav>

                <!-- Header -->
                <div
                    class="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 px-8 py-10 border-4 border-[#232f3e] bg-white relative overflow-hidden group">
                    <div
                        class="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 -rotate-45 translate-x-32 -translate-y-32">
                    </div>
                    <div class="flex items-start gap-8">
                        <div
                            class="w-20 h-20 border-4 border-[#232f3e] flex items-center justify-center text-[#232f3e] group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none mb-3">
                                Managed_Database</h1>
                            <p class="text-lg text-[#545b64] font-medium leading-relaxed">Relational DB instances,
                                snapshots &amp; auto-scaling</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button @click="router.push('/rds/create')"
                            class="px-10 py-5 bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all active:translate-y-1 shadow-[6px_6px_0px_#232f3e] active:shadow-none">
                            + Create_Instance
                        </button>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-0 border-4 border-[#232f3e] mb-12">
                    <div v-for="stat in [
                        { label: 'Total Instances', value: stats.total, color: 'text-[#232f3e]' },
                        { label: 'Available', value: stats.available, color: 'text-emerald-600' },
                        { label: 'Provisioning', value: stats.creating, color: 'text-amber-600' },
                        { label: 'Multi-AZ', value: stats.multiAZ, color: 'text-blue-600' },
                    ]" :key="stat.label"
                        class="p-8 border-r-4 last:border-r-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors">
                        <span
                            class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-4 italic">{{
                                stat.label }}</span>
                        <span class="text-5xl font-black tracking-tighter uppercase" :class="stat.color">{{ stat.value
                            }}</span>
                    </div>
                </div>

                <!-- Metrics Strip -->
                <div class="mb-12 p-10 border-4 border-[#eaeded] bg-[#fafafa] flex flex-wrap gap-10 items-center">
                    <div>
                        <span class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Engine
                            Mix</span>
                        <div class="flex gap-3 mt-2">
                            <span v-for="eng in ['PostgreSQL', 'MySQL', 'Aurora']" :key="eng"
                                class="px-3 py-1 border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest text-[#232f3e]">{{
                                    eng }}</span>
                        </div>
                    </div>
                    <div class="w-px h-12 bg-[#eaeded]"></div>
                    <div>
                        <span
                            class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Region</span>
                        <span class="text-sm font-black text-[#232f3e] uppercase">eu-north-1</span>
                    </div>
                    <div class="w-px h-12 bg-[#eaeded]"></div>
                    <div>
                        <span class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Default
                            Port</span>
                        <span class="text-sm font-black text-[#232f3e]">5432 / 3306</span>
                    </div>
                    <div class="ml-auto">
                        <button @click="rdsStore.fetchDatabases()"
                            class="px-6 py-3 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                            ↺ Refresh
                        </button>
                    </div>
                </div>

                <!-- DB Instances Table -->
                <div class="border-4 border-[#232f3e] bg-white overflow-hidden">
                    <div
                        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-10 py-6 border-b-4 border-[#232f3e]">
                        <div>
                            <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Database_Instances
                            </h2>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mt-1">Latest 5
                                active fleet nodes</p>
                        </div>
                        <input v-model="searchQuery" type="text" placeholder="Filter instances..."
                            class="px-4 py-3 border-2 border-[#eaeded] bg-[#fafafa] focus:ring-0 focus:border-[#232f3e] text-xs font-mono transition-all outline-none w-56" />
                    </div>

                    <!-- Loading -->
                    <div v-if="rdsStore.isLoading"
                        class="py-16 text-center text-[10px] font-black tracking-widest uppercase text-[#879196] animate-pulse">
                        FETCHING_INSTANCES...
                    </div>

                    <!-- Empty -->
                    <div v-else-if="latestFive.length === 0" class="py-20 text-center">
                        <div
                            class="w-20 h-20 border-4 border-dashed border-[#eaeded] flex items-center justify-center mx-auto mb-8">
                            <svg class="w-9 h-9 text-[#879196]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <p class="text-[10px] font-black tracking-widest uppercase text-[#879196] italic mb-6">No
                            database instances provisioned.</p>
                        <button @click="router.push('/rds/create')"
                            class="px-10 py-5 bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all">
                            + Create First Instance
                        </button>
                    </div>

                    <!-- Table -->
                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b-2 border-[#232f3e] bg-[#fafafa]">
                                    <th
                                        class="py-4 px-6 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Identifier</th>
                                    <th
                                        class="py-4 px-6 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Status</th>
                                    <th
                                        class="py-4 px-6 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Engine</th>
                                    <th
                                        class="py-4 px-6 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        DB User</th>
                                    <th
                                        class="py-4 px-6 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase">
                                        Endpoint</th>
                                    <th
                                        class="py-4 px-6 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase text-right">
                                        Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="db in latestFive" :key="db.id"
                                    class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors group">
                                    <td class="py-4 px-6">
                                        <button @click="router.push(`/rds/databases/${db.id}`)"
                                            class="font-black text-sm text-[#232f3e] uppercase font-mono hover:text-amber-600 transition-colors text-left">
                                            {{ db.name }}
                                        </button>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span
                                            class="inline-flex items-center gap-2 px-3 py-1 border text-[10px] font-black uppercase tracking-widest"
                                            :class="statusClass(db.status || 'available')">
                                            <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {{ db.status || 'available' }}
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-xs font-bold text-[#545b64] uppercase">{{ db.engine ||
                                        'PostgreSQL' }}</td>
                                    <td class="py-4 px-6 text-xs font-mono text-[#545b64]">{{ db.user || '—' }}</td>
                                    <td class="py-4 px-6 text-xs font-mono text-[#879196] truncate max-w-[200px]">{{
                                        db.endpoint || '—' }}</td>
                                    <td class="py-4 px-6 text-right whitespace-nowrap">
                                        <button @click="router.push(`/rds/databases/${db.id}`)"
                                            class="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors mr-4">View</button>
                                        <button @click="router.push(`/rds/modify/${db.id}`)"
                                            class="text-[10px] font-black text-[#545b64] hover:text-amber-600 uppercase tracking-widest transition-colors mr-4">Modify</button>
                                        <button @click="rdsStore.deleteDatabase(db.id)"
                                            class="text-[10px] font-black text-[#545b64] hover:text-red-600 uppercase tracking-widest transition-colors">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid md:grid-cols-3 gap-0 border-4 border-[#eaeded] mt-12">
                    <div v-for="card in [
                        { title: 'Getting Started', desc: 'Learn how to create and manage your first RDS instance.', link: 'View Tutorial' },
                        { title: 'Engine Options', desc: 'PostgreSQL, MySQL, Aurora, MariaDB — pick the right engine for your workload.', link: 'Learn More' },
                        { title: 'Best Practices', desc: 'Optimize for performance, cost, and security in production workloads.', link: 'View Guide' },
                    ]" :key="card.title"
                        class="p-8 border-r-4 last:border-r-0 border-[#eaeded] hover:bg-[#fafafa] transition-colors">
                        <h3 class="text-sm font-black text-[#232f3e] uppercase tracking-tight mb-3">{{ card.title }}
                        </h3>
                        <p class="text-xs text-[#545b64] font-medium leading-relaxed mb-4">{{ card.desc }}</p>
                        <span
                            class="text-[10px] font-black text-amber-600 uppercase tracking-widest cursor-pointer hover:text-amber-700">{{
                                card.link }} →</span>
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
