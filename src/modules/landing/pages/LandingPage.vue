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
    { title: 'Compute', action: 'Deploy VMs in seconds', icon: '⚡', route: '/compute', comingSoon: true },
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
        gradient: 'bg-indigo-600/5',
        comingSoon: true
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

                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                    <button @click="handleGetStarted"
                        class="px-10 py-5 bg-[#ff9900] text-white text-base font-black hover:bg-[#ec7211] transition-all hover:scale-105 min-w-[220px] flex items-center justify-center gap-2 rounded-none">
                        Start Building Today <span class="text-xl">→</span>
                    </button>
                    <button @click="router.push('/docs')"
                        class="px-10 py-5 bg-white border-2 border-[#232f3e] text-[#232f3e] text-base font-bold hover:bg-[#232f3e] hover:text-white transition-all min-w-[220px] rounded-none">
                        Read Documentation
                    </button>
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
