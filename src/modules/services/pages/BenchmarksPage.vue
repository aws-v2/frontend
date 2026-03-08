<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Comparison Data
const providers = [
    { name: 'Serwin', logo: '/logo.svg', color: 'text-blue-400', provision: '45s', price: '$0.04/hr', iops: '20,000' },
    { name: 'AWS', logo: 'aws', color: 'text-slate-400', provision: '2m 30s', price: '$0.09/hr', iops: '5,000' },
    { name: 'Azure', logo: 'azure', color: 'text-slate-400', provision: '3m 15s', price: '$0.11/hr', iops: '4,500' },
    { name: 'GCP', logo: 'gcp', color: 'text-slate-400', provision: '1m 45s', price: '$0.08/hr', iops: '6,000' }
]

// Benchmarks Chart Data
const geekbenchScores = [
    { name: 'Serwin S1.Large', score: 2450, color: 'bg-blue-500' },
    { name: 'AWS c6g.large', score: 1890, color: 'bg-slate-700' },
    { name: 'Azure F2s_v2', score: 1750, color: 'bg-slate-700' },
    { name: 'GCP c2-standard-4', score: 2100, color: 'bg-slate-700' }
]

const animateCharts = ref(false)

onMounted(() => {
    setTimeout(() => {
        animateCharts.value = true
    }, 500)
})
</script>

