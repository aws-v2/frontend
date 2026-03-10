<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleGetStarted = () => {
    if (authStore.isAuthenticated) {
        router.push('/dashboard')
    } else {
        router.push('/login')
    }
}

// Interactive nodes for the background map
const nodes = ref([
    { id: 1, x: 20, y: 30, color: 'bg-indigo-600', icon: 'server', label: 'EC2 Instance' },
    { id: 2, x: 50, y: 50, color: 'bg-[#ff9900]', icon: 'database', label: 'Primary DB' }, // AWS orange
    { id: 3, x: 80, y: 30, color: 'bg-emerald-600', icon: 'globe', label: 'CDN Edge' },
])

// Use Cases data
const useCases = [
    { title: 'Compute', action: 'Deploy VMs in seconds', icon: '⚡', route: '/compute' },
    { title: 'Gaming', action: 'Host low-latency sessions', icon: '🎮', route: '/gaming', comingSoon: true },
    { title: 'Storage', action: 'Archive petabytes of data', icon: '💾', route: '/s3' },
    { title: 'AI Ops', action: 'Train models on H100 clusters', icon: '🧠', route: '/sagemaker', comingSoon: true },
]

const features = [
    {
        title: 'Global Mesh Network',
        desc: 'Connect your infrastructure across 32 zones with our proprietary fiber backbone. Zero-trust security by default.',
        link: 'View Coverage',
        path: '/gaming',
        gradient: 'bg-[#ff9900]/5',
        comingSoon: true
    },
    {
        title: 'Instant Provisioning',
        desc: 'Spin up 10,000 cores in under 45 seconds. Our hypervisor-free architecture delivers raw silicon performance.',
        link: 'Read Benchmarks',
        path: '/compute',
        gradient: 'bg-indigo-600/5'
    },
    {
        title: 'S3-Compatible Storage',
        desc: 'Drop-in replacement for AWS S3. 99.999999999% durability with lower egress fees and faster retrieval times.',
        link: 'Migrate Now',
        path: '/s3',
        gradient: 'bg-emerald-600/5'
    }
]

