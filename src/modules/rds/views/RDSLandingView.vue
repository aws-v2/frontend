<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'
import { useDocsStore } from '../../docs/store/docsStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const rdsStore = useRdsStore()
const docsStore = useDocsStore()

onMounted(async () => {
    await rdsStore.fetchDatabases()
    await rdsStore.fetchVolumes()
    await rdsStore.fetchAggregateMetrics()
})

const searchQuery = ref('')

const filtered = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return rdsStore.databases.filter(db =>
        db.name.toLowerCase().includes(q) || (db.engine || '').toLowerCase().includes(q)
    )
})

const latestFive = computed(() => filtered.value.slice(0, 5))

const aggregateStats = computed(() => rdsStore.aggregateMetrics?.summary || {
    totalDatabases: 0,
    totalCpuUsage: 0,
    totalMemoryUsage: 0,
    totalConnections: 0,
    totalDiskUsage: 0,
    unitCpu: '%',
    unitMemory: 'MB',
    unitDisk: 'GB'
})

const stats = computed(() => ({
    total: rdsStore.databases.length,
    available: rdsStore.databases.filter(i => i.status?.toLowerCase() === 'available').length,
    creating: rdsStore.databases.filter(i => ['creating', 'modifying'].includes(i.status?.toLowerCase() || '')).length,
    multiAZ: 0,
}))

const breakdown = computed(() => rdsStore.aggregateMetrics?.breakdown || [])
const history = computed(() => rdsStore.aggregateMetrics?.history || [])

const barChartData = computed(() => {
    if (!breakdown.value.length) return []
    const maxVal = Math.max(...breakdown.value.map(d => Math.max(d.cpu, (d.memory / 1024) * 10)), 5)
    return breakdown.value.map((d, i) => ({
        x: i * 60 + 40,
        hCpu: (d.cpu / maxVal) * 80,
        hMem: ((d.memory / 1024) * 10 / maxVal) * 80,
        name: d.name
    }))
})

