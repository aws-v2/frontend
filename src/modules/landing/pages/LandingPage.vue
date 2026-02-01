<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToastStore } from '@/shared/store/toastStore'
import { useRouter } from 'vue-router'

const toastStore = useToastStore()
const router = useRouter()

const verticals = [
    {
        id: 'compute',
        name: 'Atomic Compute',
        tagline: 'RAW ELASTIC POWER.',
        description: 'Scalable bare-metal and serverless execution environments with sub-ms cold starts.',
        color: 'var(--color-compute)',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        specs: ['Nodal Execution', 'Lambda Flux', 'Fargate Core']
    },
    {
        id: 'storage',
        name: 'Hyper Storage',
        tagline: 'IMMUTABLE DATA LAKES.',
        description: 'Global object pools and managed relational state engineered for 11 nines of durability.',
        color: 'var(--color-storage)',
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
        specs: ['S3 Object Hub', 'RDS Relational', 'Quantum Crypt']
    },
    {
        id: 'ai',
        name: 'Neural Engine',
        tagline: 'DEEP INFERENCE POOLS.',
        description: 'Specialized GPU clusters for massive model hosting and real-time neural inference.',
        color: 'var(--color-ai)',
        icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3',
        specs: ['Stargate Inference', 'LLM Clusters', 'Weight Sharding']
    },
    {
        id: 'gaming',
        name: 'Matrix Gaming',
        tagline: 'SUB-MS LATENCY EDGE.',
        description: 'The foundation for real-time multiplayer worlds and high-fidelity 4K cloud streaming.',
        color: 'var(--color-gaming)',
        icon: 'M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15',
        specs: ['Fleet Manager', 'Stream Protocol', 'Zero-Lag Shield']
    }
]

// Real-time Telemetry Data
const telemetryPoints = ref<string>('')
const nodalLoad = ref(12.42)
const activeSignals = ref(4109)

const generateTelemetry = () => {
    let p = "0,80"
    for (let i = 1; i <= 20; i++) {
        const x = i * 20
        const y = 30 + Math.random() * 50
        p += ` ${x},${y}`
    }
    telemetryPoints.value = p
    nodalLoad.value = +(12 + Math.random() * 5).toFixed(2)
    activeSignals.value += Math.floor(Math.random() * 3) - 1
}

let ticker: any
onMounted(() => {
    generateTelemetry()
    ticker = setInterval(generateTelemetry, 2000)
    window.scrollTo(0, 0)
})

onUnmounted(() => {
    clearInterval(ticker)
})

const handleJoin = () => {
    router.push('/register')
}
</script>

