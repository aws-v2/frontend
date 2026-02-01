<script setup lang="ts">
import { computed } from 'vue'
import BaseWidget from '@/shared/components/BaseWidget.vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useRouter } from 'vue-router'

const toastStore = useToastStore()
const authStore = useAuthStore()
const router = useRouter()

const frontiers = [
    { id: 'compute', name: 'Compute', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'var(--color-compute)', path: '/compute/functions' },
    { id: 'storage', name: 'Storage', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4', color: 'var(--color-storage)', path: '/s3/buckets' },
    { id: 'intelligence', name: 'Intelligence', icon: 'M9.663 17h4.673M12 3v1', color: 'var(--color-ai)', path: '/sagemaker' },
    { id: 'gaming', name: 'Gaming', icon: 'M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15', color: 'var(--color-gaming)', path: '/gaming' }
]

const navigateTo = (path: string) => {
    router.push(path)
}
</script>

<template>
    <div class="min-h-screen bg-black font-mono pb-24 text-white">
        <!-- Technical Grid Background -->
        <div class="fixed inset-0 z-0 pointer-events-none opacity-10 technical-grid"></div>

        <!-- Dashboard Header -->
        <div
            class="px-10 py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-md">
            <div>
                <div class="inline-flex items-center gap-4 mb-4 opacity-70">
                    <div class="w-1 h-1 bg-white"></div>
                    <span class="text-[9px] font-black uppercase tracking-[0.6em]">Console // Control_Center</span>
                </div>
                <h1 class="text-6xl font-black uppercase tracking-tighter italic leading-none text-white">The_Hub.</h1>
            </div>

            <div class="flex items-center gap-6">
                <button
                    class="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-colors">
                    Reset_Logic
                </button>
                <button
                    class="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#007AFF] hover:text-white transition-all flex items-center gap-4">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="square" stroke-width="3" d="M12 4v16m8-8H4" />
                    </svg>
                    Add_Node
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="px-10 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">

            <!-- Frontier Selection (AWS Service Entry) -->
            <BaseWidget title="Active Frontiers" class="lg:col-span-2">
                <div class="p-8 grid grid-cols-2 gap-4 h-full">
                    <div v-for="frontier in frontiers" :key="frontier.id" @click="navigateTo(frontier.path)"
                        class="bg-[#050505] border border-white/5 p-8 flex flex-col justify-between hover:bg-white group transition-all duration-700 cursor-pointer relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-16 h-[2px] opacity-0 group-hover:opacity-100 transition-all"
                            :style="{ backgroundColor: frontier.color }"></div>
                        <div class="relative z-10 flex flex-col gap-6">
                            <svg class="w-8 h-8 group-hover:text-black transition-colors"
                                :style="{ color: frontier.color }" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2.5"
                                    :d="frontier.icon" />
                            </svg>
                            <h4
                                class="text-2xl font-black uppercase tracking-tight group-hover:text-black transition-colors">
                                {{ frontier.name }}</h4>
                        </div>
                        <div class="flex justify-between items-center group-hover:text-black mt-10">
                            <span class="text-[9px] font-black uppercase tracking-[0.3em] opacity-70">Initialize
                                Frontier</span>
                            <div class="w-2 h-2" :style="{ backgroundColor: frontier.color }"></div>
                        </div>
                    </div>
                </div>
                <template #footer>View all integrated protocols</template>
            </BaseWidget>

            <!-- Health Summary (Flat Technical) -->
            <BaseWidget title="System Protocols" show-info>
                <div class="p-10 space-y-12">
                    <div v-for="item in [
                        { label: 'Latency_Optimised', val: '12ms', color: 'text-emerald-500' },
                        { label: 'Nodal_Uptime', val: '99.99%', color: 'text-blue-500' },
                        { label: 'Active_Clusters', val: '04', color: 'text-white' }
                    ]" :key="item.label" class="border-l-2 border-white/10 pl-8 py-2">
                        <p class="text-[9px] font-black text-white/50 uppercase tracking-[0.4em] mb-3">{{ item.label }}
                        </p>
                        <p class="text-4xl font-black italic tracking-tighter" :class="item.color">{{ item.val }}</p>
                    </div>
                </div>
                <template #footer>Telemetry Stream</template>
            </BaseWidget>

            <!-- Resource Load -->
            <BaseWidget title="Nodal Consumption" show-info>
                <div class="p-10 space-y-10">
                    <div v-for="res in [
                        { name: 'Compute_Load', percent: 14 },
                        { name: 'Storage_Used', percent: 62 },
                        { name: 'GPU_Inference', percent: 0 }
                    ]" :key="res.name" class="space-y-4">
                        <div class="flex justify-between items-end">
                            <span class="text-[9px] font-black text-white/60 uppercase tracking-widest">{{ res.name
                            }}</span>
                            <span class="text-xs font-black text-white/80">{{ res.percent }}%</span>
                        </div>
                        <div class="w-full h-px bg-white/10 relative">
                            <div class="absolute inset-0 bg-white group-hover:bg-[#007AFF] transition-all duration-1000"
                                :style="{ width: res.percent + '%' }"></div>
                        </div>
                    </div>
                </div>
                <template #footer>Billing Protocol</template>
            </BaseWidget>

            <!-- Solutions & Blueprints -->
            <BaseWidget title="Deployment Blueprints" class="lg:col-span-2">
                <div class="p-10 space-y-10">
                    <div v-for="bp in [
                        { name: 'Elastic_Web_Fabric', time: '12m', complexity: 'Low' },
                        { name: 'Neural_Inference_Cluster', time: '45m', complexity: 'High' }
                    ]" :key="bp.name"
                        class="bg-[#050505] border border-white/10 p-8 group hover:border-[#007AFF] transition-all cursor-crosshair">
                        <div class="flex justify-between items-start mb-6">
                            <h5
                                class="text-xl font-black uppercase tracking-tight group-hover:text-[#007AFF] transition-colors">
                                {{
                                    bp.name }}</h5>
                            <span class="text-[9px] font-black p-1 bg-white/10 text-white/60">{{ bp.complexity }}</span>
                        </div>
                        <div class="flex gap-10">
                            <span class="text-[9px] font-black uppercase tracking-widest text-white/40">ETP: {{ bp.time
                            }}</span>
                            <span
                                class="text-[9px] font-black uppercase tracking-widest text-[#007AFF] cursor-pointer hover:underline underline-offset-4 font-black">Generate_Stack</span>
                        </div>
                    </div>
                </div>
                <template #footer>Access Global Blueprint Library</template>
            </BaseWidget>

            <!-- Security & Access -->
            <BaseWidget title="Security Guard" show-info>
                <div class="p-10">
                    <div class="bg-red-500/5 border border-red-500/20 p-8 space-y-6">
                        <div class="flex items-center gap-4 text-red-500">
                            <div class="w-2 h-2 bg-red-500 animate-ping"></div>
                            <span class="text-xs font-black uppercase tracking-widest">Alert // Root_Auth</span>
                        </div>
                        <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-loose">
                            MFA protocol initialized. Secondary nodal verification required for administrator
                            privileges.
                        </p>
                        <button
                            class="w-full py-3 bg-red-500 text-black text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all">Verify_Now</button>
                    </div>
                </div>
            </BaseWidget>

        </div>

    </div>
</template>

<style scoped>
.shadow-3xl {
    box-shadow: 0 0 100px rgba(0, 0, 0, 1);
}
</style>
