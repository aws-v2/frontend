<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { onMounted } from 'vue'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const s3Store = useS3Store()
const authStore = useAuthStore()

onMounted(() => {
    // Redirect logic removed to prevent navigation flicker
    // Navigation is now handled by the Navbar 'Smart Click' logic
})
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-emerald-500/20 selection:text-emerald-900 overflow-x-hidden">

        <!-- Navigation -->
        <PublicNavbar activeLink="storage" />

        <div class="relative bg-[#fafafa]">
            <!-- Structural Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
            </div>

            <!-- Diagonal Accent -->
            <div
                class="absolute top-0 right-0 w-1/3 h-full bg-white transform skew-x-[-15deg] translate-x-32 hidden lg:block border-l-2 border-[#eaeded]">
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">
                <!-- Hero Layout -->
                <div class="grid lg:grid-cols-5 gap-16 items-center">
                    <!-- Left Content -->
                    <div class="lg:col-span-3">
                        <div class="inline-flex items-center gap-3 mb-10 text-emerald-600">
                            <div class="w-12 h-[2px] bg-emerald-600"></div>
                            <span class="text-[10px] font-black uppercase tracking-[0.3em]">Unified Storage
                                Protocol</span>
                        </div>

                        <h1
                            class="text-6xl md:text-9xl font-black text-[#232f3e] tracking-tighter mb-10 leading-[0.95] uppercase">
                            Infinite Scale.<br>
                            <span class="text-emerald-600 italic">Atomic Speed.</span>
                        </h1>

                        <p class="text-xl md:text-2xl text-[#545b64] leading-relaxed max-w-2xl mb-16 font-medium">
                            Engineered for <strong class="text-[#232f3e] font-black">99.999999999% durability</strong>.
                            Serwin Hyper-Storage unifies global object distribution with sub-millisecond data retrieval.
                        </p>

                        <div class="flex flex-wrap gap-6">
                            <button @click="router.push('/register')"
                                class="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 py-6 transition-all rounded-none uppercase tracking-widest text-sm">
                                Provision Cluster
                            </button>
                            <button @click="router.push('/docs/content/s3-overview')"
                                class="px-12 py-6 border-2 border-[#232f3e] text-[#232f3e] font-black hover:bg-[#232f3e] hover:text-white transition-all rounded-none uppercase tracking-widest text-sm">
                                Read Spec &rarr;
                            </button>
                        </div>
                    </div>

                    <!-- Right Visual (Structural Grid Details) -->
                    <div class="lg:col-span-2 hidden lg:block relative">
                        <!-- Cluster Nodes Visualization -->
                        <div class="grid grid-cols-4 gap-4 opacity-40">
                            <div v-for="i in 16" :key="i"
                                class="aspect-square border-2 border-[#eaeded] bg-white flex items-center justify-center group hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-500">
                                <div
                                    class="w-2 h-2 bg-[#eaeded] group-hover:bg-emerald-500 group-hover:scale-150 transition-all">
                                </div>
                            </div>
                        </div>

                        <!-- Floating Data Label -->
                        <div
                            class="absolute -top-10 -left-10 bg-white border-2 border-[#232f3e] p-6 shadow-none max-w-[200px]">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span class="text-[9px] font-black uppercase tracking-widest text-[#545b64]">Region:
                                    US-EAST-1</span>
                            </div>
                            <div class="text-2xl font-black text-[#232f3e] tracking-tighter mb-1">1.2 PB</div>
                            <div class="text-[9px] font-bold text-[#879196] uppercase">Active Throughput</div>
                        </div>

                        <!-- Secondary Widget -->
                        <div class="absolute -bottom-10 -right-5 bg-[#232f3e] p-6 text-white max-w-[250px]">
                            <div class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">
                                Security: Root Trust</div>
                            <div class="space-y-3">
                                <div v-for="j in 3" :key="j" class="h-1.5 w-full bg-white/10 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 h-full bg-emerald-500 animate-scan"
                                        :style="{ animationDelay: j * 0.5 + 's' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Feature Grid - Flat & Sharp -->
                <div class="grid md:grid-cols-3 gap-0 mt-40 border-2 border-[#232f3e] bg-white">
                    <div
                        class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors group">
                        <div
                            class="w-10 h-10 border-2 border-emerald-600 flex items-center justify-center text-emerald-600 mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Hyper Object Storage
                        </h3>
                        <p class="text-sm text-[#545b64] font-bold leading-relaxed">Scalable buckets with intelligent
                            tiering, hardware-level encryption, and instant global replication.</p>
                    </div>

                    <div
                        class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] opacity-60 grayscale-[0.5] transition-colors relative group">
                        <!-- Coming Soon Badge -->
                        Distributed relational engi
                        <div
                            class="w-10 h-10 border-2 border-emerald-600 flex items-center justify-center text-emerald-600 mb-10">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Mesh Database (RDS)
                        </h3>
                        <p class="text-sm text-[#545b64] font-bold leading-relaxed">Distributed relational engines with
                            auto-vectorization, cold-storage offloading, and zero-downtime patching.</p>
                    </div>

                    <div class="p-12 transition-colors opacity-60 grayscale-[0.5] relative group">
                        <!-- Coming Soon Badge -->
                        <div
                            class="absolute top-4 right-4 bg-[#ff9900] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
                            Coming Soon</div>
                        <div
                            class="w-10 h-10 border-2 border-emerald-600 flex items-center justify-center text-emerald-600 mb-10">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Quantum Persistence
                        </h3>
                        <p class="text-sm text-[#545b64] font-bold leading-relaxed">Integrated IAM-locking with
                            hardware-root-of-trust validation for every atomic storage operation.</p>
                    </div>
                </div>

                <!-- Stats Section -->
                <div class="mt-40 pt-20 border-t-2 border-[#232f3e]">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">11<span
                                    class="text-emerald-600 italic">X9S</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Durability
                                Matrix</div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">&infin;
                            </div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Vertical Scale
                            </div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">3<span
                                    class="text-emerald-600 italic">MS</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">L1 Edge
                                Latency</div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">GLB</div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Global Grid
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Migration Section - Deep Contrast -->
            <section class="py-32 bg-[#232f3e] text-white relative overflow-hidden">

                <!-- Decorative Elements -->
                <div class="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/5 -skew-x-12 translate-x-20"></div>
                <div
                    class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent">
                </div>

                <div class="max-w-7xl mx-auto px-6 relative z-10">
                    <div class="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div class="inline-flex items-center gap-3 mb-8 text-emerald-400">
                                <div class="w-12 h-[2px] bg-emerald-400"></div>
                                <span class="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Bridge</span>
                                <div
                                    class="px-2 py-0.5 bg-[#ff9900] text-[#232f3e] text-[8px] font-black uppercase tracking-widest ml-4">
                                    Coming Soon
                                </div>
                            </div>

                            <h2 class="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.9]">
                                Global<br>
                                <span class="text-emerald-400 italic">Migration</span> Bridge
                            </h2>

                            <p class="text-xl text-slate-300 leading-relaxed mb-12 font-medium">
                                Seamlessly transition your infrastructure. Our high-speed bridge supports
                                <strong class="text-white">zero-downtime migrations</strong> from AWS S3, Google Cloud
                                Storage, and Azure Blobs.
                            </p>

                            <div class="grid sm:grid-cols-2 gap-8 mb-12">
                                <div class="space-y-4">
                                    <h4 class="text-sm font-black uppercase tracking-widest text-emerald-400">
                                        S3-Compatible API</h4>
                                    <p class="text-xs text-slate-400 font-bold leading-relaxed">
                                        No code changes required. Point your existing SDKs to our global endpoint and
                                        begin streaming.
                                    </p>
                                </div>
                                <div class="space-y-4">
                                    <h4 class="text-sm font-black uppercase tracking-widest text-emerald-400">
                                        Integrity Guard</h4>
                                    <p class="text-xs text-slate-400 font-bold leading-relaxed">
                                        Automated byte-level checksum validation ensures 100% data fidelity during
                                        cross-provider transit.
                                    </p>
                                </div>
                            </div>

                            <button @click="router.push('/register')"
                                class="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-5 transition-all rounded-none uppercase tracking-widest text-xs">
                                Init Migration Layer &rarr;
                            </button>
                        </div>

                        <!-- Visual Representation -->
                        <div class="relative">
                            <div class="bg-white/5 border-2 border-white/10 p-10 backdrop-blur-sm">
                                <div class="flex justify-between items-center mb-10">
                                    <div class="flex gap-2">
                                        <div class="w-3 h-3 bg-red-500 opacity-50"></div>
                                        <div class="w-3 h-3 bg-yellow-500 opacity-50"></div>
                                        <div class="w-3 h-3 bg-green-500 opacity-50"></div>
                                    </div>
                                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        Migration_Log_02.26</div>
                                </div>

                                <div class="space-y-6">
                                    <div v-for="provider in ['AWS-US-EAST-1', 'GCP-EUROPE-WEST1', 'AZURE-SOUTH-ASIA']"
                                        :key="provider" class="space-y-2">
                                        <div class="flex justify-between text-[10px] font-black uppercase">
                                            <span>{{ provider }}</span>
                                            <span class="text-emerald-400">Syncing...</span>
                                        </div>
                                        <div class="h-1 w-full bg-white/5 relative overflow-hidden">
                                            <div
                                                class="absolute top-0 left-0 h-full bg-emerald-500 animate-pulse w-[75%]">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-12 pt-10 border-t border-white/10">
                                    <div class="flex items-center gap-6">
                                        <div class="text-4xl font-black text-emerald-400">1.2 GB/s</div>
                                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            Parallel Peak<br>Throughput</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <footer class="py-20 bg-white border-t border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinStorage</span>
                </div>
                <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
                    <a href="#" class="hover:text-emerald-600">Privacy</a>
                    <a href="#" class="hover:text-emerald-600">Compliance</a>
                    <a href="#" class="hover:text-emerald-600">SLA</a>
                </div>
                <div class="text-[10px] text-[#879196] font-black uppercase tracking-widest">© 2026 SERWIN SYSTEMS INC.
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

.font-black {
    font-weight: 900;
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
    width: 30%;
    animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