<template>
    <div class="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black scroll-smooth">

        <!-- Unique Architectural Grid (Fixed) -->
        <div class="fixed inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
            <!-- Render-style grid but with Serwin uniqueness -->
            <div class="absolute inset-0 serwin-master-grid"></div>
            <!-- Dynamic scanning pulse -->
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,122,255,0.02),transparent_70%)]">
            </div>
            <div class="absolute top-0 left-0 w-full h-[1.5px] bg-[#007AFF]/10 blur-sm scan-line"></div>
        </div>

        <!-- Section 1: Hero Monolith -->
        <header class="relative min-h-screen flex items-center px-10 z-10 pt-20">
            <!-- Nav Integration -->
            <nav class="absolute top-0 left-0 w-full px-10 py-10 flex justify-between items-center bg-transparent">
                <div class="flex items-center gap-4 group cursor-pointer" @click="router.push('/')">
                    <div
                        class="w-6 h-6 bg-white rotate-45 group-hover:rotate-[225deg] transition-transform duration-1000">
                    </div>
                    <span class="text-2xl font-black uppercase tracking-[0.2em]">Serwin</span>
                </div>
                <div
                    class="hidden lg:flex gap-16 items-center text-[10px] font-black uppercase tracking-[0.5em] text-white/70">
                    <a href="#compute" class="hover:text-white transition-colors cursor-crosshair">Compute</a>
                    <a href="#storage" class="hover:text-white transition-colors cursor-crosshair">Storage</a>
                    <a href="#neural" class="hover:text-white transition-colors cursor-crosshair">Intelligence</a>
                    <a href="#gaming" class="hover:text-white transition-colors cursor-crosshair">Gaming</a>
                </div>
                <div class="flex gap-8 items-center">
                    <router-link to="/login"
                        class="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 hover:text-white transition-colors">Auth</router-link>
                    <router-link to="/register"
                        class="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#007AFF] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.05)]">Initialize</router-link>
                </div>
            </nav>

            <div class="max-w-7xl w-full">
                <div class="inline-flex items-center gap-4 mb-12 px-6 py-2 border border-white/5 bg-white/[0.02]">
                    <div class="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div>
                    <span class="text-[9px] font-black uppercase tracking-[0.8em] text-white/70">Nodal_Status //
                        Nominal_State</span>
                </div>

                <h1 class="text-7xl md:text-[12rem] font-black leading-[0.8] tracking-[0.02em] uppercase mb-12">
                    <span class="block">The</span>
                    <span class="block text-white/20 italic">Absolute</span>
                    <span class="block">Protocol.</span>
                </h1>

                <div class="flex flex-col md:flex-row gap-24 items-start mt-24">
                    <div class="flex flex-col gap-6">
                        <button @click="handleJoin"
                            class="group flex items-center gap-10 py-8 border-b border-white text-4xl font-black uppercase tracking-tighter hover:gap-16 transition-all duration-700">
                            Provision Cluster
                            <svg class="w-12 h-12 group-hover:translate-x-6 transition-transform" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="square" stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                    <p
                        class="text-xl text-white/60 max-w-sm leading-relaxed uppercase tracking-widest font-black pt-4 italic">
                        Serwin unifies mission-critical infrastructure into a singular atomic protocol. No
                        fragmentation. Just raw, distributed velocity.
                    </p>
                </div>
            </div>

            <!-- Absolute Background Element (Warped Grid) -->
            <div
                class="absolute right-[5vw] bottom-[10vh] w-[40vw] h-[40vw] border-[0.5px] border-white/5 perspective-grid hidden lg:block">
            </div>
        </header>

        <!-- Section 2: Compute Details -->
        <section id="compute" class="relative z-10 py-60 border-t border-white/5 bg-black/40">
            <div class="px-10 grid lg:grid-cols-2 gap-32 items-start">
                <div class="sticky top-40">
                    <div
                        class="text-[11px] font-black text-[#00F5FF] uppercase tracking-[0.8em] mb-10 underline underline-offset-[16px] decoration-1 decoration-white/10">
                        Frontier_01</div>
                    <h2 class="text-8xl font-black uppercase tracking-tighter mb-12 italic text-white/10">Compute</h2>
                    <h3 class="text-5xl font-black uppercase tracking-tighter mb-12 leading-[0.9]">
                        Atomic<br />Logic_Flow.</h3>
                    <p
                        class="text-lg text-white/60 uppercase tracking-widest leading-relaxed max-w-sm font-black italic">
                        Run logic without architectural limits. From raw metallic power to serverless event-driven
                        execution chains.
                    </p>
                </div>
                <div class="space-y-40">
                    <div v-for="(feat, i) in [
                        { name: 'Nodal Execution', desc: 'Secure, resizable bare-metal compute. Optimized for intense server-side logic with automated orchestration.' },
                        { name: 'Lambda Flux', desc: 'Event-driven serverless state. Pay only for the logic lifecycle. Sub-ms cold starts across the fiber edge.' },
                        { name: 'Fargate Core', desc: 'Serverless containers. Zero management overhead. Absolute isolation for high-density microservices.' }
                    ]" :key="feat.name" class="group">
                        <div class="text-[10px] font-black text-[#00F5FF]/70 mb-8 tracking-[0.4em]">Integrated_Mod //
                            0{{ i + 1 }}</div>
                        <h4
                            class="text-4xl font-black uppercase tracking-tighter mb-8 group-hover:pl-4 transition-all duration-500 border-l-4 border-transparent group-hover:border-[#00F5FF]">
                            {{ feat.name }}</h4>
                        <p class="text-[13px] font-black text-white/60 uppercase tracking-[0.2em] leading-loose">{{
                            feat.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 3: Storage Details -->
        <section id="storage" class="relative z-10 py-60 bg-[#050505] border-y border-white/5">
            <div class="px-10 grid lg:grid-cols-2 gap-40 items-center">
                <div class="lg:order-2">
                    <div
                        class="text-[11px] font-black text-[#00FF88] uppercase tracking-[0.8em] mb-10 underline underline-offset-[16px] decoration-1 decoration-white/10">
                        Frontier_02</div>
                    <h2 class="text-8xl font-black uppercase tracking-tighter mb-12 italic text-white/10">Storage</h2>
                    <h3 class="text-5xl font-black uppercase tracking-tighter mb-12 leading-[0.9]">
                        Absolute<br />Integrity.</h3>
                    <p
                        class="text-lg text-white/60 uppercase tracking-widest leading-relaxed max-w-sm font-black italic">
                        Immutable asset pools meeting high-concurrency relational state. Guaranteed 11 nines of nodal
                        durability.
                    </p>
                    <button @click="handleJoin"
                        class="mt-20 px-16 py-6 bg-[#00FF88] text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_100px_rgba(0,255,136,0.1)]">Provision
                        Storage Hub</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 lg:order-1">
                    <div v-for="sfeat in [
                        { name: 'Bucket_S3', val: 'PB_Scale', desc: 'Global Object Data' },
                        { name: 'Nodal_RDS', val: 'Low_Ms', desc: 'Relational State' },
                        { name: 'Glacier_Void', val: 'Immutable', desc: 'Deep Archive' },
                        { name: 'EFS_Fabric', val: 'Shared_IO', desc: 'Grid File Sys' }
                    ]" :key="sfeat.name"
                        class="bg-black p-12 aspect-square flex flex-col justify-between hover:bg-white hover:text-black transition-all duration-700 cursor-none group">
                        <div
                            class="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">
                            S.{{ sfeat.name.split('_')[1] }}</div>
                        <div class="space-y-4">
                            <div class="text-4xl font-black uppercase tracking-tighter italic">{{
                                sfeat.name.split('_')[1] }}</div>
                            <p
                                class="text-[9px] font-black uppercase tracking-widest text-[#00FF88] group-hover:text-black">
                                {{ sfeat.desc }}</p>
                        </div>
                        <div class="flex justify-between items-end">
                            <span
                                class="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100">{{
                                    sfeat.val }}</span>
                            <div class="w-2 h-2 bg-[#00FF88] group-hover:rotate-45 transition-transform"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 4: Intelligence -->
        <section id="neural" class="relative z-10 py-60 border-b border-white/5 bg-black/80">
            <div class="max-w-7xl mx-auto px-10">
                <div class="flex flex-col lg:flex-row justify-between items-end mb-40 gap-16">
                    <div class="max-w-3xl">
                        <div
                            class="text-[11px] font-black text-[#7F00FF] uppercase tracking-[0.8em] mb-10 underline underline-offset-[16px] decoration-1 decoration-white/10">
                            Frontier_03</div>
                        <h2 class="text-9xl font-black uppercase tracking-[0.05em] leading-none mb-12">Neural<br />Hub.
                        </h2>
                    </div>
                </div>

                <div class="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5">
                    <div v-for="ai in [
                        { name: 'Stargate Inference', spec: 'A100/H100 Clusters', dec: '01', desc: 'Real-time neural inference at the fiber terminal.' },
                        { name: 'Weight Sharding', spec: 'Nodal Distribution', dec: '02', desc: 'Deep model sharding across elastic node groups.' },
                        { name: 'Logic Training', spec: 'Quantized Compute', dec: '03', desc: 'Custom weights training on bare-metal fabric.' }
                    ]" :key="ai.name"
                        class="bg-black p-12 flex flex-col justify-between aspect-[3/4] group hover:bg-[#7F00FF] transition-all duration-1000 border border-transparent hover:border-white/20">
                        <span
                            class="text-8xl font-black text-white/[0.06] group-hover:text-white/20 transition-all font-mono italic">{{
                                ai.dec }}</span>
                        <div>
                            <h4 class="text-3xl font-black uppercase tracking-tighter mb-6">{{ ai.name }}</h4>
                            <p
                                class="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] group-hover:text-white leading-relaxed mb-6">
                                {{ ai.desc }}</p>
                            <div
                                class="text-[10px] font-black text-[#7F00FF] uppercase tracking-[0.4em] group-hover:text-white">
                                {{ ai.spec }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 5: Matrix Gaming -->
        <section id="gaming" class="relative z-10 py-60 overflow-hidden bg-[#020202]">
            <div class="px-10 flex flex-col items-center text-center">
                <div
                    class="text-[11px] font-black text-[#FF0055] uppercase tracking-[0.8em] mb-10 underline underline-offset-[16px] decoration-1 decoration-white/10">
                    Frontier_04</div>
                <h2 class="text-8xl md:text-[12rem] font-black uppercase tracking-tighter italic mb-16">Gaming.</h2>
                <div
                    class="max-w-5xl text-4xl font-black uppercase tracking-tight leading-none mb-32 underline underline-offset-[24px] decoration-[#FF0055]/30 decoration-8">
                    The absolute foundation for real-time worlds and high-velocity streaming protocols.
                </div>

                <div class="grid lg:grid-cols-2 gap-px bg-white/5 border border-white/5 w-full">
                    <div
                        class="bg-black p-24 flex flex-col justify-between text-left group hover:bg-white transition-all duration-700 aspect-video">
                        <h4 class="text-6xl font-black uppercase tracking-tighter italic mb-12 group-hover:text-black">
                            Fleet_Manager</h4>
                        <div>
                            <p
                                class="text-xl font-black uppercase tracking-widest leading-tight text-white/40 group-hover:text-black/60 mb-10">
                                Secure, resizable game server fleets at the absolute edge of the fiber network.</p>
                            <div class="h-px w-20 bg-[#FF0055] group-hover:w-full transition-all"></div>
                        </div>
                    </div>
                    <div
                        class="bg-black p-24 flex flex-col justify-between text-left group hover:bg-white transition-all duration-700 aspect-video">
                        <h4 class="text-6xl font-black uppercase tracking-tighter italic mb-12 group-hover:text-black">
                            Stream_Flux</h4>
                        <div>
                            <p
                                class="text-xl font-black uppercase tracking-widest leading-tight text-white/40 group-hover:text-black/60 mb-10">
                                Ultra-low latency streaming architecture delivering 4K/144 to any digital terminal.</p>
                            <div class="h-px w-20 bg-[#FF0055] group-hover:w-full transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 6: Telemetry Integrity -->
        <section class="relative z-10 py-60 border-y border-white/5 bg-black">
            <div class="px-10 grid lg:grid-cols-2 gap-40 items-center">
                <div>
                    <h2 class="text-7xl font-black uppercase tracking-tight mb-16 leading-none italic">
                        Universal<br />Telemetry.</h2>
                    <p
                        class="text-xl text-white/60 leading-relaxed uppercase tracking-widest max-w-xl font-black italic mb-20">
                        Real-time nodal health visualization. Our protocol delivers 99.9% of global requests in under
                        12ms.
                    </p>
                    <div class="grid grid-cols-2 gap-20">
                        <div class="border-l-2 border-emerald-500 pl-10">
                            <div class="text-6xl font-black mb-4 tracking-tighter text-emerald-500 italic">99.999%</div>
                            <div class="text-[10px] font-black text-white/50 uppercase tracking-[0.6em]">Uptime Protocol
                            </div>
                        </div>
                        <div class="border-l-2 border-blue-500 pl-10">
                            <div class="text-6xl font-black mb-4 tracking-tighter text-blue-500 italic">11.4ms</div>
                            <div class="text-[10px] font-black text-white/50 uppercase tracking-[0.6em]">Mean Latency
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Realistic Technical Graph -->
                <div
                    class="relative aspect-video bg-[#050505] border border-white/5 p-12 flex flex-col justify-between group overflow-hidden shadow-3xl">
                    <div class="absolute inset-0 pointer-events-none opacity-20">
                        <div class="w-full h-full serwin-mini-grid"></div>
                    </div>
                    <div class="relative z-10 flex justify-between items-start">
                        <div>
                            <div
                                class="text-[9px] font-black text-white/50 uppercase tracking-[0.8em] mb-4 underline underline-offset-8">
                                Network_Throughput</div>
                            <div
                                class="text-xs font-black text-emerald-500 animate-pulse tracking-[0.2em] font-mono leading-none flex items-center gap-2">
                                <span class="w-1.5 h-1.5 bg-emerald-500"></span>
                                RAW_DATA_NOMINAL
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[9px] font-black text-white/50 uppercase tracking-[0.8em] mb-4">
                                Nodal_Stress</div>
                            <div class="text-[14px] font-black text-[#007AFF] font-mono">{{ nodalLoad }}%</div>
                        </div>
                    </div>

                    <svg viewBox="0 0 400 100" class="w-full h-40 mt-12">
                        <polyline fill="none" stroke="#007AFF" stroke-width="3" stroke-linejoin="round"
                            :points="telemetryPoints" class="transition-all duration-1000" />
                        <polyline fill="none" stroke="#007AFF" stroke-width="12" stroke-linejoin="round"
                            stroke-opacity="0.05" :points="telemetryPoints"
                            class="blur-md transition-all duration-1000" />
                    </svg>

                    <div class="relative z-10 flex justify-between items-end border-t border-white/5 pt-8">
                        <div class="text-[10px] font-black text-white/50 uppercase tracking-[0.6em] italic">
                            SERWIN.ALGOR.FEED</div>
                        <div class="flex gap-3">
                            <div class="w-1.5 h-3 bg-white/30"></div>
                            <div class="w-1.5 h-5 bg-[#007AFF]"></div>
                            <div class="w-1.5 h-4 bg-white/30"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 7: Connect Now (Dark Monolith) -->
        <section class="py-60 bg-black text-white px-10 text-center relative overflow-hidden border-t border-white/5">
            <!-- Background Nodal Grid -->
            <div class="absolute inset-0 z-0 pointer-events-none opacity-5 serwin-master-grid scale-150 rotate-12">
            </div>

            <div class="relative z-10 max-w-5xl mx-auto">
                <div
                    class="text-[11px] font-black uppercase tracking-[2em] mb-16 text-[#007AFF] italic leading-none animate-pulse">
                    Awaiting Signal</div>
                <h2 class="text-8xl md:text-[14rem] font-black uppercase tracking-tighter leading-[0.75] mb-24 italic">
                    Connect<br /><span class="text-white/20">Infinite.</span></h2>
                <div
                    class="flex flex-col sm:flex-row gap-px bg-white/5 border border-white/5 shadow-[0_0_150px_rgba(0,0,0,1)]">
                    <router-link to="/register"
                        class="flex-1 px-16 py-12 bg-black hover:bg-white hover:text-black transition-all text-3xl font-black uppercase tracking-tighter border-r border-white/5 flex items-center justify-center gap-10 group">
                        Initialize Node
                        <svg class="w-8 h-8 group-hover:translate-x-4 transition-transform" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                        </svg>
                    </router-link>
                    <button
                        class="flex-1 px-16 py-12 bg-[#050505] hover:bg-[#007AFF] hover:text-white transition-all text-3xl font-black uppercase tracking-tighter">Talk
                        to Engine</button>
                </div>
            </div>
        </section>

        <!-- Void Footer -->
        <footer class="py-24 px-10 border-t border-white/5 bg-black z-10 relative">
            <div class="flex flex-col md:flex-row justify-between items-start gap-32">
                <div class="max-w-md">
                    <div class="flex items-center gap-4 mb-14">
                        <div class="w-6 h-6 bg-white rotate-45"></div>
                        <span class="text-3xl font-black uppercase tracking-widest italic">Serwin.Infarct</span>
                    </div>
                    <p class="text-sm font-black text-white/50 uppercase tracking-[0.4em] leading-loose mb-12">
                        The definitive infrastructure protocol for high-density neural, elastic, and immersive
                        operations. Global reach. Zero friction. Total velocity.
                    </p>
                    <div class="flex items-center gap-4 text-[#007AFF]">
                        <div class="w-1.5 h-1.5 bg-[#007AFF] animate-ping"></div>
                        <span class="text-[10px] font-black uppercase tracking-[1em] opacity-60">System_Active // {{
                            activeSignals }}_Signals</span>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-24 flex-1 max-w-4xl">
                    <div v-for="cat in [
                        { name: 'Systems', links: ['Atomic Compute', 'Hyper Storage', 'Intelligence', 'Matrix Gaming'] },
                        { name: 'Protocol', links: ['Fiber Edge', 'Auth Nodal', 'API Spec', 'SDK v2.4'] },
                        { name: 'Company', links: ['Architecture', 'Engineering', 'Security', 'The_Void'] }
                    ]" :key="cat.name">
                        <h4
                            class="text-[12px] font-black uppercase tracking-[0.8em] text-white/20 mb-12 italic decoration-1 underline underline-offset-8 decoration-white/5">
                            {{ cat.name }}</h4>
                        <ul class="flex flex-col gap-8">
                            <li v-for="link in cat.links" :key="link"
                                class="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 hover:text-white cursor-pointer transition-colors">
                                {{ link }}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div
                class="mt-48 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between gap-16 items-center">
                <div class="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic">© 2026
                    SERWIN.PROTOCOL // ENCRYPTED_TERMINAL_00x4A</div>
                <div class="flex gap-16 items-center">
                    <span
                        class="text-[10px] font-black text-white/50 uppercase tracking-[1.2em] hover:text-white cursor-pointer transition-all">TWITTER</span>
                    <span
                        class="text-[10px] font-black text-white/50 uppercase tracking-[1.2em] hover:text-white cursor-pointer transition-all">GITHUB</span>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

.font-mono {
    font-family: 'JetBrains Mono', monospace;
}

.serwin-master-grid {
    background-image:
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
}

.serwin-mini-grid {
    background-image:
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 30px 30px;
}

.scan-line {
    animation: scan 20s linear infinite;
}

@keyframes scan {
    0% {
        transform: translateY(-100%);
    }

    100% {
        transform: translateY(1000vh);
    }
}

.perspective-grid {
    perspective: 1000px;
    transform: rotateX(60deg) rotateZ(45deg);
    background-image:
        linear-gradient(to right, rgba(0, 122, 255, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 122, 255, 0.1) 1px, transparent 1px);
    background-size: 40px 40px;
}

/* Custom Scrollbar for Void Theme */
::-webkit-scrollbar {
    width: 2px;
}

::-webkit-scrollbar-track {
    background: #000;
}

::-webkit-scrollbar-thumb {
    background: #111;
}

::-webkit-scrollbar-thumb:hover {
    background: #007AFF;
}

.shadow-3xl {
    box-shadow: 0 0 120px rgba(0, 0, 0, 1);
}
</style>
