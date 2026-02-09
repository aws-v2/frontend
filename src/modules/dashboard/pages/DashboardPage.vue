<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseWidget from '@/shared/components/BaseWidget.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'

const authStore = useAuthStore()
const router = useRouter()

const frontiers = [
    { id: 'compute', name: 'Compute Engine', icon: 'server', description: 'Manage clusters & serverless functions', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50', path: '/compute' },
    { id: 'storage', name: 'Object Storage', icon: 'database', description: 'Buckets, policies & replication', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50', path: '/s3' },
    { id: 'sagemaker', name: 'SageMaker', icon: 'brain', description: 'Train & deploy ML models', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/50', path: '/sagemaker' },
    { id: 'gaming', name: 'GameLift Edge', icon: 'gamepad', description: 'Multiplayer fleet scaling', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/50', path: '/gaming' }
]

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
    <div class="min-h-screen pb-24">
        <!-- Dashboard Header -->
        <header class="px-6 py-8 border-b border-white/5 bg-[#05080F]">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 class="text-3xl font-bold text-white font-display mb-2">Console Overview</h1>
                    <p class="text-slate-400 text-sm">Welcome back, {{ authStore.email?.split('@')[0] || 'Operator' }}.
                        System is running nominally.</p>
                </div>

                <div class="flex gap-4">
                    <button class="btn-secondary text-sm">Documentation</button>
                    <button class="btn-primary text-sm flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        New Resource
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Service Catalog -->
            <section class="lg:col-span-2 space-y-6">
                <h2 class="text-lg font-bold text-white font-display">Services</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="service in frontiers" :key="service.id" @click="navigateTo(service.path)"
                        class="glass-card p-6 rounded-xl cursor-pointer group hover:bg-white/[0.02] border border-white/5 transition-all"
                        :class="service.border">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                                :class="service.bg">
                                <!-- Icons -->
                                <svg v-if="service.icon === 'server'" class="w-6 h-6" :class="service.color" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                                <svg v-if="service.icon === 'database'" class="w-6 h-6" :class="service.color"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                <svg v-if="service.icon === 'brain'" class="w-6 h-6" :class="service.color" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" />
                                </svg>
                                <svg v-if="service.icon === 'gamepad'" class="w-6 h-6" :class="service.color"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                </svg>
                            </div>
                            <svg class="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 class="text-white font-bold text-lg mb-1 group-hover:text-white transition-colors">{{
                            service.name }}</h3>
                        <p class="text-slate-400 text-xs">{{ service.description }}</p>
                    </div>
                </div>

                <!-- Usage Graph Placeholder -->
                <div class="glass-panel p-6 rounded-xl mt-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-sm font-bold text-white">Resource Usage</h3>
                        <select class="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-slate-300">
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div class="h-48 flex items-end gap-2">
                        <div v-for="n in 30" :key="n"
                            class="flex-1 bg-indigo-500/20 rounded-t-sm hover:bg-indigo-500/50 transition-colors"
                            :style="{ height: Math.random() * 100 + '%' }"></div>
                    </div>
                </div>
            </section>

            <!-- Sidebar Widgets -->
            <aside class="space-y-6">
                <!-- Platform Health -->
                <BaseWidget title="Platform Health" show-info>
                    <div class="p-6 space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span class="text-sm text-white font-medium">All Systems Operational</span>
                        </div>
                        <div class="space-y-3 pt-2 border-t border-white/5">
                            <div class="flex justify-between text-xs">
                                <span class="text-slate-400">Compute</span>
                                <span class="text-emerald-400">Normal</span>
                            </div>
                            <div class="flex justify-between text-xs">
                                <span class="text-slate-400">Storage</span>
                                <span class="text-emerald-400">Normal</span>
                            </div>
                            <div class="flex justify-between text-xs">
                                <span class="text-slate-400">GameLift</span>
                                <span class="text-emerald-400">Normal</span>
                            </div>
                        </div>
                    </div>
                </BaseWidget>

                <!-- Activity Feed -->
                <BaseWidget title="Recent Activity">
                    <div class="p-0">
                        <div v-for="activity in recentActivity" :key="activity.id"
                            class="px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <div class="flex justify-between items-start mb-1">
                                <span class="text-xs font-semibold text-white">{{ activity.action }}</span>
                                <span class="text-[10px] text-slate-500">{{ activity.time }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full" :class="{
                                    'bg-emerald-500': activity.status === 'success',
                                    'bg-indigo-500': activity.status === 'info',
                                    'bg-yellow-500': activity.status === 'warning'
                                }"></span>
                                <span class="text-xs text-slate-400 font-mono">{{ activity.resource }}</span>
                            </div>
                        </div>
                    </div>
                    <template #footer>View Audit Log</template>
                </BaseWidget>
            </aside>
        </main>
    </div>
</template>
