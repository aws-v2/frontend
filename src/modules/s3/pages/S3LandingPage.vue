<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { onMounted } from 'vue'

const router = useRouter()
const s3Store = useS3Store()

onMounted(async () => {
    await s3Store.fetchBuckets()
    if (s3Store.buckets.length > 0) {
        router.push('/s3/buckets')
    }
})
</script>

<template>
    <div
        class="min-h-screen bg-black text-white font-mono selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        <!-- Technical Grid Background -->
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20 technical-grid"></div>

        <div class="relative z-10">
            <!-- Hero Section: Storage Portfolio -->
            <header class="max-w-7xl mx-auto px-10 pt-40 pb-24 border-x border-white/5">
                <div class="flex flex-col lg:flex-row gap-24 items-start">
                    <div class="flex-1">
                        <div class="inline-flex items-center gap-4 mb-12">
                            <span class="w-1 h-8 bg-emerald-500"></span>
                            <span class="text-[10px] font-bold uppercase tracking-[0.5em] text-emerald-500/60">Unified
                                Storage Protocol</span>
                        </div>
                        <h1
                            class="text-7xl md:text-9xl font-black text-white mb-12 leading-[0.8] tracking-[0.02em] uppercase italic">
                            Serwin.<span class="text-emerald-500">S3</span>
                        </h1>
                        <p
                            class="text-xl text-white/40 font-bold max-w-2xl leading-relaxed mb-16 uppercase tracking-widest">
                            Immutable asset buffers. Engineered for 11 nines of durability with absolute zero-latency
                            retrieval targets.
                        </p>
                        <div class="flex flex-wrap gap-8 items-center">
                            <router-link to="/s3/create-bucket"
                                class="px-12 py-5 bg-white text-black font-black text-xs hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-[0.2em] active:scale-95">
                                Initialize Object Pool
                            </router-link>
                            <router-link to="/rds/create"
                                class="px-12 py-5 border border-white/10 text-white font-black text-xs hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em] active:scale-95">
                                Provision DB Cluster
                            </router-link>
                        </div>
                    </div>

                    <!-- Bento Stats: Storage Ecosystem -->
                    <div
                        class="w-full lg:w-[480px] grid grid-cols-2 gap-px bg-white/5 border border-white/5 shadow-2xl">
                        <div
                            class="col-span-2 p-12 bg-black flex flex-col justify-between aspect-video relative overflow-hidden group">
                            <div
                                class="absolute top-0 right-0 w-32 h-[2px] bg-emerald-500 group-hover:w-full transition-all duration-700">
                            </div>
                            <div class="flex justify-between items-start">
                                <span
                                    class="text-5xl font-black italic tracking-tighter uppercase text-emerald-500">99.99%</span>
                                <svg class="w-8 h-8 text-white/20" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-width="2.5"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">
                                    Integrity_Metric</p>
                                <p
                                    class="text-[11px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">
                                    Multi-AZ automated failover with synchronous nodal replication.</p>
                            </div>
                        </div>
                        <div class="p-10 bg-black flex flex-col justify-center gap-4 group">
                            <span
                                class="text-3xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">UNLIMITED</span>
                            <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Scalar
                                Limit</span>
                        </div>
                        <div class="p-10 bg-[#050505] border-l border-white/5 flex flex-col justify-center gap-4 group">
                            <span
                                class="text-3xl font-black text-emerald-700 tracking-tighter italic group-hover:text-emerald-500 transition-colors">LOW_MS</span>
                            <span
                                class="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">PROVISIONED_IOPS</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Storage Architecture Options -->
            <section class="max-w-7xl mx-auto px-10 py-40 border-x border-white/5 bg-[#050505] relative">
                <div class="grid lg:grid-cols-2 gap-32">
                    <!-- Object Storage Section -->
                    <div class="space-y-16">
                        <div class="flex items-center gap-6">
                            <h2 class="text-3xl font-black text-white uppercase tracking-tight">S3 Object Hub</h2>
                            <div class="flex-1 h-px bg-emerald-500/20"></div>
                            <div class="w-2 h-2 bg-emerald-500 rotate-45"></div>
                        </div>
                        <p class="text-lg text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                            Managed data lakes. Engineered for 11 nines of durability with global edge caching protocol.
                        </p>
                        <div class="grid gap-px bg-white/5 border border-white/5">
                            <div v-for="feat in ['Quantum_Encryption', 'Nodal_Versioning', 'Life-cycle_Logic']"
                                :key="feat"
                                class="p-8 bg-black flex items-center justify-between group hover:bg-white transition-all cursor-crosshair">
                                <span
                                    class="text-xs font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-black">{{
                                    feat }}</span>
                                <div class="w-1.5 h-1.5 bg-emerald-500 group-hover:scale-[2] transition-transform">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Relational Storage Section -->
                    <div class="space-y-16">
                        <div class="flex items-center gap-6">
                            <h2 class="text-3xl font-black text-white uppercase tracking-tight">RDS Relational</h2>
                            <div class="flex-1 h-px bg-white/10"></div>
                            <div class="w-2 h-2 bg-white rotate-45"></div>
                        </div>
                        <p class="text-lg text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                            High-concurrency SQL engines. Automated patching and BACKUP orchestration for atomic state.
                        </p>
                        <div class="grid gap-px bg-white/5 border border-white/5">
                            <div v-for="feat in ['Postgres_Engines', 'Replica_Scaling', 'Transparent_Shield']"
                                :key="feat"
                                class="p-8 bg-black flex items-center justify-between group hover:bg-white transition-all cursor-crosshair">
                                <span
                                    class="text-xs font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-black">{{
                                    feat }}</span>
                                <div
                                    class="w-1.5 h-1.5 bg-white group-hover:bg-black group-hover:scale-[2] transition-transform">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Bottom Tactical Area -->
            <footer class="max-w-7xl mx-auto px-10 py-32 border-x border-white/5 bg-black">
                <div
                    class="bg-white p-20 text-black flex flex-col lg:flex-row justify-between items-center gap-16 relative overflow-hidden group">
                    <div
                        class="absolute inset-0 z-0 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                        <div class="w-full h-full"
                            style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%); background-size: 10px 10px;">
                        </div>
                    </div>
                    <div class="max-w-xl relative z-10">
                        <h3 class="text-6xl font-black uppercase tracking-tighter mb-8 leading-none italic">
                            Scale_Protocol_Alpha</h3>
                        <p class="text-xs font-black uppercase tracking-[0.4em] opacity-40">Operational Readiness: 100%
                            // Latency: Nominal</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-px bg-black border border-black relative z-10 shadow-2xl">
                        <router-link to="/s3/create-bucket"
                            class="px-12 py-8 bg-white hover:bg-emerald-500 transition-colors text-xs font-black uppercase tracking-[0.4em] border-r border-black">Initialize
                            S3</router-link>
                        <router-link to="/rds/databases"
                            class="px-12 py-8 bg-gray-100 hover:bg-black hover:text-white transition-colors text-xs font-black uppercase tracking-[0.4em]">RDS
                            Command</router-link>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>