<template>
    <div class="min-h-screen bg-[#0b0d17] relative overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-[20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-500/5 rounded-full blur-[150px]">
            </div>
            <div class="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[150px]">
            </div>
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]">
            </div>
        </div>

        <div class="relative z-10 px-6 py-32">
            <div class="max-w-7xl mx-auto">
                <!-- Back Button -->
                <button @click="router.push('/dashboard')"
                    class="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span class="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                </button>

                <!-- Header -->
                <div class="mb-20 text-center">
                    <div
                        class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Performance Validated
                    </div>
                    <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-6">
                        Performance that <br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">speaks
                            for itself.</span>
                    </h1>
                    <p class="text-slate-400 text-xl font-light max-w-2xl mx-auto">
                        We don't just claim to be faster. We prove it exactly where it matters: your workload.
                    </p>
                </div>

                <!-- Core Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24">
                    <div
                        class="glass-panel p-8 rounded-2xl border border-white/10 bg-white/[0.03] text-center group hover:bg-white/[0.05] transition-colors relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        </div>
                        <div class="relative z-10">
                            <div class="text-5xl font-bold text-white mb-2 font-display">45s</div>
                            <div class="text-xs font-black text-slate-500 uppercase tracking-widest">Cold Boot Time
                            </div>
                        </div>
                    </div>
                    <div
                        class="glass-panel p-8 rounded-2xl border border-white/10 bg-white/[0.03] text-center group hover:bg-white/[0.05] transition-colors relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        </div>
                        <div class="relative z-10">
                            <div class="text-5xl font-bold text-white mb-2 font-display">20k</div>
                            <div class="text-xs font-black text-slate-500 uppercase tracking-widest">Storage IOPS</div>
                        </div>
                    </div>
                    <div
                        class="glass-panel p-8 rounded-2xl border border-white/10 bg-white/[0.03] text-center group hover:bg-white/[0.05] transition-colors relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        </div>
                        <div class="relative z-10">
                            <div class="text-5xl font-bold text-white mb-2 font-display">10g</div>
                            <div class="text-xs font-black text-slate-500 uppercase tracking-widest">Network Speed</div>
                        </div>
                    </div>
                    <div
                        class="glass-panel p-8 rounded-2xl border border-white/10 bg-white/[0.03] text-center group hover:bg-white/[0.05] transition-colors relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-amber-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        </div>
                        <div class="relative z-10">
                            <div class="text-5xl font-bold text-white mb-2 font-display">99.9%</div>
                            <div class="text-xs font-black text-slate-500 uppercase tracking-widest">Uptime SLA</div>
                        </div>
                    </div>
                </div>

                <!-- Comparison Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
                    <!-- Head-to-Head Table -->
                    <div class="glass-panel p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
                        <h2 class="text-2xl font-bold text-white mb-8 font-display">Head-to-Head Comparison</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr
                                        class="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                        <th class="pb-4 pl-4">Provider</th>
                                        <th class="pb-4">Provision</th>
                                        <th class="pb-4">IOPS</th>
                                        <th class="pb-4 pr-4 text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm">
                                    <tr v-for="p in providers" :key="p.name"
                                        class="border-b border-white/5 last:border-0 group">
                                        <td class="py-4 pl-4 font-bold" :class="p.color">{{ p.name }}</td>
                                        <td class="py-4 text-slate-300">{{ p.provision }}</td>
                                        <td class="py-4 text-slate-300">{{ p.iops }}</td>
                                        <td
                                            class="py-4 pr-4 text-right font-mono text-slate-400 group-hover:text-white transition-colors">
                                            {{ p.price }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Benchmark Chart -->
                    <div
                        class="glass-panel p-8 rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-center">
                        <h2 class="text-2xl font-bold text-white mb-2 font-display">Geekbench 6 Single-Core</h2>
                        <p class="text-slate-400 text-sm mb-8">Higher score is better. All instances standardized to 2
                            vCPU / 4GB RAM.</p>

                        <div class="space-y-6">
                            <div v-for="item in geekbenchScores" :key="item.name">
                                <div
                                    class="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                    <span>{{ item.name }}</span>
                                    <span class="text-white">{{ item.score }}</span>
                                </div>
                                <div class="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full transition-all duration-1000 ease-out"
                                        :class="item.color"
                                        :style="{ width: animateCharts ? `${(item.score / 3000) * 100}%` : '0%' }">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-8 pt-6 border-t border-white/5 text-[10px] text-slate-600">
                            * Benchmarks run on 2024-02-15 using Ubuntu 22.04 LTS. Competitor pricing based on on-demand
                            rates in US-East.
                        </div>
                    </div>
                </div>

                <!-- Real World Scenarios -->
                <div>
                    <h2 class="text-2xl font-bold text-white mb-8 font-display">Real-World Performance</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            class="group relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-1 rounded-2xl overflow-hidden">
                            <div
                                class="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl">
                            </div>
                            <div class="relative bg-[#0b0d17] p-6 rounded-xl h-full">
                                <div
                                    class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-bold text-white mb-2">Database Workloads</h3>
                                <p class="text-sm text-slate-400">PostgreSQL queries execute <span
                                        class="text-white font-bold">2.4x faster</span> thanks to our NVMe-native
                                    storage fabric.</p>
                            </div>
                        </div>

                        <div
                            class="group relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-1 rounded-2xl overflow-hidden">
                            <div
                                class="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl">
                            </div>
                            <div class="relative bg-[#0b0d17] p-6 rounded-xl h-full">
                                <div
                                    class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 text-purple-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-bold text-white mb-2">Video Transcoding</h3>
                                <p class="text-sm text-slate-400">FFmpeg encoding jobs complete in <span
                                        class="text-white font-bold">40% less time</span> compared to equivalent AWS c6
                                    instances.</p>
                            </div>
                        </div>

                        <div
                            class="group relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-1 rounded-2xl overflow-hidden">
                            <div
                                class="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl">
                            </div>
                            <div class="relative bg-[#0b0d17] p-6 rounded-xl h-full">
                                <div
                                    class="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-bold text-white mb-2">AI Inference</h3>
                                <p class="text-sm text-slate-400">Low-latency inference on our edge zones delivers
                                    responses in <span class="text-white font-bold">&lt;10ms</span> for real-time
                                    applications.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-panel {
    @apply backdrop-blur-3xl shadow-2xl;
}
</style>
