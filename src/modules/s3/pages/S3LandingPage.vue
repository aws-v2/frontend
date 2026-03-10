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
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">

        <!-- Navigation -->
        <PublicNavbar activeLink="storage" />

        <div class="relative bg-white">
            <!-- Structural Grid Background (Subtle) -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none">
            </div>

            <!-- Diagonal Accent (Themed) -->
            <div
                class="absolute top-0 right-0 w-1/3 h-full bg-white transform skew-x-[-15deg] translate-x-32 hidden lg:block border-l-2 border-[#eaeded]">
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">
                <!-- Hero Layout -->
                <div class="grid lg:grid-cols-5 gap-16 items-center">
                    <!-- Left Content -->
                    <div class="lg:col-span-3">
                        <div class="inline-flex items-center gap-3 mb-10 text-[#232f3e]">
                            <div class="w-12 h-[1px] bg-[#ff9900]"></div>
                            <span class="text-[10px] font-black uppercase tracking-[0.4em]">Unified Storage
                                Protocol_v2.0</span>
                        </div>

                        <h1
                            class="text-6xl md:text-9xl font-black text-[#232f3e] tracking-tighter mb-10 leading-[0.95] uppercase">
                            Absolute Scale.<br>
                            <span class="text-[#ff9900] italic">Atomic Durability.</span>
                        </h1>

                        <p class="text-xl md:text-2xl text-[#545b64] leading-relaxed max-w-2xl mb-16 font-medium">
                            Engineered for <strong class="text-[#232f3e] font-black uppercase">99.999999999%
                                durability</strong>.
                            Serwin Hyper-Storage unifies global object distribution with sub-millisecond retrieval
                            fabrics.
                        </p>

                        <div class="flex flex-wrap gap-6 mb-20">
                            <button @click="router.push('/register')"
                                class="bg-[#232f3e] text-white font-black px-12 py-6 transition-all rounded-none uppercase tracking-[0.2em] text-xs hover:bg-[#ff9900] shadow-[8px_8px_0px_#eaeded] active:translate-y-1 active:shadow-none">
                                Provision Cluster &rarr;
                            </button>
                            <button @click="router.push('/docs/content/s3-overview')"
                                class="px-12 py-6 border-2 border-[#232f3e] text-[#232f3e] font-black hover:bg-[#fafafa] transition-all rounded-none uppercase tracking-[0.2em] text-xs">
                                View Specification
                            </button>
                        </div>

                        <!-- Quick Storage Specs Bar -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-[#eaeded]">
                            <div>
                                <div class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2">
                                    IO_CONSISTENCY</div>
                                <div class="text-2xl font-black text-[#232f3e] tracking-tighter">Strong</div>
                            </div>
                            <div>
                                <div class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2">
                                    REPLICATION</div>
                                <div class="text-2xl font-black text-[#232f3e] tracking-tighter">Multi-Zone</div>
                            </div>
                            <div>
                                <div class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2">
                                    ENCRYPTION</div>
                                <div class="text-2xl font-black text-[#232f3e] tracking-tighter">AES-256-GCM</div>
                            </div>
                            <div>
                                <div class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2">EGRESS
                                </div>
                                <div class="text-2xl font-black text-[#ff9900] tracking-tighter">Zero-Tax</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Visual (Structural Grid Details) -->
                    <div class="lg:col-span-2 hidden lg:block relative">
                        <!-- Cluster Nodes Visualization -->
                        <div class="grid grid-cols-4 gap-4 opacity-40">
                            <div v-for="i in 16" :key="i"
                                class="aspect-square border-2 border-[#eaeded] bg-white flex items-center justify-center group hover:bg-[#fafafa] hover:border-[#ff9900] transition-all duration-500">
                                <div
                                    class="w-2 h-2 bg-[#eaeded] group-hover:bg-[#ff9900] group-hover:scale-150 transition-all">
                                </div>
                            </div>
                        </div>

                        <!-- Floating Data Label -->
                        <div
                            class="absolute -top-10 -left-10 bg-white border-2 border-[#232f3e] p-6 shadow-none max-w-[200px]">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-[#ff9900] animate-pulse"></div>
                                <span class="text-[9px] font-black uppercase tracking-widest text-[#545b64]">Region:
                                    GLB-STRATE-1</span>
                            </div>
                            <div class="text-2xl font-black text-[#232f3e] tracking-tighter mb-1">4.8 EB</div>
                            <div class="text-[9px] font-bold text-[#879196] uppercase">Network Capacity</div>
                        </div>

                        <!-- Secondary Widget -->
                        <div class="absolute -bottom-10 -right-5 bg-[#232f3e] p-6 text-white max-w-[250px]">
                            <div class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[#ff9900]">
                                Integrity: Erasure.Coding</div>
                            <div class="space-y-3">
                                <div v-for="j in 3" :key="j" class="h-1.5 w-full bg-white/10 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 h-full bg-[#ff9900] animate-scan"
                                        :style="{ animationDelay: j * 0.5 + 's' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Feature Grid - High-Meat Technical Callouts -->
                <div class="grid md:grid-cols-3 gap-0 mt-40 border-2 border-[#232f3e] bg-white">
                    <div
                        class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors group">
                        <div
                            class="w-12 h-12 bg-[#232f3e] text-[#ff9900] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tighter">Hyperscale
                            Persistence
                        </h3>
                        <p class="text-xs text-[#879196] font-bold uppercase tracking-widest leading-6">Distributed
                            object fabrics utilizing 6+3 erasure coding across independent power domains for maximum
                            safety.</p>
                    </div>

                    <div
                        class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors group">
                        <div
                            class="w-12 h-12 bg-[#232f3e] text-[#ff9900] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tighter">Global Mesh API
                        </h3>
                        <p class="text-xs text-[#879196] font-bold uppercase tracking-widest leading-6">S3-compatible
                            REST protocol with integrated layer-7 caching and parallel multi-part upload optimizations.
                        </p>
                    </div>

                    <div class="p-12 hover:bg-[#fafafa] transition-colors group">
                        <div
                            class="w-12 h-12 bg-[#232f3e] text-[#ff9900] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tighter">Silicon-Root
                            Locking
                        </h3>
                        <p class="text-xs text-[#879196] font-bold uppercase tracking-widest leading-6">Hardware-level
                            IAM enforcement. Every access request is validated against a root-of-trust silicon key.</p>
                    </div>
                </div>

                <!-- Expanded Stats Section -->
                <div class="mt-40 pt-20 border-t-2 border-[#232f3e]">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">11<span
                                    class="text-[#ff9900] italic">NINES</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Durability
                                Matrix</div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">&inf;
                            </div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Volume Limit
                            </div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">50<span
                                    class="text-[#ff9900] italic">Gbps</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Internal
                                Fabric</div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">GLB</div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Data Plane
                            </div>
                        </div>
                    </div>
                </div>

                <!-- New Content: The Storage Kernel -->
                <div class="mt-40 grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 class="text-4xl font-black text-[#232f3e] uppercase tracking-tighter mb-8 italic">The
                            Storage <br />Kernel Manifest.</h2>
                        <p class="text-[#545b64] font-medium leading-relaxed mb-10">
                            Our storage protocol isn't just a wrapper. It's a custom-built distributed system written in
                            Rust,
                            designed to bypass the Linux kernel for critical IO paths. We treat storage as a
                            deterministic data plane.
                        </p>
                        <div class="space-y-6">
                            <div v-for="spec in [
                                { label: 'Metadata Sync', value: 'Atomic / Zero-Lock' },
                                { label: 'Checksum Validation', value: 'Inline / Hardware-Acc' },
                                { label: 'Tiering Latency', value: 'Sub-Microsecond' }
                            ]" :key="spec.label" class="flex justify-between border-b border-[#eaeded] pb-4">
                                <span class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest">{{
                                    spec.label }}</span>
                                <span class="text-xs font-black text-[#ff9900] uppercase">{{ spec.value }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-[#232f3e] p-12 text-white border-2 border-[#ff9900]">
                        <h3 class="text-xl font-black uppercase tracking-tighter mb-6 text-[#ff9900]">
                            Migration_Bridge.v2</h3>
                        <p class="text-sm text-slate-400 mb-10 leading-relaxed font-bold uppercase tracking-widest">
                            Zero-copy streaming from legacy providers. Native AWS S3 and GCP Storage compatibility layer
                            for transparent transitions.
                        </p>
                        <div class="grid grid-cols-2 gap-8">
                            <div>
                                <div class="text-2xl font-black">1.8 TB/s</div>
                                <div class="text-[9px] font-black text-slate-500 uppercase mt-2">Max Bridge Transit
                                </div>
                            </div>
                            <div>
                                <div class="text-2xl font-black">&lt; 0.1%</div>
                                <div class="text-[9px] font-black text-slate-500 uppercase mt-2">Transit Overhead</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="py-20 bg-white border-t-2 border-[#232f3e]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinStorage</span>
                </div>
                <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
                    <a href="#" class="hover:text-[#ff9900] transition-colors">Infrastructure_Manifest</a>
                    <a href="#" class="hover:text-[#ff9900] transition-colors">Data_Integrity</a>
                    <a href="#" class="hover:text-[#ff9900] transition-colors">SLA_Policy</a>
                </div>
                <div class="text-[10px] text-[#879196] font-black uppercase tracking-widest italic">© 2026 SERWIN
                    INFRASTRUCTURE
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