const lineChartPaths = computed(() => {
    if (!history.value.length) return { cpu: '', mem: '' }
    const maxCpu = Math.max(...history.value.map(h => h.cpu), 1)
    const maxMem = Math.max(...history.value.map(h => h.memory), 1)

    const cpuPoints = history.value.map((h, i) => {
        const x = (i / (history.value.length - 1)) * 400
        const y = 120 - (h.cpu / maxCpu) * 100
        return `${x},${y}`
    })

    const memPoints = history.value.map((h, i) => {
        const x = (i / (history.value.length - 1)) * 400
        const y = 120 - (h.memory / maxMem) * 100
        return `${x},${y}`
    })

    return {
        cpu: `M ${cpuPoints.join(' L ')}`,
        mem: `M ${memPoints.join(' L ')}`
    }
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

const goBack = () => router.push('/dashboard')
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900">
        <PublicNavbar activeLink="compute" />

        <div class="relative pt-24 pb-40">
            <!-- Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.06)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
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
                    class="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 px-12 py-12 border-4 border-[#232f3e] bg-white relative overflow-hidden group">
                    <div
                        class="absolute right-0 top-0 w-80 h-80 bg-amber-500/5 -rotate-45 translate-x-32 -translate-y-40">
                    </div>
                    <div class="flex items-start gap-10">
                        <div
                            class="w-24 h-24 border-4 border-[#232f3e] flex items-center justify-center text-[#232f3e] group-hover:bg-amber-500 group-hover:text-white transition-all shadow-[8px_8px_0px_#232f3e]">
                            <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <div>
                            <div class="flex items-center gap-4 mb-4">
                                <h1 class="text-6xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">
                                    Managed_Database</h1>
                                <button @click="docsStore.openHelp('rds', 'rds-overview')"
                                    class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-[4px_4px_0px_#232f3e] active:translate-y-0.5 active:shadow-none translate-y-[-4px]">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Help_Center
                                </button>
                            </div>
                            <div class="flex items-center gap-6">
                                <p class="text-xl text-[#545b64] font-medium leading-relaxed max-w-xl">Centralized
                                    control for relational fleet orchestration, point-in-time recovery, and elastic
                                    performance.</p>
                                <div class="w-px h-10 bg-[#eaeded]"></div>
                                <div class="flex flex-col">
                                    <span
                                        class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Service
                                        Status</span>
                                    <span
                                        class="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Fully Operational
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <!-- Broad info preview -->
                        <div class="px-8 py-6 bg-[#fafafa] border-2 border-[#eaeded] min-w-[240px]">
                            <span
                                class="block text-[8px] font-black text-[#879196] uppercase tracking-[0.3em] mb-3">Recent_Event_Stream</span>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    <span
                                        class="text-[10px] font-bold text-[#545b64] uppercase truncate">Backup_Retention_Check</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span
                                        class="text-[10px] font-bold text-[#545b64] uppercase truncate">Patching_Window_Synced</span>
                                </div>
                            </div>
                        </div>
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

                <!-- Fleet Telemetry Overview (Dashboard) -->
                <div class="mb-16">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="h-8 w-2 bg-amber-500"></div>
                        <h2 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter italic">
                            Fleet_Telemetry_Overview</h2>
                    </div>

                    <!-- Aggregate Stat Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div v-for="stat in [
                            { label: 'Cloud_Nodes', value: aggregateStats.totalDatabases, unit: 'Nodes', color: 'text-[#232f3e]' },
                            { label: 'Compute_Load', value: (aggregateStats.totalCpuUsage || 0).toFixed(1), unit: aggregateStats.unitCpu, color: 'text-[var(--aws-blue)]' },
                            { label: 'Memory_Alloc', value: (aggregateStats.totalMemoryUsage || 0).toFixed(0), unit: aggregateStats.unitMemory, color: 'text-purple-600' },
                            { label: 'Active_X-Links', value: aggregateStats.totalConnections || 0, unit: 'Sessions', color: 'text-emerald-600' },
                            { label: 'Storage_Pool', value: (aggregateStats.totalDiskUsage || 0).toFixed(0), unit: aggregateStats.unitDisk, color: 'text-amber-600' },
                        ]" :key="stat.label"
                            class="bg-white border-4 border-[#232f3e] p-6 shadow-[6px_6px_0px_rgba(35,47,62,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-crosshair">
                            <span
                                class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3 font-mono">//
                                {{ stat.label }}</span>
                            <div class="flex items-baseline gap-2">
                                <span class="text-4xl font-black tracking-tighter" :class="stat.color">{{ stat.value
                                }}</span>
                                <span class="text-[10px] font-bold text-[#879196] uppercase">{{ stat.unit }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Row -->
                    <div class="grid lg:grid-cols-2 gap-8">
                        <!-- Instance Resource Breakdown (Bar Chart) -->
                        <div class="bg-white border-4 border-[#232f3e] p-10 relative overflow-hidden group">
                            <div
                                class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none">
                            </div>
                            <div class="relative z-10">
                                <h3
                                    class="text-xs font-black text-[#879196] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                    Resource_Breakdown_Map
                                </h3>

                                <div
                                    class="h-[240px] w-full flex items-end justify-around gap-2 px-4 border-b-2 border-[#eaeded] relative">
                                    <div v-if="!barChartData.length"
                                        class="absolute inset-0 flex items-center justify-center">
                                        <span
                                            class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">No_Mapping_Data</span>
                                    </div>
                                    <!-- Bars -->
                                    <div v-for="(bar, i) in barChartData" :key="i"
                                        class="flex flex-col items-center group/bar w-12">
                                        <div class="flex gap-1 items-end h-[180px]">
                                            <!-- CPU Bar -->
                                            <div :style="{ height: bar.hCpu + '%' }"
                                                class="w-3 bg-[var(--aws-blue)] border border-[#232f3e] shadow-[2px_2px_0px_#232f3e] group-hover/bar:brightness-110 transition-all origin-bottom">
                                            </div>
                                            <!-- MEM Bar -->
                                            <div :style="{ height: bar.hMem + '%' }"
                                                class="w-3 bg-purple-500 border border-[#232f3e] shadow-[2px_2px_0px_#232f3e] group-hover/bar:brightness-110 transition-all origin-bottom">
                                            </div>
                                        </div>
                                        <span
                                            class="text-[9px] font-black text-[#879196] uppercase truncate w-full text-center mt-4 font-mono group-hover/bar:text-[#232f3e] transition-colors">{{
                                                bar.name }}</span>
                                    </div>

                                    <!-- Guide Lines -->
                                    <div class="absolute left-0 right-0 top-0 border-t border-[#eaeded] border-dashed">
                                    </div>
                                    <div
                                        class="absolute left-0 right-0 top-1/2 border-t border-[#eaeded] border-dashed">
                                    </div>
                                </div>
                                <div class="mt-6 flex gap-6 justify-center">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-[var(--aws-blue)] border border-[#232f3e]"></div>
                                        <span
                                            class="text-[9px] font-black text-[#879196] uppercase tracking-widest">CPU_UTIL</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-purple-500 border border-[#232f3e]"></div>
                                        <span
                                            class="text-[9px] font-black text-[#879196] uppercase tracking-widest">MEM_RESRV</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fleet Trend Analysis (Line Chart) -->
                        <div class="bg-white border-4 border-[#232f3e] p-10 relative overflow-hidden group">
                            <div
                                class="absolute inset-0 bg-[linear-gradient(rgba(35,47,62,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(35,47,62,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none">
                            </div>
                            <div class="relative z-10">
                                <h3
                                    class="text-xs font-black text-[#879196] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                    Fleet_Trend_Orchestration
                                </h3>

                                <div class="h-[240px] w-full border-b-2 border-l-2 border-[#eaeded] relative pt-4">
                                    <div v-if="!history.length"
                                        class="absolute inset-0 flex items-center justify-center">
                                        <span
                                            class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">No_History_Stream</span>
                                    </div>
                                    <svg v-else viewBox="0 0 400 120" preserveAspectRatio="none"
                                        class="w-full h-full overflow-visible">
                                        <!-- CPU Trend -->
                                        <path :d="lineChartPaths.cpu" fill="none" stroke="var(--aws-blue)"
                                            stroke-width="4" stroke-linecap="round"
                                            class="drop-shadow-[0_4px_8px_rgba(0,115,190,0.3)]" />
                                        <!-- Memory Trend -->
                                        <path :d="lineChartPaths.mem" fill="none" stroke="#a855f7" stroke-width="4"
                                            stroke-linecap="round"
                                            class="drop-shadow-[0_4px_8px_rgba(168,85,247,0.3)]" />
                                    </svg>

                                    <!-- Y-Axis Labels -->
                                    <div
                                        class="absolute -left-8 top-0 text-[8px] font-black text-[#879196]/40 uppercase tracking-tighter">
                                        MAX</div>
                                    <div
                                        class="absolute -left-8 bottom-0 text-[8px] font-black text-[#879196]/40 uppercase tracking-tighter">
                                        MIN</div>
                                </div>
                                <div
                                    class="mt-6 flex justify-between items-center text-[10px] font-black uppercase text-[#879196] tracking-widest italic">
                                    <span>T-60m</span>
                                    <div class="flex gap-4">
                                        <span class="flex items-center gap-1"><span
                                                class="w-2 h-0.5 bg-[var(--aws-blue)]"></span> CPU_AVG</span>
                                        <span class="flex items-center gap-1"><span
                                                class="w-2 h-0.5 bg-purple-500"></span> MEM_AVG</span>
                                    </div>
                                    <span>REAL_TIME</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DB Instances Table -->
                <div
                    class="border-4 border-[#232f3e] bg-white overflow-hidden shadow-[12px_12px_0px_rgba(35,47,62,0.05)]">
                    <div
                        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-10 py-8 border-b-4 border-[#232f3e] bg-[#fafafa]">
                        <div>
                            <h2 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter">Inventory_Registry
                            </h2>
                            <p
                                class="text-[10px] font-black text-[#879196] uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
                                <span class="w-3 h-[2px] bg-amber-500"></span> Global instance orchestration
                            </p>
                        </div>
                        <div class="flex items-center gap-6 w-full sm:w-auto">
                            <input v-model="searchQuery" type="text" placeholder="Search registry..."
                                class="px-4 py-3 border-4 border-[#232f3e] bg-white focus:ring-0 text-xs font-mono transition-all outline-none w-64 placeholder:text-[#879196]/50 shadow-[4px_4px_0px_rgba(234,237,238,0.5)]" />
                            <button @click="router.push('/rds/create')"
                                class="px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-[6px_6px_0px_#232f3e] active:translate-y-1 active:shadow-none whitespace-nowrap">
                                + Deploy_Node
                            </button>
                        </div>
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

                <!-- Storage Volumes Table -->
                <div
                    class="mt-16 border-4 border-[#232f3e] bg-white overflow-hidden shadow-[12px_12px_0px_rgba(35,47,62,0.05)]">
                    <div
                        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-10 py-8 border-b-4 border-[#232f3e] bg-[#fafafa]">
                        <div>
                            <h2 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter">Storage_Volumes
                            </h2>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] mt-1">Block
                                registry for relational storage</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <button @click="router.push('/rds/volumes/create')"
                                class="px-6 py-3 bg-[#232f3e] text-white font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-[4px_4px_0px_#ff9900]">
                                + Allocate_Volume
                            </button>
                            <button @click="router.push('/rds/volumes')"
                                class="px-6 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all font-mono">
                                VIEW_ALL_UNITS
                            </button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b-2 border-[#232f3e] bg-[#fafafa]">
                                    <th
                                        class="py-4 px-10 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase font-mono">
                                        Registry_ID</th>
                                    <th
                                        class="py-4 px-10 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase text-center font-mono">
                                        State</th>
                                    <th
                                        class="py-4 px-10 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase text-center font-mono">
                                        Capacity</th>
                                    <th
                                        class="py-4 px-10 text-[10px] font-black tracking-[0.2em] text-[#879196] uppercase text-right font-mono">
                                        Op_Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="rdsStore.volumes.length === 0">
                                    <td colspan="4" class="py-12 px-10 text-center">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-widest text-[#879196] italic">
                                            No block units mapped to this cluster.</p>
                                    </td>
                                </tr>
                                <tr v-for="volume in rdsStore.volumes.slice(0, 5)" :key="volume.id"
                                    class="border-b border-[#eaeded] hover:bg-[#fafafa] transition-colors group">
                                    <td class="py-6 px-10">
                                        <div class="flex items-center gap-3">
                                            <div class="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span class="font-black text-sm text-[#232f3e] uppercase font-mono">{{
                                                volume.name }}</span>
                                        </div>
                                    </td>
                                    <td class="py-6 px-10 text-center">
                                        <span
                                            class="px-3 py-1 border text-[9px] font-black uppercase tracking-[0.1em] font-mono"
                                            :class="volume.status === 'AVAILABLE' || volume.status === 'available' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'">
                                            {{ volume.status }}
                                        </span>
                                    </td>
                                    <td class="py-6 px-10 text-center">
                                        <span class="text-sm font-black text-[#232f3e]">{{ volume.sizeGb }} GiB</span>
                                    </td>
                                    <td class="py-6 px-10 text-right">
                                        <button @click="router.push('/rds/volumes')"
                                            class="text-[9px] font-black text-[#232f3e] hover:text-amber-600 uppercase tracking-widest transition-colors font-mono border-b border-[#232f3e]/20 hover:border-amber-600">ORCHESTRATE_BLOCK</button>
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
