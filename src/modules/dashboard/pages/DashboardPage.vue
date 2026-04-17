<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseWidget from '@/shared/components/BaseWidget.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useComputeStore } from '@/modules/compute/store/computeStore'
import { useS3Store } from '@/modules/s3/store/s3Store'

const authStore = useAuthStore()
const computeStore = useComputeStore()
const s3Store = useS3Store()
const { storageLensData } = storeToRefs(s3Store)
const router = useRouter()

// Available Services Types
const serviceCatalog = [
    { id: 'compute', name: 'Compute Engine', icon: 'server', description: 'Manage clusters & serverless functions', color: 'text-[#ff9900]', bg: 'bg-[#fafafa]', border: 'border-[#eaeded]', path: '/compute', enabled: true },
    { id: 'storage', name: 'Object Storage', icon: 'database', description: 'Buckets, policies & replication', color: 'text-[#ff9900]', bg: 'bg-[#fafafa]', border: 'border-[#eaeded]', path: '/s3/buckets', enabled: true },
    { id: 'rds', name: 'Managed Database', icon: 'rds', description: 'Relational DB instances, snapshots & scaling', color: 'text-[#ff9900]', bg: 'bg-[#fafafa]', border: 'border-[#eaeded]', path: '/rds', enabled: true },
    { id: 'sagemaker', name: 'SageMaker', icon: 'brain', description: 'Train & deploy ML models', color: 'text-[#ff9900]', bg: 'bg-[#fafafa]', border: 'border-[#eaeded]', path: '/sagemaker', enabled: false },
    { id: 'gaming', name: 'GameLift Edge', icon: 'gamepad', description: 'Multiplayer fleet scaling', color: 'text-[#ff9900]', bg: 'bg-[#fafafa]', border: 'border-[#eaeded]', path: '/gaming', enabled: false }
]

// State for User's Active Resources
const activeServices = ref<any[]>([])
const isResourceModalOpen = ref(false)

const checkActiveServices = async () => {
    // 1. Load from local storage first
    const storedServices = localStorage.getItem('activeServices')
    if (storedServices) {
        const parsed = JSON.parse(storedServices)
        parsed.forEach((id: string) => {
            const service = serviceCatalog.find(s => s.id === id)
            if (service) activateService(service, false)
        })
    }

    // 2. Then check for auto-activations (Compute)
    if (computeStore.instances.length === 0) {
        await computeStore.fetchInstances()
    }
    const computeService = serviceCatalog.find(s => s.id === 'compute')
    if (computeStore.instances.length > 0 && computeService?.enabled) {
        // If not already active, activate and save
        if (!activeServices.value.find(s => s.id === 'compute')) {
            activateService(computeService)
        }
    }
}

const activateService = (service: any, saveToStorage = true) => {
    if (!service || !service.enabled) return
    if (!activeServices.value.find(s => s.id === service.id)) {
        activeServices.value.push(service)
    }
    if (saveToStorage) {
        const currentIds = activeServices.value.map(s => s.id)
        localStorage.setItem('activeServices', JSON.stringify(currentIds))
    }
    isResourceModalOpen.value = false
}

onMounted(() => {
    checkActiveServices()
    s3Store.fetchStorageLensData()
})

const recentActivity = [
    { id: 1, action: 'Deployed Function', resource: 'auth-handler-v2', time: '12m ago', status: 'success' },
    { id: 2, action: 'Scaled Cluster', resource: 'gpu-prod-01', time: '45m ago', status: 'info' },
    { id: 3, action: 'Bucket Policy', resource: 'assets-public', time: '2h ago', status: 'warning' }
]

const navigateTo = (path: string) => {
    router.push(path)
}
</script>

