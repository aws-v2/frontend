<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { onMounted } from 'vue'

const router = useRouter()
const s3Store = useS3Store()

// Removed auto-redirect to allow users to see the landing page as requested using the new theme.
</script>

<template>
    <div class="min-h-screen relative overflow-hidden bg-[#05080F]">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-[10%] right-[10%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[120px] opacity-20"></div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
            <!-- Header -->
            <div class="max-w-3xl mb-20">
                <div class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Unified Storage Layer
                </div>
                <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-8">
                    Infinite Scale.<br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Zero Latency.</span>
                </h1>
                <p class="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
                    Engineered for 99.999999999% durability. Secure, scalable object storage and managed databases for data-intensive applications.
                </p>
                
                <div class="flex flex-wrap gap-4 mt-10">
                    <router-link to="/s3/create-bucket" class="btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 px-8 py-4 text-sm tracking-wide">
                        Create Bucket
                    </router-link>
                    <router-link to="/rds/create" class="btn-secondary px-8 py-4 text-sm tracking-wide">
                        Provision Database
                    </router-link>
                    <router-link to="/s3/buckets" class="btn-secondary px-8 py-4 text-sm tracking-wide border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                        View Console &rarr;
                    </router-link>
                </div>
            </div>

            <!-- Feature Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-24">
                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Object Storage</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Scalable buckets with lifecycle rules, versioning, and intelligent tiering driven by access patterns.</p>
                </div>

                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div class="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Managed RDS</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">High-performance relational databases with automated backups, patching, and read-replica scaling.</p>
                </div>

                <div class="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                    <div class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Data Integrity</h3>
                    <p class="text-sm text-slate-400 leading-relaxed">Encryption at rest and in transit, with comprehensive IAM policies and audit logging.</p>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="border-t border-white/5 pt-16">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-12">
                     <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">11<span class="text-emerald-500">x9s</span></div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Durability</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">&infin;</div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Scalability</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">3<span class="text-emerald-500">ms</span></div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Latency</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold text-white font-display mb-2">Global</div>
                        <div class="text-xs font-semibold text-slate-500 uppercase tracking-widest">Replication</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
