<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Kenya data centers
const dataCenters = [
    { id: 1, name: 'Nairobi Central', city: 'Nairobi', x: 50, y: 60, status: 'active', capacity: '95%', latency: '< 1ms' },
    { id: 2, name: 'Mombasa Coastal', city: 'Mombasa', x: 70, y: 75, status: 'active', capacity: '87%', latency: '< 3ms' },
    { id: 3, name: 'Kisumu West', city: 'Kisumu', x: 30, y: 50, status: 'active', capacity: '92%', latency: '< 2ms' },
    { id: 4, name: 'Nakuru Rift', city: 'Nakuru', x: 40, y: 55, status: 'active', capacity: '78%', latency: '< 2ms' },
    { id: 5, name: 'Eldoret North', city: 'Eldoret', x: 35, y: 40, status: 'active', capacity: '83%', latency: '< 3ms' }
]

// Network connections between data centers
const connections = [
    { from: 1, to: 2 }, // Nairobi to Mombasa
    { from: 1, to: 3 }, // Nairobi to Kisumu
    { from: 1, to: 4 }, // Nairobi to Nakuru
    { from: 1, to: 5 }, // Nairobi to Eldoret
    { from: 3, to: 4 }, // Kisumu to Nakuru
    { from: 4, to: 5 }, // Nakuru to Eldoret
]

// Animated particles
const particles = ref<Array<{ id: number, x: number, y: number, vx: number, vy: number }>>([])

// Initialize particles
const initParticles = () => {
    particles.value = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05
    }))
}

// Animate particles
let animationFrame: number
const animateParticles = () => {
    particles.value.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > 100) p.vx *= -1
        if (p.y < 0 || p.y > 100) p.vy *= -1

        // Keep in bounds
        p.x = Math.max(0, Math.min(100, p.x))
        p.y = Math.max(0, Math.min(100, p.y))
    })

    animationFrame = requestAnimationFrame(animateParticles)
}

onMounted(() => {
    initParticles()
    animateParticles()
})

onUnmounted(() => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
    }
})

const selectedZone = ref<number | null>(null)
</script>