<template>
    <div
        class="min-h-screen pb-24 relative overflow-hidden bg-white font-urbanist selection:bg-[#ff9900]/30 selection:text-[#232f3e]">
        <!-- Subtle Grid -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
        </div>
        <!-- Dashboard Header -->
        <header class="relative z-10 px-8 md:px-24 pt-20">
            <div
                class="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <div
                        class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">


                    </div>

                    <p class="text-[#545b64] text-lg font-medium italic">System status: <span
                            class="text-emerald-500 font-bold not-italic font-urbanist">Operational</span> • {{ new
                                Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</p>
                </div>

                <div class="flex gap-4">
                    <button @click="router.push('/docs')"
                        class="px-6 py-3 bg-white border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] hover:text-white transition-all transform active:scale-95">
                        Documentation
                    </button>
                    <button @click="isResourceModalOpen = true"
                        class="px-7 py-3 bg-[#ff9900] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ec7211] transition-all transform active:scale-95 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        New Resource
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 max-w-[1800px] mx-auto px-8 md:px-24 mt-16 grid grid-cols-1 lg:grid-cols-4 gap-12 ">
            <!-- Service Catalog -->
            <section class="lg:col-span-3 space-y-12">
                <!-- Empty State -->
                <div v-if="activeServices.length === 0"
                    class="bg-[#fafafa] p-16 border-2 border-dashed border-[#eaeded] text-center relative overflow-hidden group">
                    <div class="relative z-10 max-w-md mx-auto py-10">
                        <div
                            class="w-24 h-24 bg-white border-2 border-[#ff9900] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform shadow-xl">
                            <svg class="w-12 h-12 text-[#ff9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 class="text-3xl font-black text-[#232f3e] mb-4 uppercase tracking-tighter">Empty Fleet</h2>
                        <p class="text-[#545b64] font-medium leading-relaxed mb-12">
                            Deploy your first bare metal node or hyper-storage bucket to start processing workloads.
                        </p>
                        <div class="flex justify-center">
                            <button @click="isResourceModalOpen = true"
                                class="px-8 py-4 bg-[#ff9900] hover:bg-[#ec7211] text-white text-xs font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 flex items-center gap-3">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M12 4v16m8-8H4" />
                                </svg>
                                Launch First Resource
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Active Services Grid -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div v-for="service in activeServices" :key="service.id" @click="router.push(service.path)"
                        class="bg-white border-2 border-[#eaeded] p-6 group cursor-pointer hover:border-[#ff9900] transition-all relative overflow-hidden shadow-sm hover:shadow-xl">
                        <div
                            class="absolute top-0 right-0 w-24 h-24 bg-[#ff9900]/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-150">
                        </div>
                        <div class="relative z-10 flex items-start justify-between">
                            <div class="flex-1">
                                <div
                                    class="w-14 h-14 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900] mb-6 group-hover:scale-105 group-hover:border-[#ff9900]/30 transition-transform">
                                    <svg v-if="service.icon === 'server'" class="w-7 h-7" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" />
                                    </svg>
                                    <svg v-if="service.icon === 'database'" class="w-7 h-7" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                    <svg v-if="service.icon === 'rds'" class="w-7 h-7" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" x1="20"
                                            y1="12" x2="20" y2="17" />
                                        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            x1="17.5" y1="17" x2="22.5" y2="17" />
                                    </svg>
                                </div>
                                <h3 class="text-3xl font-black text-[#232f3e] mb-3 uppercase tracking-tighter">{{
                                    service.name }}</h3>
                                <p class="text-[#545b64] font-medium leading-relaxed max-w-sm">{{ service.description }}
                                </p>
                            </div>
                            <div
                                class="p-3 border-2 border-[#eaeded] group-hover:bg-[#ff9900] group-hover:border-[#ff9900] group-hover:text-white transition-all">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Featured Analytics Insights -->
                <div class="bg-white border-2 border-[#232f3e] p-10 relative overflow-hidden mt-12">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <h3 class="text-[11px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Platform
                                Performance Insights</h3>
                            <p class="text-[10px] text-[#879196] mt-2 font-black uppercase tracking-widest italic">Live
                                fleet metrics & billing velocity</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-6">
                            <div class="flex items-center gap-8 mr-6">
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 bg-[#232f3e]"></div>
                                    <span class="text-[9px] text-[#232f3e] uppercase font-black tracking-widest">Compute
                                        load</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 bg-[#ff9900]"></div>
                                    <span class="text-[9px] text-[#232f3e] uppercase font-black tracking-widest">Storage
                                        I/O</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 bg-[#FFFB00]"></div>
                                    <span class="text-[9px] text-[#232f3e] uppercase font-black tracking-widest">Storage
                                        Throughput</span>
                                </div>
                            </div>
                            <select
                                class="bg-[#fafafa] border-2 border-[#eaeded] px-4 py-2 text-[10px] text-[#232f3e] outline-none focus:border-[#ff9900] transition-all font-black uppercase tracking-widest">
                                <option>T-24 HOURS</option>
                                <option>T-7 DAYS</option>
                                <option>T-30 DAYS</option>
                            </select>
                        </div>
                    </div>

                    <!-- Graph Container -->
                    <div class="relative h-80">
                        <div
                            class="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-[9px] text-[#879196] font-black">
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                        </div>
                        <div
                            class="absolute left-16 right-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
                            <div class="border-t-2 border-[#eaeded]"></div>
                            <div class="border-t border-[#eaeded]"></div>
                            <div class="border-t border-[#eaeded]"></div>
                            <div class="border-t border-[#eaeded]"></div>
                            <div class="border-t-2 border-[#eaeded]"></div>
                        </div>

                        <!-- Chart area -->
                        <div class="absolute left-16 right-0 top-0 bottom-10 flex items-end gap-1.5">
                            <template v-if="storageLensData && storageLensData.timeSeries">
                                <div v-for="point in storageLensData.timeSeries" :key="point.date"
                                    class="flex-1 flex flex-col gap-0.5 relative group">
                                    <div class="bg-[#232f3e] hover:bg-[#ff9900]/80 transition-all cursor-crosshair opacity-90"
                                        :style="{ height: (point.storage / (storageLensData.summary.totalStorage || 1) * 60 + 20) + '%' }">
                                    </div>
                                    <div class="bg-[#ff9900] hover:bg-[#232f3e]/80 transition-all cursor-crosshair opacity-80"
                                        :style="{ height: (point.objects / (storageLensData.summary.objectCount || 1) * 30 + 10) + '%' }">
                                    </div>
                                    <div
                                        class="absolute -top-24 left-1/2 -translate-x-1/2 px-4 py-3 bg-[#232f3e] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl min-w-[150px]">
                                        <div
                                            class="text-[10px] font-black text-[#ff9900] uppercase tracking-widest mb-1">
                                            {{ point.date }}</div>
                                        <div class="text-[9px] font-bold uppercase tracking-widest">STORAGE: {{
                                            (point.storage / (1024 * 1024 * 1024)).toFixed(2) }} GB</div>
                                        <div class="text-[9px] font-bold uppercase tracking-widest">OBJECTS: {{
                                            point.objects }}</div>
                                        <div class="text-[9px] font-bold text-[#FFFB00] uppercase tracking-widest">TPUT:
                                            {{ ((point.throughput || 0) / (1024 * 1024)).toFixed(1) }} MB/s</div>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div v-for="n in 14" :key="n" class="flex-1 h-32 bg-[#eaeded]/50 animate-pulse"></div>
                            </template>
                        </div>

                        <!-- Billing dash line overlay + Storage Throughput -->
                        <svg viewBox="0 0 100 240" preserveAspectRatio="none"
                            class="absolute left-16 right-0 top-0 bottom-10 w-full h-full pointer-events-none overflow-visible">
                            <!-- Serwin Orange Trend Line (Data Entering) -->
                            <path
                                v-if="storageLensData && storageLensData.timeSeries && storageLensData.timeSeries.length && storageLensData.summary"
                                :d="`M 0,${240 - ((storageLensData!.timeSeries[0]?.storage || 0) / (storageLensData!.summary.totalStorage || 1) * 180 + 20)} ${storageLensData!.timeSeries.map((p, i) => 'L ' + (i * (100 / (storageLensData!.timeSeries!.length - 1))) + ',' + (240 - ((p.storage || 0) / (storageLensData!.summary!.totalStorage || 1) * 180 + 20))).join(' ')}`"
                                stroke="#ff9900" stroke-width="2" fill="none" stroke-linejoin="round"
                                stroke-linecap="round" />

                            <!-- YELLOW STORAGE THROUGHPUT LINE -->
                            <path
                                v-if="storageLensData && storageLensData.timeSeries && storageLensData.timeSeries.length"
                                :d="`M 0,${240 - ((storageLensData!.timeSeries[0]?.throughput || 0) / 150000000 * 180 + 10)} ${storageLensData!.timeSeries.map((p, i) => 'L ' + (i * (100 / (storageLensData!.timeSeries!.length - 1))) + ',' + (240 - ((p.throughput || 0) / 150000000 * 180 + 10))).join(' ')}`"
                                stroke="#FFFB00" stroke-width="1.5" fill="none" stroke-linejoin="round"
                                stroke-linecap="round" class="drop-shadow-[0_0_4px_rgba(255,251,0,0.3)]" />
                        </svg>
                    </div>

                    <div
                        class="flex justify-between mt-6 ml-16 text-[10px] font-black uppercase tracking-[0.3em] text-[#879196]">
                        <span>T-MINUS 24H</span>
                        <span>REGION PEAK</span>
                        <span>MID-CYCLE</span>
                        <span>LIVE STREAM</span>
                    </div>
                </div>
            </section>

            <!-- Sidebar -->
            <aside class="space-y-12">
                <!-- Platform Health Summary -->
                <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-2 h-full bg-[#ff9900]"></div>
                    <div class="flex items-center justify-between mb-8">
                        <span class="text-[10px] font-black text-[#232f3e] uppercase tracking-[0.2em]">Global
                            Uptime</span>
                        <span class="text-emerald-600 text-[10px] font-black tracking-widest">99.98%</span>
                    </div>
                    <div class="flex items-end gap-1.5 mb-6 h-12">
                        <div v-for="h in [40, 70, 90, 80, 100, 85, 95, 100]" :key="h"
                            class="flex-1 bg-[#232f3e]/10 group-hover:bg-[#ff9900]/20 transition-all border-b-2 border-[#232f3e]"
                            :style="{ height: h + '%' }"></div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                        <span class="text-xs font-black text-[#232f3e] uppercase tracking-widest">Network Nominal</span>
                    </div>
                </div>

                <!-- Platform Health Details -->
                <BaseWidget title="Infrastructure Status" show-info>
                    <div class="p-6 space-y-4">
                        <div class="space-y-4">
                            <div v-for="svc in [{ name: 'Compute Cluster', status: 'Optimal', color: 'text-emerald-600' }, { name: 'Storage Mesh', status: 'Optimal', color: 'text-emerald-600' }, { name: 'GameLift Edge', status: 'Warning', color: 'text-amber-600' }]"
                                :key="svc.name" class="flex items-center justify-between group/svc">
                                <span
                                    class="text-[10px] font-black text-[#545b64] uppercase tracking-widest group-hover/svc:text-[#232f3e] transition-colors">{{
                                        svc.name }}</span>
                                <div class="flex items-center gap-3">
                                    <div class="w-1.5 h-1.5"
                                        :class="svc.status === 'Optimal' ? 'bg-emerald-500' : 'bg-amber-500'">
                                    </div>
                                    <span class="text-[9px] font-black uppercase tracking-widest" :class="svc.color">{{
                                        svc.status }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template #footer>System Health Dashboard</template>
                </BaseWidget>

                <!-- Activity Feed -->
                <BaseWidget title="System Registry">
                    <div class="p-0">
                        <div v-for="activity in recentActivity" :key="activity.id"
                            class="px-8 py-5 border-b-2 border-[#eaeded] last:border-0 hover:bg-[#fafafa] transition-all relative group/act overflow-hidden">
                            <div
                                class="absolute left-0 top-0 w-1 h-full bg-[#ff9900] -translate-x-full group-hover/act:translate-x-0 transition-all">
                            </div>
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[11px] font-black text-[#232f3e] uppercase tracking-tighter">{{
                                    activity.action }}</span>
                                <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{
                                    activity.time }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] text-[#545b64] font-mono font-bold leading-none">{{
                                    activity.resource }}</span>
                                <div class="px-1.5 py-0.5 text-[8px] font-black uppercase ring-1 ring-inset" :class="{
                                    'text-emerald-600 ring-emerald-500/30 bg-emerald-50': activity.status === 'success',
                                    'text-blue-600 ring-blue-500/30 bg-blue-50': activity.status === 'info',
                                    'text-amber-600 ring-amber-500/30 bg-amber-50': activity.status === 'warning'
                                }">{{ activity.status }}</div>
                            </div>
                        </div>
                    </div>
                    <template #footer>Global Event Log</template>
                </BaseWidget>
            </aside>
        </main>

        <!-- New Resource Modal -->
        <Transition name="fade">
            <div v-if="isResourceModalOpen"
                class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#232f3e]/60 backdrop-blur-md"
                @click="isResourceModalOpen = false">
                <div class="bg-white border-2 border-[#232f3e] w-full max-w-4xl overflow-hidden shadow-2xl relative font-urbanist"
                    @click.stop>
                    <!-- Subtle Grid in Modal -->
                    <div
                        class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50">
                    </div>
                    <div class="p-12 border-b border-[#eaeded] bg-[#fafafa] flex justify-between items-center">
                        <div>
                            <h3 class="text-4xl font-black text-[#232f3e] uppercase tracking-tighter mb-2 italic">
                                Provision
                                <span class="text-[#ff9900]">Resource</span>
                            </h3>
                            <p class="text-[#545b64] text-sm font-bold uppercase tracking-[0.3em]">Select your
                                infrastructure layer</p>
                        </div>
                        <button @click="isResourceModalOpen = false"
                            class="p-4 bg-white border border-[#eaeded] hover:border-[#ff9900] text-[#232f3e] hover:text-[#ff9900] transition-all">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-for="service in serviceCatalog" :key="service.id"
                            @click="service.enabled && activateService(service)"
                            class="relative p-8 border-2 transition-all group overflow-hidden" :class="[
                                service.enabled
                                    ? 'border-[#eaeded] hover:border-[#ff9900] cursor-pointer bg-white'
                                    : 'border-[#eaeded] opacity-40 cursor-not-allowed grayscale'
                            ]">
                            <div v-if="service.enabled"
                                class="absolute inset-0 bg-[#ff9900]/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>

                            <div class="relative z-10 flex items-center gap-6 mb-6">
                                <div
                                    class="w-16 h-16 bg-[#fafafa] border border-[#eaeded] flex items-center justify-center text-[#ff9900] group-hover:scale-110 group-hover:border-[#ff9900]/30 transition-transform shadow-sm">
                                    <svg v-if="service.icon === 'server'" class="w-8 h-8" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" />
                                    </svg>
                                    <svg v-if="service.icon === 'database'" class="w-8 h-8" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                    <svg v-if="service.icon === 'rds'" class="w-8 h-8" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" x1="20"
                                            y1="12" x2="20" y2="17" />
                                        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            x1="17.5" y1="17" x2="22.5" y2="17" />
                                    </svg>
                                </div>
                                <div>
                                    <h4
                                        class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter group-hover:text-[#ff9900] transition-colors">
                                        {{ service.name }}</h4>
                                    <div v-if="!service.enabled"
                                        class="text-[9px] font-black text-[#ff9900] uppercase tracking-[0.2em]">
                                        Deployment Locked</div>
                                    <div v-if="service.enabled"
                                        class="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                                        Available Now
                                    </div>
                                </div>
                            </div>
                            <p class="text-sm text-[#545b64] leading-relaxed font-bold">{{ service.description }}</p>

                            <!-- Coming Soon Badge for disabled -->
                            <div v-if="!service.enabled"
                                class="absolute top-4 right-4 px-3 py-1 bg-[#ff9900]/10 border border-[#ff9900]/20 text-[#ff9900] text-[8px] font-black uppercase tracking-widest">
                                COMING SOON
                            </div>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div class="p-8 bg-[#fafafa] border-t border-[#eaeded] flex items-center justify-center gap-4">
                        <div class="w-2 h-2 bg-[#ff9900] animate-ping"></div>
                        <span class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.4em]">Infrastructure
                            Selection
                            Protocol Active</span>
                    </div>
                </div>
            </div>
        </Transition>
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