onMounted(() => {
    window.scrollTo(0, 0)
})
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f] overflow-x-hidden">

        <!-- Navigation -->
        <PublicNavbar />

        <!-- Hero Section -->
        <header class="relative pt-40 pb-32 md:pb-48 overflow-hidden bg-[#fafafa]">
            <!-- Subtle Grid -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
            </div>

            <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div @click="router.push('/gamelift')"
                    class="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#eaeded] text-xs font-bold text-[#ff9900] mb-8 hover:bg-[#fafafa] transition-colors cursor-pointer uppercase tracking-widest">
                    <span class="relative flex h-2 w-2">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9900] opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-[#ff9900]"></span>
                    </span>
                    v2.0: Now with Edge Computing
                </div>

                <h1 class="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-[#232f3e]">
                    The Unified <br />
                    <span class="text-[#ff9900]">Infrastructure Protocol</span>
                </h1>

                <p class="text-lg md:text-xl text-[#545b64] max-w-3xl mx-auto mb-12 leading-relaxed">
                    Build with the precision of code or the speed of our dashboard.
                    <span class="text-[#232f3e] font-bold">Serwin</span> unifies High-Performance Compute, Low-Latency
                    Gaming, and Infinite Storage into one atomic platform.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <button @click="handleGetStarted"
                        class="px-10 py-5 bg-[#ff9900] text-white text-base font-black hover:bg-[#ec7211] transition-all hover:scale-105 min-w-[220px] flex items-center justify-center gap-2 rounded-none">
                        Start Building Today <span class="text-xl">→</span>
                    </button>
                    <button @click="router.push('/docs')"
                        class="px-10 py-5 bg-white border-2 border-[#232f3e] text-[#232f3e] text-base font-bold hover:bg-[#232f3e] hover:text-white transition-all min-w-[220px] rounded-none">
                        Read Documentation
                    </button>
                </div>

                <!-- Quick Specs Bar -->
                <div class="max-w-4xl mx-auto mb-24 grid grid-cols-2 md:grid-cols-4 gap-4 border-y-2 border-[#232f3e]/10 py-6">
                    <div class="text-center">
                        <div class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Architecture</div>
                        <div class="text-sm font-black text-[#232f3e]">Hypervisor-Free</div>
                    </div>
                    <div class="text-center border-l border-[#232f3e]/10">
                        <div class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Provisioning</div>
                        <div class="text-sm font-black text-[#232f3e]">Atomic / Inst.</div>
                    </div>
                    <div class="text-center border-l border-[#232f3e]/10">
                        <div class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">Networking</div>
                        <div class="text-sm font-black text-[#232f3e]">P4 Mesh</div>
                    </div>
                    <div class="text-center border-l border-[#232f3e]/10">
                        <div class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-1">SLA</div>
                        <div class="text-sm font-black text-[#232f3e]">99.999% Dur.</div>
                    </div>
                </div>

                <!-- Hero Visual (Interactive Infrastructure Map) -->
                <div class="relative max-w-5xl mx-auto">
                    <!-- Flat Professional Card -->
                    <div
                        class="bg-white rounded-none border-2 border-[#232f3e] p-1 relative overflow-hidden group shadow-none">
                        <!-- Toolbar -->
                        <div class="bg-[#232f3e] px-4 py-3 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-red-500"></div>
                                <div class="w-3 h-3 bg-yellow-500"></div>
                                <div class="w-3 h-3 bg-green-500"></div>
                            </div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                cluster-us-east-1a • Connected</div>
                        </div>

                        <!-- Visualization Area -->
                        <div
                            class="h-[400px] md:h-[500px] bg-white relative overflow-hidden border-t-2 border-[#232f3e]">
                            <!-- Grid Overlay -->
                            <div class="absolute inset-0 bg-[size:20px_20px] opacity-[0.03]"
                                style="background-image: radial-gradient(#232f3e 1px, transparent 0)"></div>

                            <!-- Lines -->
                            <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
                                <path d="M150 250 C 250 250, 350 150, 500 150" stroke="#eaeded" stroke-width="4"
                                    fill="none" stroke-dasharray="12 6" />
                                <path d="M150 250 C 250 250, 350 350, 500 350" stroke="#eaeded" stroke-width="4"
                                    fill="none" stroke-dasharray="12 6" />
                                <path d="M500 150 L 700 150" stroke="#ff9900" stroke-width="4" fill="none"
                                    class="opacity-30 animate-pulse" />
                            </svg>

                            <!-- Node: Load Balancer -->
                            <div
                                class="absolute top-[210px] left-[50px] md:left-[100px] w-auto bg-white border-2 border-[#232f3e] p-4 flex items-center gap-4 z-10 hover:-translate-y-1 transition-transform cursor-pointer">
                                <div class="w-10 h-10 bg-indigo-600 flex items-center justify-center text-white">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div class="text-left">
                                    <div
                                        class="text-[10px] text-[#545b64] uppercase font-black tracking-widest leading-none mb-1">
                                        Ingress</div>
                                    <div class="text-base font-black text-[#232f3e]">GLOBAL_LB</div>
                                </div>
                            </div>

                            <!-- Node: Compute Cluster (Orange) -->
                            <div
                                class="absolute top-[110px] left-[450px] md:left-[550px] w-64 bg-white border-2 border-[#ff9900] p-5 flex items-center gap-4 z-10 hover:-translate-y-1 transition-transform cursor-pointer">
                                <div class="w-12 h-12 bg-[#ff9900] flex items-center justify-center text-white">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" />
                                    </svg>
                                </div>
                                <div class="flex-1 text-left">
                                    <div class="flex justify-between items-center mb-1">
                                        <div class="text-[10px] text-[#ff9900] font-black uppercase tracking-widest">
                                            Compute</div>
                                        <div class="w-2 h-2 bg-green-500"></div>
                                    </div>
                                    <div class="text-sm font-black text-[#232f3e]">H100_FLEET_01</div>
                                    <div class="w-full h-2 bg-gray-100 mt-2">
                                        <div class="h-full bg-[#ff9900] w-[80%]"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Node: Storage (Green) -->
                            <div
                                class="absolute top-[310px] left-[450px] md:left-[550px] w-56 bg-white border-2 border-[#eaeded] p-4 flex items-center gap-4 z-10 hover:-translate-y-1 transition-transform cursor-pointer group-hover:border-[#232f3e]">
                                <div class="w-10 h-10 bg-emerald-600 flex items-center justify-center text-white">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                </div>
                                <div class="text-left">
                                    <div
                                        class="text-[10px] text-[#545b64] uppercase font-black tracking-widest leading-none mb-1">
                                        Storage</div>
                                    <div class="text-base font-black text-[#232f3e]">DATA_LAKE_02</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Trusted By Section -->
        <section class="py-12 border-y border-[#eaeded] bg-white">
            <div class="max-w-7xl mx-auto px-6">
                <p class="text-center text-sm font-black tracking-[0.2em] text-[#545b64] uppercase mb-10">TRUSTED BY
                    GLOBAL TEAMS</p>
                <div
                    class="flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale opacity-40 contrast-200">
                    <div class="flex items-center gap-2 text-xl font-black italic">Skynet</div>
                    <div class="flex items-center gap-2 text-xl font-black italic">E-corp</div>
                    <div class="flex items-center gap-2 text-xl font-black italic">HAL 9000</div>
                    <div class="flex items-center gap-2 text-xl font-black italic">Vought International</div>
                </div>
            </div>
        </section>

        <!-- Use Cases / Services -->
        <section class="py-24 bg-white relative z-20">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="(useCase, i) in useCases" :key="i"
                        @click="!useCase.comingSoon && router.push(useCase.route)"
                        class="bg-white border-2 border-[#eaeded] p-8 transition-all relative overflow-hidden flex flex-col h-full"
                        :class="[
                            useCase.comingSoon ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'hover:border-[#ff9900] cursor-pointer group'
                        ]">

                        <!-- Coming Soon Badge -->
                        <div v-if="useCase.comingSoon"
                            class="absolute top-4 right-4 bg-[#ff9900] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
                            Coming Soon</div>

                        <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.15em] mb-4"
                            :class="!useCase.comingSoon ? 'group-hover:text-[#ff9900] transition-colors' : ''">
                            {{ useCase.title }}</div>
                        <div class="flex flex-col gap-4">
                            <span class="text-4xl transition-transform duration-300 w-fit"
                                :class="!useCase.comingSoon ? 'group-hover:scale-110' : ''">{{
                                    useCase.icon }}</span>
                            <h3 class="text-lg font-black text-[#232f3e] leading-tight">{{ useCase.action }}</h3>
                        </div>
                        <div v-if="!useCase.comingSoon" class="mt-auto pt-6 text-[#0073bb] font-bold text-sm">Learn more
                            ›</div>
                        <div v-else class="mt-auto pt-6 text-[#879196] font-bold text-sm italic">Feature in development
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- New Section: The Full Stack Protocol -->
        <section class="py-32 bg-[#232f3e] text-white overflow-hidden relative">
            <!-- Background Text Decoration -->
            <div class="absolute -bottom-20 -right-20 text-[20rem] font-black text-white/[0.03] select-none pointer-events-none uppercase">
                Oxide
            </div>
            
            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div class="text-[#ff9900] text-sm font-black uppercase tracking-[0.3em] mb-6">Lower Level, Higher Performance</div>
                        <h2 class="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                            The Cloud <br/>You Actually <span class="text-[#ff9900]">Own.</span>
                        </h2>
                        <p class="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
                            Traditional cloud runs on top of legacy layers. Serwin is built from the silicon up. 
                            We've removed the hypervisor overhead and licensing taxes to give you bare-metal performance with 
                            the elasticity of the public cloud.
                        </p>
                        
                        <div class="space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="w-1.5 h-1.5 bg-[#ff9900] mt-2.5"></div>
                                <div>
                                    <div class="font-black text-white uppercase tracking-wider mb-1">Zero Hypervisor Overhead</div>
                                    <p class="text-sm text-slate-400">Direct-to-metal execution for 99.9% resource efficiency.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-1.5 h-1.5 bg-[#ff9900] mt-2.5"></div>
                                <div>
                                    <div class="font-black text-white uppercase tracking-wider mb-1">Programmable Networking</div>
                                    <p class="text-sm text-slate-400">P4-driven mesh network with sub-millisecond inter-zone hop.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-1.5 h-1.5 bg-[#ff9900] mt-2.5"></div>
                                <div>
                                    <div class="font-black text-white uppercase tracking-wider mb-1">Predictable Economics</div>
                                    <p class="text-sm text-slate-400">Zero licensing fees. Pay for compute, not for permission.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="relative">
                        <!-- Technical Spec Card -->
                        <div class="bg-white p-1 border-2 border-[#ff9900]">
                            <div class="bg-[#fafafa] border border-[#eaeded] p-8">
                                <div class="flex justify-between items-center mb-12">
                                    <div class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">System_Manifest_v2.0</div>
                                    <div class="flex gap-2">
                                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <div class="text-[10px] font-black text-green-600 uppercase">Operational</div>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-y-10 gap-x-6">
                                    <div>
                                        <div class="text-[10px] text-[#879196] uppercase font-black mb-1">Throughput</div>
                                        <div class="text-3xl font-black text-[#232f3e]">1.2 TB/s</div>
                                    </div>
                                    <div>
                                        <div class="text-[10px] text-[#879196] uppercase font-black mb-1">Provision Time</div>
                                        <div class="text-3xl font-black text-[#232f3e]">&lt; 4s</div>
                                    </div>
                                    <div>
                                        <div class="text-[10px] text-[#879196] uppercase font-black mb-1">Security</div>
                                        <div class="text-3xl font-black text-[#232f3e]">E2EE</div>
                                    </div>
                                    <div>
                                        <div class="text-[10px] text-[#879196] uppercase font-black mb-1">Efficiency</div>
                                        <div class="text-3xl font-black text-[#ff9900]">94%</div>
                                    </div>
                                </div>
                                
                                <div class="mt-12 pt-8 border-t border-[#eaeded]">
                                    <div class="text-[10px] text-[#879196] uppercase font-black mb-4">Core Components</div>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-3 py-1 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest">Rust Hypervisor</span>
                                        <span class="px-3 py-1 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest">P4 Network</span>
                                        <span class="px-3 py-1 bg-[#232f3e] text-white text-[9px] font-black uppercase tracking-widest">gRPC API</span>
                                        <span class="px-3 py-1 bg-[#ff9900] text-white text-[9px] font-black uppercase tracking-widest">Custom Silicon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- New Section: Infrastructure as Data (Observability) -->
        <section class="py-32 bg-white">
            <div class="max-w-7xl mx-auto px-6">
                <div class="max-w-3xl mb-20">
                    <h2 class="text-4xl md:text-6xl font-black text-[#232f3e] mb-6 tracking-tight">
                        Infrastructure <br/>as <span class="text-[#ff9900]">Data.</span>
                    </h2>
                    <p class="text-[#545b64] text-lg">
                        Oxide-inspired observability gives you a single pane of glass into every watt consumed and every packet routed. 
                        No black boxes. No hidden throttles. Just pure, actionable telemetry.
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="p-8 border-2 border-[#232f3e] hover:shadow-[8px_8px_0px_0px_#ff9900] transition-all">
                        <div class="w-12 h-12 bg-[#232f3e] flex items-center justify-center text-[#ff9900] mb-8">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black mb-4 uppercase tracking-tight">Power Observability</h3>
                        <p class="text-sm text-[#545b64] leading-relaxed">
                            Monitor energy usage at the rack level. Optimize your workloads for sustainability and performance without the guesswork.
                        </p>
                    </div>

                    <div class="p-8 border-2 border-[#232f3e] hover:shadow-[8px_8px_0px_0px_#ff9900] transition-all">
                        <div class="w-12 h-12 bg-[#232f3e] flex items-center justify-center text-[#ff9900] mb-8">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black mb-4 uppercase tracking-tight">Real-time Telemetry</h3>
                        <p class="text-sm text-[#545b64] leading-relaxed">
                            High-fidelity metrics captured at microsecond intervals. Resolve issues before they impact your end users.
                        </p>
                    </div>

                    <div class="p-8 border-2 border-[#232f3e] hover:shadow-[8px_8px_0px_0px_#ff9900] transition-all">
                        <div class="w-12 h-12 bg-[#232f3e] flex items-center justify-center text-[#ff9900] mb-8">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09a10.116 10.116 0 001.283-3.562V10.701m.976-4.214a10.116 10.116 0 011.026 4.214V11m0 0V11m0 0v1.428m0 0a10.262 10.262 0 01-2.253 6.355m2.253-6.355a10.259 10.259 0 01-3.328 7.373m5.581-12.008a10.114 10.114 0 013.344 7.279v1.432a10.114 10.114 0 01-1.497 5.272m-1.847-12.702a10.202 10.202 0 012.33 5.43" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black mb-4 uppercase tracking-tight">Audit-Ready Security</h3>
                        <p class="text-sm text-[#545b64] leading-relaxed">
                            Full visibility into the control plane. Every API call, configuration change, and access event is logged and immutable.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Feature Deep Dives -->
        <section class="py-32 relative bg-[#fafafa]">
            <div class="max-w-7xl mx-auto px-6">
                <div class="mb-20">
                    <h2 class="text-4xl md:text-6xl font-black text-[#232f3e] mb-6 tracking-tight">Powering the
                        <br />Next Generation
                    </h2>
                    <div class="w-24 h-2 bg-[#ff9900]"></div>
                </div>

                <div class="grid md:grid-cols-3 border-2 border-[#232f3e] bg-white">
                    <div v-for="(feature, i) in features" :key="i" :class="[
                        'p-12 transition-all flex flex-col',
                        i !== features.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2 border-[#232f3e]' : '',
                        feature.comingSoon ? 'bg-[#fafafa]' : 'hover:bg-[#232f3e] group border-[#232f3e]'
                    ]">

                        <div v-if="feature.comingSoon" class="mb-4">
                            <span
                                class="bg-[#ff9900] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                Coming Soon
                            </span>
                        </div>

                        <h3 class="text-2xl font-black mb-4 tracking-tight transition-colors duration-300"
                            :class="feature.comingSoon ? 'text-[#879196]' : 'text-[#232f3e] group-hover:text-white'">
                            {{ feature.title }}
                        </h3>

                        <p class="text-sm font-medium leading-relaxed mb-8 transition-colors duration-300"
                            :class="feature.comingSoon ? 'text-[#879196] italic' : 'text-[#545b64] group-hover:text-slate-300'">
                            {{ feature.comingSoon ? 'This infrastructure component is currently being provisoned.' :
                                feature.desc }}
                        </p>

                        <button v-if="!feature.comingSoon" @click="router.push(feature.path)"
                            class="mt-auto text-sm font-black uppercase tracking-[0.2em] transition-colors duration-300 text-[#0073bb] group-hover:text-[#ff9900] text-left">
                            {{ feature.link }} →
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- New Section: Zero-Touch Operations -->
        <section class="py-32 bg-[#fafafa]">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-col md:flex-row gap-20 items-center">
                    <div class="flex-1">
                        <h2 class="text-4xl md:text-6xl font-black text-[#232f3e] mb-8 tracking-tighter">
                            No Assembly <br/><span class="text-[#ff9900]">Required.</span>
                        </h2>
                        <p class="text-[#545b64] text-lg leading-relaxed mb-10">
                            Stop managing licenses and start managing infrastructure. Serwin eliminates the 
                            operational friction of traditional hardware with a software-defined approach that 
                            just works.
                        </p>
                        
                        <div class="grid sm:grid-cols-2 gap-8">
                            <div>
                                <h4 class="font-black text-[#232f3e] uppercase text-sm mb-2">Instant IT transformation</h4>
                                <p class="text-xs text-[#879196]">Just add code and scale. Start new projects today, not next quarter.</p>
                            </div>
                            <div>
                                <h4 class="font-black text-[#232f3e] uppercase text-sm mb-2">No more license management</h4>
                                <p class="text-xs text-[#879196]">Focus on business goals, not renewals. Transparent pricing, always.</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 w-full bg-[#232f3e] p-10 text-white font-mono text-sm border-2 border-[#ff9900]">
                        <div class="flex items-center gap-2 mb-6">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span class="ml-2 text-[10px] text-slate-500">serwin init --cluster-scale 10k</span>
                        </div>
                        <div class="space-y-2">
                            <div class="text-green-400"># Initializing cluster...</div>
                            <div>[OK] Identity verified (sub: 0x6d617274696e)</div>
                            <div>[OK] VPC manifest applied (p4_mesh_v1)</div>
                            <div>[OK] Provisioning 10,000 cores...</div>
                            <div class="flex items-center gap-2">
                                <div class="w-full bg-slate-800 h-1">
                                    <div class="bg-[#ff9900] h-full w-[100%] animate-pulse"></div>
                                </div>
                            </div>
                            <div class="text-[#ff9900]">Deployment successful in 4.2s.</div>
                            <div class="text-indigo-400">Endpoint: https://api.serwin.io/v2/cluster-alpha</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-40 bg-[#0a0c10] text-white relative overflow-hidden">
            <!-- Professional Grid Texture -->
            <div class="absolute inset-0 bg-[size:40px_40px] opacity-[0.03] pointer-events-none"
                style="background-image: radial-gradient(circle, #fff 1px, transparent 1px)"></div>

            <!-- Orange Accent -->
            <div class="absolute top-0 left-0 w-full h-1 bg-[#ff9900]"></div>

            <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
                <!-- Social Proof Badge -->
                <div
                    class="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 mb-12 animate-fade-in">
                    <div class="flex -space-x-2">
                        <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#0a0c10]"></div>
                        <div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0a0c10]"></div>
                        <div class="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#0a0c10]"></div>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-[#ff9900]">Trusted by 2+
                        Teams😁</span>
                </div>

                <h2 class="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-none">
                    Build. Scale.<br />
                    <span class="text-[#ff9900]">Infinite.</span>
                </h2>

                <p class="text-slate-400 mb-16 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                    Join the global engineering network powerered by next-generation silicon and zero-latency
                    infrastructure.
                </p>

                <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button @click="handleGetStarted"
                        class="group relative px-12 py-6 bg-[#ff9900] text-white font-black transition-all hover:translate-y-[-4px] text-lg rounded-none uppercase tracking-widest overflow-hidden">
                        <span class="relative z-10">Get Started for Free</span>
                        <div
                            class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        </div>
                    </button>
                    <button
                        class="px-12 py-6 bg-transparent border-2 border-white/20 text-white font-black hover:border-white hover:bg-white/5 transition-all text-lg rounded-none uppercase tracking-widest">
                        Talk to Me 😁
                    </button>
                </div>

                <!-- Footer Stats -->
                <div class="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
                    <div>
                        <div class="text-3xl font-black text-white mb-1 tracking-tighter">67.999%</div>
                        <div class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Uptime SLA</div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-white mb-1 tracking-tighter">&lt; 180ms</div>
                        <div class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Latency
                        </div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-white mb-1 tracking-tighter">3</div>
                        <div class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Edge Regions</div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-[#ff9900] mb-1 tracking-tighter">∞</div>
                        <div class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Scalability</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-white py-12 border-t border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-[#ff9900] font-black italic">
                        S</div>
                    <span class="font-black text-xl text-[#232f3e]">SerwinSystems</span>
                </div>
                <div class="flex gap-10 text-xs font-bold text-[#879196] uppercase tracking-widest">
                    <router-link to="/privacy" class="hover:text-[#ff9900]">Privacy</router-link>
                    <router-link to="/legal" class="hover:text-[#ff9900]">Legal</router-link>
                    <router-link to="/support" class="hover:text-[#ff9900]">Support</router-link>
                </div>
                <div class="text-[10px] text-[#879196] font-bold">© 2026 SERWIN SYSTEMS INC.</div>
            </div>
        </footer>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

@keyframes scan {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.animate-scan {
    animation: scan 3s linear infinite;
}

.perspective-1000 {
    perspective: 1000px;
}

/* Custom weight classes for Urbanist */
.font-black {
    font-weight: 900;
}
</style>