<template>
    <div class="min-h-screen bg-[#0b0d17] relative overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px] opacity-30">
            </div>
            <div
                class="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] opacity-20">
            </div>
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_100%)]">
            </div>
        </div>

        <!-- Content -->
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
                <div class="mb-16">
                    <div
                        class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Network Infrastructure
                    </div>
                    <h1 class="text-6xl font-bold text-white tracking-tight font-display mb-4">
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Global
                            Mesh Network</span>
                    </h1>
                    <p class="text-slate-400 text-xl font-light max-w-3xl">
                        Connect your infrastructure across Kenya with our proprietary fiber backbone. Zero-trust
                        security by default.
                    </p>
                </div>

                <!-- Gaming & Compute Blend Section -->
                <div
                    class="glass-panel p-1 rounded-3xl border border-white/10 bg-white/[0.03] mb-16 relative overflow-hidden group">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    </div>

                    <div class="relative bg-[#0b0d17]/80 rounded-[22px] overflow-hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2">
                            <!-- Gaming Side -->
                            <div
                                class="p-12 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
                                <div class="absolute inset-0 bg-blue-500/5"></div>
                                <div class="relative z-10">
                                    <div class="flex items-center gap-3 mb-6">
                                        <div
                                            class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 class="text-xl font-bold text-white font-display">Low-Latency Gaming</h3>
                                    </div>
                                    <p class="text-slate-400 mb-8 leading-relaxed">
                                        Our mesh network optimizes routing for real-time multiplayer experiences.
                                        Sub-5ms latency ensures competitive integrity for players across the region.
                                    </p>
                                    <div class="flex items-center gap-4">
                                        <div class="px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <div class="text-2xl font-bold text-white">128<span
                                                    class="text-sm text-blue-400 ml-1">tick</span></div>
                                            <div class="text-[10px] uppercase tracking-wider text-slate-500">Server Rate
                                            </div>
                                        </div>
                                        <div class="px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <div class="text-2xl font-bold text-white">&lt;5<span
                                                    class="text-sm text-blue-400 ml-1">ms</span></div>
                                            <div class="text-[10px] uppercase tracking-wider text-slate-500">Ping</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Compute Side -->
                            <div class="p-12 relative overflow-hidden">
                                <div class="absolute inset-0 bg-purple-500/5"></div>
                                <div class="relative z-10">
                                    <div class="flex items-center gap-3 mb-6">
                                        <div
                                            class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <h3 class="text-xl font-bold text-white font-display">High-Performance Compute
                                        </h3>
                                    </div>
                                    <p class="text-slate-400 mb-8 leading-relaxed">
                                        The same fiber backbone powers our intense compute workloads.
                                        Direct DMA access and visually lossless compression for remote workstations.
                                    </p>
                                    <div class="flex items-center gap-4">
                                        <div class="px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                            <div class="text-2xl font-bold text-white">100<span
                                                    class="text-sm text-purple-400 ml-1">Gbps</span></div>
                                            <div class="text-[10px] uppercase tracking-wider text-slate-500">Throughput
                                            </div>
                                        </div>
                                        <div class="px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                            <div class="text-2xl font-bold text-white">99.9<span
                                                    class="text-sm text-purple-400 ml-1">%</span></div>
                                            <div class="text-[10px] uppercase tracking-wider text-slate-500">Consistency
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Blend Connector -->
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#0b0d17] rounded-full flex items-center justify-center border border-white/10 z-20 hidden lg:flex">
                            <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Zones
                        </div>
                        <div class="text-4xl font-bold text-white mb-1">5</div>
                        <div class="text-xs text-emerald-400 font-bold">100% Operational</div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Avg Latency
                        </div>
                        <div class="text-4xl font-bold text-white mb-1">&lt; 2ms</div>
                        <div class="text-xs text-blue-400 font-bold">Cross-zone</div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Uptime</div>
                        <div class="text-4xl font-bold text-white mb-1">99.99%</div>
                        <div class="text-xs text-emerald-400 font-bold">SLA Guaranteed</div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bandwidth
                        </div>
                        <div class="text-4xl font-bold text-white mb-1">100Gbps</div>
                        <div class="text-xs text-purple-400 font-bold">Per Zone</div>
                    </div>
                </div>

                <!-- Interactive Network Map -->
                <div
                    class="glass-panel p-12 rounded-3xl border border-white/10 bg-white/[0.03] mb-16 relative overflow-hidden">
                    <h2 class="text-2xl font-bold text-white mb-8 font-display">Kenya Network Topology</h2>

                    <!-- Map Container -->
                    <div
                        class="relative w-full h-[600px] bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl border border-white/5 overflow-hidden">
                        <!-- Animated Background Particles -->
                        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                            <circle v-for="particle in particles" :key="particle.id" :cx="`${particle.x}%`"
                                :cy="`${particle.y}%`" r="1" fill="rgba(59, 130, 246, 0.3)" class="animate-pulse" />
                        </svg>

                        <!-- Network Connections -->
                        <svg class="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:rgb(59, 130, 246);stop-opacity:0.3" />
                                    <stop offset="50%" style="stop-color:rgb(99, 102, 241);stop-opacity:0.6" />
                                    <stop offset="100%" style="stop-color:rgb(59, 130, 246);stop-opacity:0.3" />
                                </linearGradient>
                            </defs>

                            <line v-for="(conn, idx) in connections" :key="idx"
                                :x1="`${dataCenters.find(dc => dc.id === conn.from)?.x}%`"
                                :y1="`${dataCenters.find(dc => dc.id === conn.from)?.y}%`"
                                :x2="`${dataCenters.find(dc => dc.id === conn.to)?.x}%`"
                                :y2="`${dataCenters.find(dc => dc.id === conn.to)?.y}%`"
                                stroke="url(#connectionGradient)" stroke-width="2" class="animate-pulse"
                                style="animation-duration: 3s" />
                        </svg>

                        <!-- Data Center Nodes -->
                        <div v-for="dc in dataCenters" :key="dc.id" :style="{ left: `${dc.x}%`, top: `${dc.y}%` }"
                            class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            @mouseenter="selectedZone = dc.id" @mouseleave="selectedZone = null">
                            <!-- Pulse Ring -->
                            <div class="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                                <div class="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                            </div>

                            <!-- Node Circle -->
                            <div
                                class="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-4 border-white/20 shadow-lg shadow-blue-500/50 group-hover:scale-125 transition-transform flex items-center justify-center">
                                <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            </div>

                            <!-- Info Card -->
                            <div v-if="selectedZone === dc.id"
                                class="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                                <div class="flex items-start justify-between mb-3">
                                    <div>
                                        <div class="text-sm font-bold text-white">{{ dc.name }}</div>
                                        <div class="text-xs text-slate-400">{{ dc.city }}, Kenya</div>
                                    </div>
                                    <div
                                        class="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-black text-emerald-400 uppercase">
                                        {{ dc.status }}
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-slate-400">Capacity</span>
                                        <span class="text-white font-bold">{{ dc.capacity }}</span>
                                    </div>
                                    <div class="flex justify-between text-xs">
                                        <span class="text-slate-400">Latency</span>
                                        <span class="text-blue-400 font-bold">{{ dc.latency }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Regional Breakdown -->
                <div class="mb-16">
                    <h2 class="text-2xl font-bold text-white mb-8 font-display">Regional Coverage</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="dc in dataCenters" :key="dc.id"
                            class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all group cursor-pointer">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                                        <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="text-sm font-bold text-white">{{ dc.name }}</div>
                                        <div class="text-xs text-slate-400">{{ dc.city }}</div>
                                    </div>
                                </div>
                                <div class="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between text-xs mb-1">
                                        <span class="text-slate-400">Capacity</span>
                                        <span class="text-white font-bold">{{ dc.capacity }}</span>
                                    </div>
                                    <div class="w-full bg-white/5 rounded-full h-1.5">
                                        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                                            :style="{ width: dc.capacity }"></div>
                                    </div>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="text-slate-400">Avg Latency</span>
                                    <span class="text-blue-400 font-bold">{{ dc.latency }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Use Cases -->
                <div class="glass-panel p-12 rounded-3xl border border-white/10 bg-white/[0.03]">
                    <h2 class="text-2xl font-bold text-white mb-8 font-display">Network Benefits</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-bold text-white mb-2">Zero-Trust Security</h3>
                            <p class="text-sm text-slate-400 leading-relaxed">End-to-end encryption with automatic
                                certificate rotation and DDoS protection built-in.</p>
                        </div>
                        <div>
                            <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-bold text-white mb-2">Ultra-Low Latency</h3>
                            <p class="text-sm text-slate-400 leading-relaxed">Fiber-optic backbone ensures sub-5ms
                                latency between any two zones in Kenya.</p>
                        </div>
                        <div>
                            <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-bold text-white mb-2">99.99% Uptime SLA</h3>
                            <p class="text-sm text-slate-400 leading-relaxed">Redundant paths and automatic failover
                                ensure your applications stay online.</p>
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

@keyframes ping {

    75%,
    100% {
        transform: scale(2);
        opacity: 0;
    }
}
</style>
