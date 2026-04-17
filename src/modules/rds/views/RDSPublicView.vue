<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()
</script>

<template>
    <div
        class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900 overflow-x-hidden">

        <!-- Navigation -->
        <PublicNavbar activeLink="database" />

        <div class="relative bg-[#fafafa]">
            <!-- Structural Grid Background -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
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
                        <div class="inline-flex items-center gap-3 mb-10 text-amber-600">
                            <div class="w-12 h-[2px] bg-amber-600"></div>
                            <span class="text-[10px] font-black uppercase tracking-[0.3em]">Managed Relational
                                Systems</span>
                        </div>

                        <h1
                            class="text-6xl md:text-9xl font-black text-[#232f3e] tracking-tighter mb-10 leading-[0.95] uppercase">
                            Atomic ACID.<br>
                            <span class="text-amber-600 italic">Global Scale.</span>
                        </h1>

                        <p class="text-xl md:text-2xl text-[#545b64] leading-relaxed max-w-2xl mb-16 font-medium">
                            Engineered for <strong class="text-[#232f3e] font-black">mission-critical
                                workloads</strong>.
                            Serwin RDS unifies high-performance engines with automated scaling and zero-downtime
                            persistence.
                        </p>

                        <div class="flex flex-wrap gap-6">
                            <button @click="router.push('/register')"
                                class="bg-amber-600 hover:bg-amber-700 text-white font-black px-12 py-6 transition-all rounded-none uppercase tracking-widest text-sm shadow-[8px_8px_0px_#232f3e] active:shadow-none active:translate-x-1 active:translate-y-1">
                                Provision DB Cluster
                            </button>
                            <button @click="router.push('/docs/content/rds-overview')"
                                class="px-12 py-6 border-2 border-[#232f3e] text-[#232f3e] font-black hover:bg-[#232f3e] hover:text-white transition-all rounded-none uppercase tracking-widest text-sm">
                                Read Protocol &rarr;
                            </button>
                        </div>
                    </div>

                    <!-- Right Visual (Structural Grid Details) -->
                    <div class="lg:col-span-2 hidden lg:block relative">
                        <!-- Cluster Nodes Visualization -->
                        <div class="grid grid-cols-4 gap-4 opacity-40">
                            <div v-for="i in 16" :key="i"
                                class="aspect-square border-2 border-[#eaeded] bg-white flex items-center justify-center group hover:bg-amber-50 hover:border-amber-200 transition-all duration-500">
                                <div
                                    class="w-2 h-2 bg-[#eaeded] group-hover:bg-amber-500 group-hover:scale-150 transition-all">
                                </div>
                            </div>
                        </div>

                        <!-- Floating Data Label -->
                        <div
                            class="absolute -top-10 -left-10 bg-white border-2 border-[#232f3e] p-6 shadow-none max-w-[200px]">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                <span class="text-[9px] font-black uppercase tracking-widest text-[#545b64]">Status:
                                    SYNCED</span>
                            </div>
                            <div class="text-2xl font-black text-[#232f3e] tracking-tighter mb-1">0.1ms</div>
                            <div class="text-[9px] font-bold text-[#879196] uppercase">Commit Latency</div>
                        </div>

                        <!-- Secondary Widget -->
                        <div class="absolute -bottom-10 -right-5 bg-[#232f3e] p-6 text-white max-w-[250px]">
                            <div class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-amber-400">
                                Persistence: Immutable</div>
                            <div class="space-y-3">
                                <div v-for="j in 3" :key="j" class="h-1.5 w-full bg-white/10 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 h-full bg-amber-500 animate-scan"
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
                            class="w-10 h-10 border-2 border-amber-600 flex items-center justify-center text-amber-600 mb-10 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Multi-Node Consenus
                        </h3>
                        <p class="text-sm text-[#545b64] font-bold leading-relaxed">Global clusters with Raft-based
                            sync,
                            automatic failover, and hardware-accelerated transaction processing.</p>
                    </div>

                    <div
                        class="p-12 border-r-2 border-b-2 md:border-b-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors group">
                        <div
                            class="w-10 h-10 border-2 border-amber-600 flex items-center justify-center text-amber-600 mb-10 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Point-in-Time
                            Recovery
                        </h3>
                        <p class="text-sm text-[#545b64] font-bold leading-relaxed">Continuous log-stream backups allow
                            you to restore your database to any millisecond within your retention window.</p>
                    </div>

                    <div class="p-12 hover:bg-[#fafafa] transition-colors group">
                        <div
                            class="w-10 h-10 border-2 border-amber-600 flex items-center justify-center text-amber-600 mb-10 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#232f3e] mb-5 uppercase tracking-tight">Encrypted at Rest
                        </h3>
                        <p class="text-sm text-[#545b64] font-bold leading-relaxed">AES-256 hardware-level encryption
                            integrated with Serwin Root Trust for complete data sovereignty.</p>
                    </div>
                </div>

                <!-- Stats Section -->
                <div class="mt-40 pt-20 border-t-2 border-[#232f3e]">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">99.99<span
                                    class="text-amber-600 italic">%</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Uptime SLA
                            </div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">15<span
                                    class="text-amber-600 italic">TB</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Max Instance
                                Size
                            </div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">64<span
                                    class="text-amber-600 italic">VCPU</span></div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Compute
                                Ceiling</div>
                        </div>
                        <div>
                            <div class="text-5xl md:text-7xl font-black text-[#232f3e] tracking-tighter mb-4">RDS</div>
                            <div class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em]">Managed Logic
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Promotion Section -->
            <section class="py-32 bg-[#232f3e] text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-1/2 h-full bg-amber-600/5 -skew-x-12 translate-x-20"></div>

                <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h2 class="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.9]">
                        Ready to scale your<br>
                        <span class="text-amber-400 italic">Data Layer?</span>
                    </h2>
                    <p class="text-xl text-slate-300 leading-relaxed mb-12 font-medium max-w-2xl mx-auto">
                        Join thousands of developers building on the most reliable relational protocol in the global
                        grid.
                    </p>
                    <button @click="router.push('/register')"
                        class="bg-amber-600 hover:bg-amber-500 text-white font-black px-12 py-6 transition-all rounded-none uppercase tracking-widest text-sm shadow-[8px_8px_0px_white] active:shadow-none active:translate-x-1 active:translate-y-1">
                        Get Started for Free &rarr;
                    </button>
                </div>
            </section>
        </div>

        <footer class="py-20 bg-white border-t border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S
                    </div>
                    <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinRDS</span>
                </div>
                <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
                    <a href="#" class="hover:text-amber-600">Privacy</a>
                    <a href="#" class="hover:text-amber-600">Compliance</a>
                    <a href="#" class="hover:text-amber-600">SLA</a>
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
